import { Types } from "mongoose";

import User from "../../models/User";
import { AppContext } from "../../server";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";

export const userQueries = {
  fetchUserProfile: async (_: any, { userName }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findOne(
        { userName: userName },
        {
          email: 0,
          password: 0,
          followingRequests: 0,
          savedPosts: 0,
        }
      );
      const isLoggedInUserBlocked = user?.blockedAccounts?.find(
        (x) => ctx.loggedInUserId
      );
      if (isLoggedInUserBlocked) throw newGqlError("Forbidden", 403);
      if (!user) throw newGqlError("User not found.", 404);
      await user.populate({
        path: "followers following",
        select: "_id userName firstName lastName pfpPath",
      });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User fetched successfully.",
        data: user,
      };
      (<any>response.data).email = "Unretreivable";
      (<any>response.data).blockedAccounts = null;
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchUserFollowers: async (_: any, { userName }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findOne({ userName: userName }, { followers: 1 });
      if (!user) throw newGqlError("User not found.", 404);
      const userFollowers = await user.populate({
        path: "followers",
        select: "_id userName firstName lastName pfpPath bannerPath bio",
      });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User Followers fetched successfully.",
        data: userFollowers.followers || [],
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchUserFollowings: async (_: any, { userName }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findOne({ userName: userName }, { following: 1 });
      if (!user) throw newGqlError("User not found.", 404);
      const userFollowing = await user.populate({
        path: "following",
        select: "_id userName firstName lastName pfpPath bannerPath bio",
      });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User Following fetched successfully.",
        data: userFollowing.following || [],
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchIncomingFollowRequests: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findById(ctx.loggedInUserId, {
        followingRequests: 1,
      });
      const userFollowingRequests = await user!.populate({
        path: "followingRequests",
        select: "_id userName firstName lastName pfpPath bannerPath bio",
      });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User Following Requests fetched successfully.",
        data: userFollowingRequests.followingRequests || [],
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchUpcomingBirthdays: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const userData = await User.findById(ctx.loggedInUserId, {
        following: 1,
      }).lean();
      const userFollowingsArray = userData.following;
      const userFollowingsData = await User.find(
        { _id: { $in: userFollowingsArray } },
        "_id userName firstName lastName dob pfpPath bannerPath bio"
      ).lean();
      // Users with birthdays in next 7 days (inclusive of current date)
      const usersWithUpcomingBirthdays = [];
      for (const user of userFollowingsData) {
        user.dob.setFullYear(new Date().getFullYear());
        const oneDay = 1000 * 60 * 60 * 24;
        const diff = Math.ceil(
          (user.dob.getTime() - new Date().getTime()) / oneDay
        );
        if (diff <= 7 && diff >= 0) usersWithUpcomingBirthdays.push(user);
      }
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Upcoming Birthdays of user's following fetched successfully.",
        data: usersWithUpcomingBirthdays,
      };
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export const userMutations = {
  followOrUnfollowUser: async (_: any, { userName }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const targetUser = await User.findOne(
        { userName: userName },
        {
          privateAccount: 1,
          followers: 1,
          following: 1,
          followingRequests: 1,
          blockedAccounts: 1,
        }
      );
      if (!targetUser) throw newGqlError("User not found", 404);
      if (targetUser._id.equals(ctx.loggedInUserId))
        throw newGqlError("Not Allowed.", 405);
      if (targetUser.blockedAccounts?.includes(ctx.loggedInUserId))
        throw newGqlError("Forbidden", 403);
      let action: string = " ";
      if (targetUser.privateAccount) {
        const alreadyRequested = targetUser.followingRequests?.includes(
          ctx.loggedInUserId
        );
        // If follow request is already sent, then remove the request
        if (alreadyRequested) {
          targetUser.followingRequests!.pull(ctx.loggedInUserId);
          action = "Request Removed.";
        }
        // If request is not already sent, send it.
        else {
          targetUser.followingRequests!.push(ctx.loggedInUserId);
          action = "Request Sent.";
        }
      } else {
        const alreadyFollowing = targetUser.followers?.includes(
          ctx.loggedInUserId
        );
        const loggedInUser = await User.findById(ctx.loggedInUserId, {
          following: 1,
        });
        // If already following, unfollow.
        if (alreadyFollowing) {
          targetUser.followers!.pull(ctx.loggedInUserId);
          loggedInUser?.following!.pull(targetUser._id);
          action = "Unfollowed.";
        }
        // If not already following, follow.
        else {
          targetUser.followers!.push(ctx.loggedInUserId);
          loggedInUser?.following!.push(targetUser._id);
          action = "Started Following.";
        }
        await loggedInUser?.save();
      }
      // Implement Notifications later: FOLLOW_REQUEST_RECEIVED
      await targetUser.save();
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: action,
        data: targetUser.id,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  acceptFollowRequest: async (_: any, { userId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const loggedInUser = await User.findById(ctx.loggedInUserId, {
        followers: 1,
        followingRequests: 1,
      });
      const requester = await User.findById(userId, { following: 1 });
      loggedInUser!.followers!.push(requester!._id);
      loggedInUser!.followingRequests?.pull(requester!._id);
      requester!.following!.push(ctx.loggedInUserId);
      await loggedInUser!.save();
      await requester!.save();
      // Implement Notifications later: FOLLOW_REQUEST_ACCEPTED
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Request Accepted.",
        data: requester!._id,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  rejectFollowRequest: async (_: any, { userId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const loggedInUser = await User.findById(ctx.loggedInUserId, {
        followingRequests: 1,
      });
      const requesterId: Types.ObjectId = <Types.ObjectId>userId;
      loggedInUser!.followingRequests?.pull(requesterId);
      await loggedInUser!.save();
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Request Rejected.",
        data: requesterId,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  blockOrUnblockUser: async (_: any, { userName }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const targetUser = await User.findOne(
        { userName: userName },
        { followers: 1, following: 1 }
      );
      if (!targetUser) throw newGqlError("User not found.", 404);
      const targetUserId = targetUser._id;
      const loggedInUser = await User.findById(ctx.loggedInUserId, {
        blockedAccounts: 1,
        followers: 1,
        following: 1,
      });
      const isTargetUserAlreadyBlocked =
        loggedInUser?.blockedAccounts?.includes(targetUserId);
      // If targetUser is already blocked, unblock;
      if (isTargetUserAlreadyBlocked) {
        loggedInUser?.blockedAccounts?.pull(targetUserId);
      }
      // If we have not blocked yet but wish to do so, block.
      else {
        loggedInUser?.blockedAccounts?.push(targetUserId);
        loggedInUser?.followers?.pull(targetUserId);
        loggedInUser?.following?.pull(targetUserId);
        targetUser.followers?.pull(ctx.loggedInUserId);
        targetUser.following?.pull(ctx.loggedInUserId);
      }
      await loggedInUser?.save();
      await targetUser.save();
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: isTargetUserAlreadyBlocked
          ? "User Unblocked."
          : "User Blocked.",
        data: targetUserId,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateUserProfile: async (
    _: any,
    { userProfileData }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findByIdAndUpdate(
        ctx.loggedInUserId,
        {
          pfpPath: userProfileData.pfpPath || undefined,
          bannerPath: userProfileData.bannerPath || undefined,
          bio: userProfileData.bio || undefined,
        },
        {
          new: true,
          lean: true,
          select: "_id firstName lastName userName pfpPath bannerPath bio",
        }
      );
      const updatedUserData = { ...user };
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User Profile updated successfully.",
        data: updatedUserData,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
