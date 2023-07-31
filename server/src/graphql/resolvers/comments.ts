import Comment, { CommentType } from "../../models/Comment";
import { AppContext } from "../../server";
import validator from "validator";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";
import { Document } from "mongodb";

// const commentQueries = {
// };

// Can use Mongoose 'post save' middleware for notifications

export const commentMutations = {
  postComment: async (
    _: any,
    { content, postId, parentCommentId = null }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    if (validator.isEmpty(content))
      throw newGqlError("Comment body cannot be empty.", 422);
    try {
      const newComment: Document = await new Comment<CommentType>({
        content: content,
        post: postId,
        commenter: ctx.loggedInUserId,
        parentComment: parentCommentId,
      });
      await newComment.save();
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
        code: 201,
        message: "Comment posted successfully.",
        data: <Document>editableComment,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  likeOrUnlikeComment: async (_: any, { commentId }: any) => {
    try {
      return " ";
    } catch (error) {
      throw error;
    }
  },
  removeComment: async (_: any, { commentId }: any) => {
    try {
      // Remove child comments as well
      return " ";
    } catch (error) {
      throw error;
    }
  },
};
