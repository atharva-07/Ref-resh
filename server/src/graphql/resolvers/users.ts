import { ObjectId } from "mongodb";
import { Types } from "mongoose";

import Notification, {
  NotificationEvents,
  NotificationType,
} from "../../models/Notification";
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

enum FollowRequestStatus {
  FOLLOWED = "FOLLOWED",
  UNFOLLOWED = "UNFOLLOWED",
  REQUESTED = "REQUESTED",
  REMOVED = "REMOVED",
}

export const userQueries = {
  fetchUserProfile: async (_: any, { userName }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const loggedInUser = await User.findById(ctx.loggedInUserId, {
        blockedAccounts: 1,
      }).lean();
      const user = await User.findOne(
        { userName: userName },
        {
          email: 0,
          password: 0,
          followingRequests: 0,
        }
      );
      if (!user) throw newGqlError("User not found.", 404);
      const hasLoggedInUserBlocked = loggedInUser.blockedAccounts?.find(
        (x) => x.toString() === user._id.toString()
      );

      const isLoggedInUserBlocked = user?.blockedAccounts?.find(
        (x) => x.toString() === ctx.loggedInUserId.toString()
      );

      if (isLoggedInUserBlocked || hasLoggedInUserBlocked)
        throw newGqlError("Blocked/Forbidden", 403);
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
  fetchUserFollowers: async (
    _: any,
    { pageSize, after, userId }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findById(userId, { followers: 1 }).lean();

      if (!user || !user.followers || user.followers.length === 0) {
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        };
      }

      const followers = user.followers as Types.ObjectId[];
      let startFromIndex = 0;

      if (after) {
        startFromIndex = followers.findIndex((id) => id.toString() === after);
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

      const userIdsToFetch = followers.slice(
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

      const hasNextPage = startFromIndex + pageSize < followers.length;
      const endCursor = hasNextPage
        ? edges[edges.length - 1]?.cursor || null
        : null;

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const paginatedFollowers: PaginatedBasicUserData = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        data: paginatedFollowers,
        message: `Fetched ${pageSize} followers for user: ${userId}. Followers cursor: ${after}`,
      };

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  fetchUserFollowing: async (
    _: any,
    { pageSize, after, userId }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findById(userId, { following: 1 }).lean();

      if (!user || !user.following || user.following.length === 0) {
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        };
      }

      const following = user.following as Types.ObjectId[];
      let startFromIndex = 0;

      if (after) {
        startFromIndex = following.findIndex((id) => id.toString() === after);
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

      const userIdsToFetch = following.slice(
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

      const hasNextPage = startFromIndex + pageSize < following.length;
      const endCursor = hasNextPage
        ? edges[edges.length - 1]?.cursor || null
        : null;

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const paginatedFollowing: PaginatedBasicUserData = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        data: paginatedFollowing,
        message: `Fetched ${pageSize} following for user: ${userId}. Following cursor: ${after}`,
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
        message: "User's incoming following requests fetched successfully.",
        data: userFollowingRequests.followingRequests || [],
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchSentFollowRequests: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const userSentFollowingRequests = await User.find(
        {
          followingRequests: ctx.loggedInUserId,
        },
        {
          _id: 1,
          firstName: 1,
          lastName: 1,
          userName: 1,
          pfpPath: 1,
          bannerPath: 1,
          bio: 1,
        }
      );
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User-sent following requests fetched successfully.",
        data: userSentFollowingRequests,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchBlockedAccounts: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findById(ctx.loggedInUserId, {
        blockedAccounts: 1,
      });
      const userblockedAccounts = await user!.populate({
        path: "blockedAccounts",
        select: "_id userName firstName lastName pfpPath bannerPath bio",
      });
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User blocked accounts fetched successfully.",
        data: userblockedAccounts.followingRequests || [],
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
        user.dob!.setFullYear(new Date().getFullYear());
        const oneDay = 1000 * 60 * 60 * 24;
        const diff = Math.ceil(
          (user.dob!.getTime() - new Date().getTime()) / oneDay
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
          _id: 1,
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
        throw newGqlError("Blocked/Forbidden", 403);
      let action: FollowRequestStatus;
      if (targetUser.privateAccount) {
        const alreadyRequested = targetUser.followingRequests?.includes(
          ctx.loggedInUserId
        );
        // If follow request is already sent, then remove the request
        if (alreadyRequested) {
          targetUser.followingRequests!.pull(ctx.loggedInUserId);
          action = FollowRequestStatus.REMOVED;
        }
        // If request is not already sent, send it.
        else {
          targetUser.followingRequests!.push(ctx.loggedInUserId);
          action = FollowRequestStatus.REQUESTED;

          const newNotification = new Notification<NotificationType>({
            eventType: NotificationEvents.FOLLOW_REQUEST_RECEIVED,
            publisher: ctx.loggedInUserId,
            subscriber: targetUser._id,
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
          action = FollowRequestStatus.UNFOLLOWED;
        }
        // If not already following, follow.
        else {
          targetUser.followers!.push(ctx.loggedInUserId);
          loggedInUser?.following!.push(targetUser._id);
          action = FollowRequestStatus.FOLLOWED;

          const newNotification = new Notification<NotificationType>({
            eventType: NotificationEvents.FOLLOWED,
            publisher: ctx.loggedInUserId,
            subscriber: targetUser._id,
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
        await loggedInUser?.save();
      }

      await targetUser.save();
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: action,
        data: {
          _id: targetUser.id,
          status: action,
        },
      };
      console.log(response);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  acceptFollowRequest: async (_: any, { userId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const loggedInUser = await User.findById(ctx.loggedInUserId, {
        _id: 1,
        followers: 1,
        followingRequests: 1,
      });
      const requester = await User.findById(userId, { following: 1 });
      if (!requester) throw newGqlError("User not found.", 404);

      loggedInUser!.followers!.push(requester!._id);
      loggedInUser!.followingRequests?.pull(requester!._id);
      requester!.following!.push(ctx.loggedInUserId);
      await loggedInUser!.save();
      await requester!.save();

      const newNotification = new Notification<NotificationType>({
        eventType: NotificationEvents.FOLLOW_REQUEST_ACCEPTED,
        publisher: ctx.loggedInUserId,
        subscriber: requester._id,
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
  blockOrUnblockUser: async (_: any, { userId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const targetUser = await User.findById(new ObjectId(userId), {
        followers: 1,
        following: 1,
      });
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
  updateUserInfo: async (_: any, { userProfileData }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      if (userProfileData.userName) {
        const userId = await User.exists({
          userName: userProfileData.userName,
        });
        if (userId)
          throw newGqlError("Username not available (already taken).", 404);
      }

      const user = await User.findByIdAndUpdate(
        ctx.loggedInUserId,
        {
          firstName: userProfileData.firstName || undefined,
          lastName: userProfileData.lastName || undefined,
          userName: userProfileData.userName || undefined,
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
  setReadNotificationsAt: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findById(ctx.loggedInUserId);
      if (user) {
        user.readNotificationsAt = new Date();
        await user.save();
      }
      const response: HttpResponse = {
        success: true,
        code: 200,
        message:
          "User's Last Notification Read Timestamp updated successfully.",
        data: user?.readNotificationsAt,
      };
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
