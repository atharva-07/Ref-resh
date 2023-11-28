import { Document } from "mongodb";
import { Types } from "mongoose";
import validator from "validator";

import Comment, { CommentType } from "../../models/Comment";
import Post from "../../models/Post";
import { AppContext } from "../../server";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";

export const commentQueries = {
  fetchTopLevelComments: async (_: any, { postId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const comments = await Comment.find({
        post: postId,
        parentComment: null,
        topLevelComment: null,
      }).populate({
        path: "commenter",
        select: "_id userName firstName lastName pfpPath",
      });
      console.log(comments);
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Top-Level comments fetched successfully.",
        data: comments,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchChildComments: async (
    _: any,
    { postId, commentId }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const comments = await Comment.find({
        post: postId,
        parentComment: commentId,
      }).populate({
        path: "commenter",
        select: "_id userName firstName lastName pfpPath",
      });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Child comments fetched successfully.",
        data: comments,
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
    { content, postId, parentCommentId = null, topLevelCommentId = null }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    if (validator.isEmpty(content))
      throw newGqlError("Comment body cannot be empty.", 422);
    try {
      const newComment: Document = new Comment<CommentType>({
        content: content,
        post: postId,
        commenter: ctx.loggedInUserId,
        parentComment: parentCommentId || null,
        topLevelComment: topLevelCommentId || null,
      });
      // Implement Notifications later: COMMENTED_ON_POST [OR] REPLIED_TO_COMMENT
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
      await editableComment!.save();
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Comment edited successfully.",
        data: <Document>editableComment,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  likeOrUnlikeComment: async (_: any, { commentId }: any, ctx: AppContext) => {
    try {
      const comment = await Comment.findById(commentId);
      if (comment) {
        const alreadyLiked = comment.likes?.find((val: Types.ObjectId) =>
          val.equals(ctx.loggedInUserId)
        );
        if (alreadyLiked) {
          comment.likes?.pull(ctx.loggedInUserId);
          if (comment.commenter._id.equals(ctx.loggedInUserId)) {
            // Implement Notifications later: LIKED_COMMENT
          }
        } else {
          comment.likes?.push(ctx.loggedInUserId);
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
        throw newGqlError("Post not found.", 404);
      }
    } catch (error) {
      throw error;
    }
  },
  removeComment: async (_: any, { postId, commentId }: any) => {
    try {
      const deletedTopLevelComment = await Comment.findByIdAndDelete(commentId);
      const deletedTopLevelCommentId = deletedTopLevelComment?._id;
      const deletedChildComments = await Comment.deleteMany({
        topLevelComment: deletedTopLevelCommentId,
      });
      const totalCommentsDeleted = 1 + deletedChildComments.deletedCount;
      await Post.findByIdAndUpdate(postId, {
        $inc: { commentsCount: -totalCommentsDeleted },
      });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Comments including child comments deleted successfully.",
        data: deletedTopLevelComment!.id,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
