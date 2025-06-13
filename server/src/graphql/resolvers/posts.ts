import { Document, ObjectId } from "mongodb";
import { PipelineStage, Types } from "mongoose";
import validator from "validator";

import Comment from "../../models/Comment";
import Notification, {
  NotificationEvents,
  NotificationType,
} from "../../models/Notification";
import Post, { PostType } from "../../models/Post";
import User from "../../models/User";
import { AppContext } from "../../server";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";

interface PostEdge {
  node: PostType;
  cursor: string;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface Feed {
  edges: PostEdge[];
  pageInfo: PageInfo;
}

const RECENCY_WEIGHT = 0.5;
const POPULARITY_WEIGHT = 0.3;
const ENGAGEMENT_WEIGHT = 0.2;

export const postQueries = {
  loadFeed: async (_: any, { pageSize, after }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const { following } = await User.findById(ctx.loggedInUserId, {
        _id: 0,
        following: 1,
      }).lean();

      const postProjectionPaths: { [key: string]: 1 } = {};
      Object.keys(Post.schema.paths).forEach((path) => {
        if (path !== "author" && path !== "__v") {
          postProjectionPaths[path] = 1;
        }
      });

      // This is a global max. We need this for normalisation of Engagement Score of all posts
      const maxInteractionsResult = await Post.aggregate<{
        _id: null;
        maxInteractions: number;
      }>([
        {
          $group: {
            _id: null,
            maxInteractions: { $max: { $add: ["$likes", "$comments"] } },
          },
        },
      ]).exec();

      const maxInteractions =
        maxInteractionsResult.length > 0 &&
        maxInteractionsResult[0].maxInteractions > 0
          ? maxInteractionsResult[0].maxInteractions
          : 1; // Avoid division by zero, ensure at least 1

      const aggregate = Post.aggregate().match({
        author: { $in: following },
      });

      if (after) {
        aggregate.match({ _id: { $gt: new ObjectId(after) } });
      }

      aggregate
        .addFields({
          recencyScore: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24 * 7,
            ],
          },
        })
        .addFields({
          popularityScore: { $add: [{ $size: "$likes" }, "$commentsCount"] },
        })
        .addFields({
          engagementScore: {
            $divide: [
              {
                $add: [{ $size: "$likes" }, "$commentsCount"],
              },
              maxInteractions,
            ],
          },
        })
        .addFields({
          combinedScore: {
            $add: [
              { $multiply: ["$recencyScore", RECENCY_WEIGHT] },
              { $multiply: ["$popularityScore", POPULARITY_WEIGHT] },
              { $multiply: ["$engagementScore", ENGAGEMENT_WEIGHT] },
            ],
          },
        })
        .sort({ combinedScore: -1 })
        .limit(pageSize)
        .lookup({
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        })
        .unwind("$author")
        .project({
          ...postProjectionPaths,
          "author._id": 1,
          "author.userName": 1,
          "author.firstName": 1,
          "author.lastName": 1,
          "author.pfpPath": 1,
        });

      const posts = await aggregate.exec();

      const countQuery: any = {
        author: { $in: following },
      };
      if (after) {
        countQuery._id = { $gt: new ObjectId(after) };
      }

      const totalDocumentsAfterCursor = await Post.countDocuments(
        countQuery
      ).exec();
      const hasNextPage = totalDocumentsAfterCursor > posts.length;

      const endCursor =
        posts.length > 0 ? posts[posts.length - 1]._id.toHexString() : null;

      const edges: PostEdge[] = posts.map((post) => ({
        node: post,
        cursor: post._id.toHexString(),
      }));

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const feed: Feed = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Feed fetched successfully.",
        data: feed,
      };
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  fetchUserPosts: async (_: any, { userName }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const authorId = await User.findOne({ userName: userName }).select("_id");
      if (!authorId) throw newGqlError("User not found.", 404);
      const posts = await Post.find({ author: authorId })
        .sort({ createdAt: -1 })
        .populate({
          path: "author",
          select: "_id userName firstName lastName pfpPath",
        });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User's posts fetched successfully.",
        data: posts,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchSinglePost: async (_: any, { postId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const post = await Post.findById(postId);
      await post!.populate({
        path: "author likes",
        select: "_id userName firstName lastName pfpPath",
      });
      if (!post) throw newGqlError("Post not found.", 404);
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Post fetched successfully.",
        data: post,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const postMutations = {
  createPost: async (_: any, { postData }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    if (validator.isEmpty(postData.content))
      throw newGqlError("Post caption cannot be empty.", 422);
    try {
      const post: Document = new Post<PostType>({
        content: postData.content,
        images: postData.images || [],
        author: ctx.loggedInUserId,
      });
      const newPost: Document = await post.populate("author");
      await newPost.save();
      const response: HttpResponse = {
        success: true,
        code: 201,
        message: "Post created successfully.",
        data: newPost,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  editPost: async (_: any, { postId, postData }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    if (validator.isEmpty(postData.content))
      throw newGqlError("Post caption cannot be empty", 422);
    try {
      const editablePost = await Post.findById(postId);
      if (editablePost) {
        editablePost.content = postData.content;
        editablePost.edited = true;
        if (postData.images)
          postData.images.forEach((val: string) => {
            editablePost.images?.push(val);
          });
      } else {
        throw newGqlError("Post not found.", 404);
      }
      await editablePost.save();
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Post edited successfully.",
        data: editablePost,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  likeOrUnlikePost: async (_: any, { postId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const post = await Post.findById(postId);
      if (post) {
        const alreadyLiked = post.likes?.find((val: Types.ObjectId) =>
          val.equals(ctx.loggedInUserId)
        );
        if (alreadyLiked) {
          post.likes?.pull(ctx.loggedInUserId);
        } else {
          post.likes?.push(ctx.loggedInUserId);
          if (!post.author._id.equals(ctx.loggedInUserId)) {
            const newNotification = new Notification<NotificationType>({
              eventType: NotificationEvents.LIKED_POST,
              publisher: ctx.loggedInUserId,
              subscriber: post.author._id,
              redirectionURL: `/post/${postId}`,
            });
            await newNotification.save();
          }
        }
        await post.save();
        const response: HttpResponse = {
          success: true,
          code: 200,
          message: alreadyLiked
            ? "Post unliked successfully."
            : "Post liked successfully.",
          data: post.id,
        };
        return response.data;
      } else {
        throw newGqlError("Post not found.", 404);
      }
    } catch (error) {
      throw error;
    }
  },
  removePost: async (_: any, { postId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const deletedPost = await Post.findByIdAndDelete(postId);
      await Comment.deleteMany({ post: postId });
      if (deletedPost) {
        const response: HttpResponse = {
          success: true,
          code: 200,
          message: "Post and associated comments deleted successfully.",
          data: deletedPost.id,
        };
        return response.data;
      } else {
        throw newGqlError("Post not found.", 404);
      }
    } catch (error) {
      throw error;
    }
  },
};
