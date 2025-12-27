import Comment from "../../models/Comment.js";
import Post from "../../models/Post.js";
import User from "../../models/User.js";
import { AppContext } from "../../server.js";
import logger from "../../utils/winston.js";
import { checkAuthorization, newGqlError } from "../utility-functions.js";
import { HttpResponse } from "../utility-types.js";

export const searchQueries = {
  searchLikesOnPost: async (
    _: any,
    { searchQuery, postId }: any,
    ctx: AppContext,
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      if (searchQuery === "" || searchQuery.length < 3)
        throw newGqlError("Search Query is too short.", 404);

      const post = await Post.findById(postId)
        .populate({
          path: "likes",
          match: {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchQuery,
                options: "i",
              },
            },
          },
          select: "_id firstName lastName userName pfpPath bannerPath bio",
        })
        .lean()
        .limit(10)
        .exec();
      if (!post) throw newGqlError("Post not found.", 404);

      const matchingLikes = post.likes;

      const response: HttpResponse = {
        success: true,
        code: 200,
        data: matchingLikes,
        message: `Matching likes fetched. SearchQuery: ${searchQuery}, Post: ${postId}`,
      };

      logger.debug(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchLikesOnComment: async (
    _: any,
    { searchQuery, commentId }: any,
    ctx: AppContext,
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      if (searchQuery === "" || searchQuery.length < 3)
        throw newGqlError("Search Query is too short.", 404);

      const comment = await Comment.findById(commentId)
        .populate({
          path: "likes",
          match: {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchQuery,
                options: "i",
              },
            },
          },
          select: "_id firstName lastName userName pfpPath bannerPath bio",
        })
        .lean()
        .limit(10)
        .exec();
      if (!comment) throw newGqlError("Comment not found.", 404);

      const matchingLikes = comment.likes;

      const response: HttpResponse = {
        success: true,
        code: 200,
        data: matchingLikes,
        message: `Matching likes fetched. SearchQuery: ${searchQuery}, Comment: ${commentId}`,
      };

      logger.debug(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchUserFollowers: async (
    _: any,
    { searchQuery, userId }: any,
    ctx: AppContext,
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      if (searchQuery === "" || searchQuery.length < 3)
        throw newGqlError("Search Query is too short.", 404);

      const user = await User.findById(userId)
        .populate({
          path: "followers",
          match: {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchQuery,
                options: "i",
              },
            },
          },
          select: "_id firstName lastName userName pfpPath bannerPath bio",
        })
        .lean()
        .limit(10)
        .exec();
      if (!user) throw newGqlError("User not found.", 404);

      const matchingFollowers = user.followers;

      const response: HttpResponse = {
        success: true,
        code: 200,
        data: matchingFollowers,
        message: `Matching user followers fetched. SearchQuery: ${searchQuery}, User: ${userId}`,
      };

      logger.debug(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchUserFollowing: async (
    _: any,
    { searchQuery, userId }: any,
    ctx: AppContext,
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      if (searchQuery === "" || searchQuery.length < 3)
        throw newGqlError("Search Query is too short.", 404);

      const user = await User.findById(userId)
        .populate({
          path: "following",
          match: {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: searchQuery,
                options: "i",
              },
            },
          },
          select: "_id firstName lastName userName pfpPath bannerPath bio",
        })
        .lean()
        .limit(10)
        .exec();
      if (!user) throw newGqlError("User not found.", 404);

      const matchingFollowing = user.following;

      const response: HttpResponse = {
        success: true,
        code: 200,
        data: matchingFollowing,
        message: `Matching user following fetched. SearchQuery: ${searchQuery}, User: ${userId}`,
      };

      logger.debug(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchUsers: async (_: any, { searchQuery }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      if (searchQuery === "" || searchQuery.length < 3)
        throw newGqlError("Search Query is too short.", 404);

      const users = await User.find({
        $expr: {
          $regexMatch: {
            input: { $concat: ["$firstName", " ", "$lastName"] },
            regex: searchQuery,
            options: "i",
          },
        },
      })
        .select("_id firstName lastName userName pfpPath bannerPath bio")
        .lean()
        .limit(10)
        .exec();

      if (!users) throw newGqlError("User not found.", 404);

      const response: HttpResponse = {
        success: true,
        code: 200,
        data: users,
        message: `Matching users fetched. SearchQuery: ${searchQuery}`,
      };

      logger.debug(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchPosts: async (_: any, { searchQuery }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      if (searchQuery === "" || searchQuery.length < 3)
        throw newGqlError("Search Query is too short.", 404);

      const posts = await Post.find({
        content: { $regex: searchQuery, $options: "i" },
      })
        .populate({
          path: "author",
          select: "_id firstName lastName userName pfpPath bannerPath bio",
        })
        .select("_id content author")
        .lean()
        .limit(10)
        .exec();

      if (!posts) throw newGqlError("Posts not found.", 404);

      const response: HttpResponse = {
        success: true,
        code: 200,
        data: posts,
        message: `Matching posts fetched. SearchQuery: ${searchQuery}`,
      };

      logger.debug(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
