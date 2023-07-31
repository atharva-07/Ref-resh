import { Document } from "mongodb";
import validator from "validator";
import Post, { PostType } from "../../models/Post";
import { AppContext } from "../../server";
import { HttpResponse } from "../utility-types";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import Comment from "../../models/Comment";

export const postQueries = {
  loadFeed: async (_: any, __: any, ctx: AppContext) => {
    try {
      // Load Posts
      // Load Stories
      // Load Upcoming Birthdays
      const posts = await Post.find();
      return posts;
    } catch (error) {
      throw error;
    }
  },
  fetchUserPosts: async (_: any, { userName }: any, ctx: AppContext) => {
    try {
      const posts = await Post.find();
      return posts;
    } catch (error) {
      throw error;
    }
  },
  fetchSinglePost: async (_: any, { postId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const postComponents = [
        Post.findById(postId),
        Comment.find({ post: postId }),
      ];
      const post = await Promise.allSettled(postComponents);
      console.log(post);
      if (!post) throw newGqlError("Post not found.", 404);
      const response: HttpResponse = {
        success: true,
        code: 201,
        message: "Post fetched successfully.",
        data: post,
      };
      // Have to fetch  comments and shit.
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
        console.log(alreadyLiked);
        if (alreadyLiked) {
          post.likes?.pull(ctx.loggedInUserId);
          if (post.author._id.equals(ctx.loggedInUserId)) {
            // If authot isn't the one liking, trigger notification.
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
      // Remove all comments of this post as well.
      if (deletedPost) {
        const response: HttpResponse = {
          success: true,
          code: 200,
          message: "Post deleted successfully.",
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
