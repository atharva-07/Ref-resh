import { GraphQLError } from "graphql";
import User from "../../models/User";
import { AppContext } from "../../server";

export const userQueries = {
  fetchUserProfile: async (_: any, { userName }: any) => {
    // Check whether the user is blocked. Print message accordingly in client.
    // get user data
    try {
      const user = await User.findOne();
      return user;
    } catch (error) {
      throw error;
    }
  },
  fetchUserFollowers: async (_: any, { userName }: any) => {
    try {
      const userFollowers = await User.find();
      return userFollowers;
    } catch (error) {
      throw error;
    }
  },
  fetchUserFollowings: async (_: any, { userName }: any) => {
    try {
      const userFollowing = await User.find();
      return userFollowing;
    } catch (error) {
      throw error;
    }
  },
  fetchUpcomingBirthdays: async (_: any, __: any, ctx: AppContext) => {
    // Fetch birthdays of followings coming in next 7 days
    // This should be loaded with feed
    try {
      const usersWithUpcomingBirthdays = await User.find();
      return usersWithUpcomingBirthdays;
    } catch (error) {
      throw error;
    }
  },
};

export const userMutations = {
  followUser: async (_: any, { userName }: any, ctx: AppContext) => {
    // Check target user's accounnt type (private or public)
    // Public: Directly add source userId in target users's followers array
    // Private: add source userId in target users's incomingFollowRequests array
    try {
      return " ";
    } catch (error) {
      throw error;
    }
  },
  unfollowUser: async (_: any, { userName }: any, ctx: AppContext) => {
    try {
      return " ";
    } catch (error) {
      throw error;
    }
  },
  blockUser: async (_: any, { userName }: any, ctx: AppContext) => {
    // Remove this userId from followers and following array
    // Add userId into blockedAccounts array
    try {
      return " ";
    } catch (error) {
      throw error;
    }
  },
  unblockUser: async (_: any, { userName }: any, ctx: AppContext) => {
    // Remove userId from blockedAccounts array
    try {
      return " ";
    } catch (error) {
      throw error;
    }
  },
  updateUserProfile: async (_: any, { userProfileData }: any) => {
    try {
      return {};
    } catch (error) {
      throw error;
    }
  },
};
