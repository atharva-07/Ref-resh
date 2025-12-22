import { Document, ObjectId } from "mongodb";
import validator from "validator";

import Story, { StoryType } from "../../models/Story";
import User from "../../models/User";
import { AppContext } from "../../server";
import logger from "../../utils/winston";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";
import { PageInfo } from "./posts";

const storyProjectionPaths: { [key: string]: 1 } = {};
Object.keys(Story.schema.paths).forEach((path) => {
  if (path !== "author" && path !== "seenBy" && path !== "__v") {
    storyProjectionPaths[path] = 1;
  }
});

interface StoryEdge {
  node: StoryType;
  cursor: string;
}

interface Stories {
  edges: StoryEdge[];
  pageInfo: PageInfo;
}

export const storyQueries = {
  loadStories: async (_: any, { page, pageSize }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const skipUsers = page * pageSize;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { following } = await User.findById(ctx.loggedInUserId, {
        _id: 0,
        following: 1,
      }).lean();

      const aggregate = Story.aggregate()
        .match({
          author: { $in: following },
          createdAt: { $gte: oneDayAgo },
        })
        .sort({ createdAt: -1 })
        .group({
          _id: "$author",
          latestStoryTimestamp: { $first: "$createdAt" },
          topStories: { $push: "$$ROOT" },
          totalActiveStories: { $sum: 1 },
        })
        .project({
          _id: 0,
          author: "$_id",
          latestStoryTimestamp: 1,
          totalActiveStories: 1,
          stories: { $slice: ["$topStories", 2] },
        })
        .sort({ latestStoryTimestamp: -1 })
        .skip(skipUsers)
        .limit(pageSize)
        .lookup({
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails",
        })
        .unwind("$authorDetails")
        .project({
          _id: 0,
          stories: {
            $map: {
              input: "$stories",
              as: "story",
              in: {
                node: {
                  $mergeObjects: [
                    "$$story",
                    {
                      seen: {
                        $cond: {
                          if: {
                            $in: [
                              new ObjectId(ctx.loggedInUserId),
                              { $ifNull: ["$$story.seenBy", []] },
                            ],
                          },
                          then: true,
                          else: false,
                        },
                      },
                    },
                  ],
                },
                cursor: "$$story._id",
              },
            },
          },
          totalActiveStories: 1,
          author: {
            _id: "$authorDetails._id",
            firstName: "$authorDetails.firstName",
            lastName: "$authorDetails.lastName",
            userName: "$authorDetails.userName",
            pfpPath: "$authorDetails.pfpPath",
            bannerPath: "$authorDetails.bannerPath",
            bio: "$authorDetails.bio",
          },
        });

      const stories = await aggregate.exec();

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: `${stories.length} stories loaded for page: ${page} with pageSize: ${pageSize} for user (${ctx.loggedInUserId}).`,
        data: stories,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchUserStories: async (
    _: any,
    { userId, pageSize, after }: any,
    ctx: AppContext,
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const { _id: authorId } = await User.exists(new ObjectId(userId)).lean();
      if (!authorId) throw newGqlError("User not found.", 404);

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const aggregate = Story.aggregate().match({
        author: authorId,
        createdAt: { $gte: oneDayAgo },
      });

      if (after) {
        aggregate.match({ _id: { $lt: new ObjectId(after) } });
      }

      aggregate
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lookup({
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        })
        .unwind("$author")
        .addFields({
          seen: {
            $cond: {
              if: {
                $in: [
                  new ObjectId(ctx.loggedInUserId),
                  { $ifNull: ["$seenBy", []] },
                ],
              },
              then: true,
              else: false,
            },
          },
        })
        .project({
          ...storyProjectionPaths,
          seen: 1,
          "author._id": 1,
          "author.userName": 1,
          "author.firstName": 1,
          "author.lastName": 1,
          "author.pfpPath": 1,
          "author.bannerPath": 1,
          "author.bio": 1,
        });

      const stories = await aggregate.exec();

      const countQuery: any = {
        author: authorId,
        createdAt: { $gte: oneDayAgo },
      };

      if (after) {
        countQuery._id = { $lt: new ObjectId(after) };
      }

      const totalDocumentsAfterCursor =
        await Story.countDocuments(countQuery).exec();
      const hasNextPage = totalDocumentsAfterCursor > stories.length;

      const endCursor =
        stories.length > 0
          ? stories[stories.length - 1]._id.toHexString()
          : null;

      const edges: StoryEdge[] = stories.map((story) => ({
        node: story,
        cursor: story._id.toHexString(),
      }));

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const userStories: Stories = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: `User's (${ctx.loggedInUserId}) stories fetched successfully.`,
        data: userStories,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchStoriesArchive: async (
    _: any,
    { pageSize, after }: any,
    ctx: AppContext,
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const { _id: authorId } = await User.exists(
        new ObjectId(ctx.loggedInUserId),
      ).lean();
      if (!authorId) throw newGqlError("User not found.", 404);

      const aggregate = Story.aggregate().match({
        author: authorId,
      });

      if (after) {
        aggregate.match({ _id: { $lt: new ObjectId(after) } });
      }

      aggregate
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lookup({
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        })
        .unwind("$author")
        .project({
          ...storyProjectionPaths,
          "author._id": 1,
          "author.userName": 1,
          "author.firstName": 1,
          "author.lastName": 1,
          "author.pfpPath": 1,
          "author.bannerPath": 1,
          "author.bio": 1,
        });

      const stories = await aggregate.exec();

      const countQuery: any = {
        author: authorId,
      };

      if (after) {
        countQuery._id = { $lt: new ObjectId(after) };
      }

      const totalDocumentsAfterCursor =
        await Story.countDocuments(countQuery).exec();
      const hasNextPage = totalDocumentsAfterCursor > stories.length;

      const endCursor =
        stories.length > 0
          ? stories[stories.length - 1]._id.toHexString()
          : null;

      const edges: StoryEdge[] = stories.map((story) => ({
        node: story,
        cursor: story._id.toHexString(),
      }));

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const userStories: Stories = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: `User's (${ctx.loggedInUserId}) stories archive fetched successfully.`,
        data: userStories,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const storyMutations = {
  createStory: async (_: any, { storyData }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    if (
      validator.isEmpty(storyData.caption) &&
      validator.isEmpty(storyData.image)
    )
      throw newGqlError("Both caption and image cannot be empty.", 422);
    try {
      const story: Document = new Story<StoryType>({
        image: storyData.image,
        caption: storyData.caption,
        author: ctx.loggedInUserId,
      });
      const newStory: Document = await story.populate("author");
      await newStory.save();
      const response: HttpResponse = {
        success: true,
        code: 201,
        message: `Story (${newStory._id}) created successfully for user (${ctx.loggedInUserId}).`,
        data: newStory,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  removeStory: async (_: any, { storyId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const deletedStory = await Story.findByIdAndDelete(storyId);
      if (!deletedStory) throw newGqlError("Story not found.", 404);

      const response: HttpResponse = {
        success: true,
        code: 204,
        message: `Story (${deletedStory._id}) deleted successfully for user (${ctx.loggedInUserId}).`,
        data: deletedStory.id,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  setStorySeenBy: async (_: any, { storyId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const story = await Story.findById(new ObjectId(storyId));
      if (!story) throw newGqlError("Story not found.", 404);

      const alreadySeen = story.seenBy?.includes(ctx.loggedInUserId);

      if (!alreadySeen) {
        story.seenBy?.push(new ObjectId(ctx.loggedInUserId));
      }

      await story.save();
      const response: HttpResponse = {
        success: true,
        code: alreadySeen ? 200 : 201,
        message: `Story ${
          alreadySeen ? "already" : "just"
        } seen by user with id:  ${ctx.loggedInUserId.toString()}`,
        data: story._id,
      };

      logger.debug(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
