import { Document } from "mongodb";
import { Types } from "mongoose";
import validator from "validator";

import Comment from "../../models/Comment";
import Post, { PostType } from "../../models/Post";
import User from "../../models/User";
import { AppContext } from "../../server";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";

export const postQueries = {
  loadFeed: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const userData = await User.findById(ctx.loggedInUserId, {
        following: 1,
      }).lean();
      const userFollowingsArray = userData.following;
      const posts = await Post.find({ author: { $in: userFollowingsArray } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: "author",
          select: "_id userName firstName lastName pfpPath",
        });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Feed's posts fetched successfully.",
        data: posts,
      };
      return response.data;
    } catch (error) {
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
          if (!post.author._id.equals(ctx.loggedInUserId)) {
            // Implement Notifications later: LIKED_POST
          }
        } else {
          post.likes?.push(ctx.loggedInUserId);
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
