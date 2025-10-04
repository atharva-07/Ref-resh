import { Document } from "mongodb";
import { Types } from "mongoose";
import validator from "validator";

import Comment, { CommentType } from "../../models/Comment";
import Notification, {
  NotificationEvents,
  NotificationType,
} from "../../models/Notification";
import Post from "../../models/Post";
import User from "../../models/User";
import { AppContext, sseClients } from "../../server";
import { sendNotification } from "../../utils/sse";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";
import {
  BasicUserData,
  BasicUserDataEdge,
  PageInfo,
  PaginatedBasicUserData,
} from "./posts";

interface CommentEdge {
  node: CommentType;
  cursor: string;
}

interface CommentFeed {
  edges: CommentEdge[];
  pageInfo: PageInfo;
}

const commentProjectionPaths: { [key: string]: 1 } = {};
Object.keys(Comment.schema.paths).forEach((path) => {
  if (path !== "author" && path !== "parentComment" && path !== "__v") {
    commentProjectionPaths[path] = 1;
  }
});

export const commentQueries = {
  fetchParentCommentsRecursively: async (
    _: any,
    { commentId }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const aggreagate = Comment.aggregate()
        .match({
          _id: new Types.ObjectId(commentId),
        })
        .graphLookup({
          from: "comments",
          startWith: "$parentComment",
          connectFromField: "parentComment",
          connectToField: "_id",
          as: "allComments",
          maxDepth: 10,
        })
        .addFields({
          allComments: {
            $concatArrays: ["$allComments", ["$$ROOT"]],
          },
        })
        .unwind("$allComments")
        .lookup({
          from: "users",
          localField: "allComments.author",
          foreignField: "_id",
          as: "allComments.author",
        })
        .unwind("$allComments.author")
        .lookup({
          from: "users",
          localField: "allComments.likes",
          foreignField: "_id",
          as: "allComments.likes",
        })
        .lookup({
          from: "comments",
          localField: "allComments._id",
          foreignField: "parentComment",
          as: "allComments.childComments",
        })
        .addFields({
          "allComments.commentsCount": { $size: "$allComments.childComments" },
        })
        .project({
          "allComments.childComments": 0,
        })
        .lookup({
          from: "posts",
          localField: "allComments.post",
          foreignField: "_id",
          as: "post",
        })
        .unwind("$post")
        .lookup({
          from: "users",
          localField: "post.author",
          foreignField: "_id",
          as: "post.author",
        })
        .unwind("$post.author")
        .group({
          _id: null,
          allComments: {
            $push: "$allComments",
          },
          post: { $first: "$post" },
        })
        .project({
          _id: 0,
          allComments: {
            $sortArray: {
              input: {
                $map: {
                  input: "$allComments",
                  as: "comment",
                  in: {
                    _id: "$$comment._id",
                    content: "$$comment.content",
                    post: "$$comment.post",
                    edited: "$$comment.edited",
                    likes: "$$comment.likes",
                    commentsCount: "$$comment.commentsCount",
                    author: {
                      _id: "$$comment.author._id",
                      userName: "$$comment.author.userName",
                      firstName: "$$comment.author.firstName",
                      lastName: "$$comment.author.lastName",
                      pfpPath: "$$comment.author.pfpPath",
                    },
                    createdAt: "$$comment.createdAt",
                    updatedAt: "$$comment.updatedAt",
                  },
                },
              },
              sortBy: { createdAt: 1 },
            },
          },
          post: {
            _id: "$post._id",
            content: "$post.content",
            images: "$post.images",
            likes: "$post.likes",
            edited: "$post.edited",
            commentsCount: "$post.commentsCount",
            author: {
              _id: "$post.author._id",
              userName: "$post.author.userName",
              firstName: "$post.author.firstName",
              lastName: "$post.author.lastName",
              pfpPath: "$post.author.pfpPath",
            },
            createdAt: "$post.createdAt",
            updatedAt: "$post.updatedAt",
          },
        });

      const comments = await aggreagate.exec();

      const commentsWithPost = {
        post: comments[0].post,
        comments: comments[0].allComments,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Comments fetched successfully.",
        data: commentsWithPost,
      };

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchChildComments: async (
    _: any,
    { pageSize, after, postId, commentId }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      if (!postId && !commentId)
        throw newGqlError("Post ID or Comment ID is required.", 400);

      if (postId && commentId)
        throw newGqlError("Provide either Post ID or Comment ID.", 400);

      if (postId) {
        const post = await Post.exists({ _id: postId });
        if (!post) throw newGqlError("Post not found.", 404);
      }

      let comment: Document | null = null;
      if (commentId) {
        comment = await Comment.findOne({ _id: commentId });
        if (!comment) throw newGqlError("Comment not found.", 404);
      }

      const aggregate = Comment.aggregate();

      let query: any = {};
      if (postId && !commentId) {
        query = {
          post: new Types.ObjectId(postId),
          parentComment: null,
        };
        aggregate.match(query);
      }

      if (!postId && commentId && comment) {
        query = {
          post: comment.post,
          parentComment: new Types.ObjectId(commentId),
        };
        aggregate.match(query);
      }

      if (after) {
        aggregate.match({ _id: { $lt: new Types.ObjectId(after) } });
      }

      aggregate
        .sort({ _id: -1 })
        .limit(pageSize)
        .lookup({
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        })
        .unwind("$author")
        .lookup({
          from: "comments",
          localField: "_id",
          foreignField: "parentComment",
          as: "childComments",
        })
        .project({
          ...commentProjectionPaths,
          commentsCount: { $size: "$childComments" },
          "author._id": 1,
          "author.userName": 1,
          "author.firstName": 1,
          "author.lastName": 1,
          "author.pfpPath": 1,
        });

      const comments = await aggregate.exec();

      if (after) {
        query._id = { $lt: new Types.ObjectId(after) };
      }

      const totalDocumentsAfterCursor = await Comment.countDocuments(
        query
      ).exec();

      const hasNextPage = totalDocumentsAfterCursor > comments.length;

      const endCursor =
        comments.length > 0 ? comments[comments.length - 1]._id : null;

      const edges: CommentEdge[] = comments.map((comment) => ({
        node: comment,
        cursor: comment._id,
      }));

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const feed: CommentFeed = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Child comments fetched successfully.",
        data: feed,
      };

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchLikesFromComment: async (
    _: any,
    { pageSize, after, commentId }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const comment = await Comment.findById(commentId, { likes: 1 }).lean();

      if (!comment || !comment.likes || comment.likes.length === 0) {
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        };
      }

      const likes = comment.likes as Types.ObjectId[];
      let startFromIndex = 0;

      if (after) {
        startFromIndex = likes.findIndex((id) => id.toString() === after);
        if (startFromIndex !== -1) {
          startFromIndex += 1;
        } else {
          return {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          };
        }
      }

      const userIdsToFetch = likes.slice(
        startFromIndex,
        startFromIndex + pageSize
      );

      const users = (await User.find({
        _id: { $in: userIdsToFetch },
      })
        .select("_id firstName lastName userName pfpPath bannerPath bio")
        .lean()) as BasicUserData[];

      const edges: BasicUserDataEdge[] = users.map((user) => ({
        node: user,
        cursor: user._id.toString(),
      }));

      const hasNextPage = startFromIndex + pageSize < likes.length;
      const endCursor = hasNextPage
        ? edges[edges.length - 1]?.cursor || null
        : null;

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const paginatedLikes: PaginatedBasicUserData = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        data: paginatedLikes,
        message: `Fetched ${pageSize} likes from comment: ${comment}. Likes cursor: ${after}`,
      };

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Can use Mongoose 'post save' middleware for notifications

export const commentMutations = {
  postComment: async (
    _: any,
    { commentData: { content, postId, parentCommentId = null } }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    if (validator.isEmpty(content))
      throw newGqlError("Comment body cannot be empty.", 422);
    try {
      const post = await Post.findOne({ _id: postId });
      if (!post) throw newGqlError("Post not found.", 404);
      const postAuthor = post.author;

      let parentCommentAuthor: Types.ObjectId | null = null;
      if (parentCommentId) {
        const comment = await Comment.findOne({ _id: parentCommentId });
        if (!comment) throw newGqlError("Parent comment not found.", 404);
        parentCommentAuthor = comment.author;
      }

      const comment: Document = new Comment<CommentType>({
        content: content,
        post: postId,
        author: ctx.loggedInUserId,
        parentComment: parentCommentId || null,
      });
      const newComment: Document = await comment.populate("author");

      // Notification for the author of the post
      if (!postAuthor.equals(ctx.loggedInUserId)) {
        const newNotification = new Notification<NotificationType>({
          eventType: NotificationEvents.COMMENTED_ON_POST,
          publisher: ctx.loggedInUserId,
          subscriber: postAuthor,
          redirectionURL: `/post/${postId}`,
        });
        const result = await newNotification.save();
        await result.populate({
          path: "publisher",
          select: "_id firstName lastName userName pfpPath",
        });
        sendNotification(
          result._id.toString(),
          result.eventType,
          result.publisher as unknown as BasicUserData,
          result.subscriber.toString(),
          sseClients
        );
      }

      // Notification for the author of the parent comment
      if (
        parentCommentId &&
        parentCommentAuthor &&
        !parentCommentAuthor.equals(ctx.loggedInUserId)
        // && !newComment.author._id.equals(ctx.loggedInUserId)
      ) {
        const newNotification = new Notification<NotificationType>({
          eventType: NotificationEvents.REPLIED_TO_COMMENT,
          publisher: ctx.loggedInUserId,
          subscriber: parentCommentAuthor,
          redirectionURL: `/comment/${parentCommentId}`,
        });
        const result = await newNotification.save();
        await result.populate({
          path: "publisher",
          select: "_id firstName lastName userName pfpPath",
        });
        sendNotification(
          result._id.toString(),
          result.eventType,
          result.publisher as unknown as BasicUserData,
          result.subscriber.toString(),
          sseClients
        );
      }

      await newComment.save();
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
      const response: HttpResponse = {
        success: true,
        code: 201,
        message: "Comment posted successfully.",
        data: newComment,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  editComment: async (_: any, { content, commentId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    if (validator.isEmpty(content))
      throw newGqlError("Comment body cannot be empty.", 422);
    try {
      const editableComment = await Comment.findById(commentId);
      editableComment!.content = content;
      editableComment!.edited = true;
      const result = await editableComment!.save();
      await result.populate("likes author");
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Comment edited successfully.",
        data: result,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  likeOrUnlikeComment: async (_: any, { commentId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const comment = await Comment.findById(commentId);
      if (comment) {
        const alreadyLiked = comment.likes?.find((val: Types.ObjectId) =>
          val.equals(ctx.loggedInUserId)
        );
        if (alreadyLiked) {
          comment.likes?.pull(ctx.loggedInUserId);
        } else {
          comment.likes?.push(ctx.loggedInUserId);
          if (!comment.author._id.equals(ctx.loggedInUserId)) {
            // Implement Notifications later: LIKED_COMMENT
            const newNotification = new Notification<NotificationType>({
              eventType: NotificationEvents.LIKED_COMMENT,
              publisher: ctx.loggedInUserId,
              subscriber: comment.author._id,
              redirectionURL: `/comment/${commentId}`,
            });
            const result = await newNotification.save();
            await result.populate({
              path: "publisher",
              select: "_id firstName lastName userName pfpPath",
            });
            sendNotification(
              result._id.toString(),
              result.eventType,
              result.publisher as unknown as BasicUserData,
              result.subscriber.toString(),
              sseClients
            );
          }
        }
        await comment.save();
        const response: HttpResponse = {
          success: true,
          code: 200,
          message: alreadyLiked
            ? "Comment unliked successfully."
            : "Comment liked successfully.",
          data: comment.id,
        };
        return response.data;
      } else {
        throw newGqlError("Comment not found.", 404);
      }
    } catch (error) {
      throw error;
    }
  },
  removeComment: async (_: any, { postId, commentId }: any) => {
    try {
      const deletedComment = await Comment.findByIdAndDelete(commentId);
      if (!deletedComment) throw newGqlError("Comment not found.", 404);
      await Post.findByIdAndUpdate(postId, {
        $inc: { commentsCount: -1 },
      });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Comment deleted successfully.",
        data: deletedComment!.id,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
