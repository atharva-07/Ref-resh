import { ObjectId } from "mongodb";
import { Document, FilterQuery, PipelineStage } from "mongoose";

import Call, { CallType } from "../../models/Call";
import Chat from "../../models/Chat";
import { AppContext } from "../../server";
import logger from "../../utils/winston";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";
import { PageInfo } from "./posts";

interface CallEdge {
  node: CallType;
  cursor: string;
}

interface CallFeed {
  edges: CallEdge[];
  pageInfo: PageInfo;
}

const callProjectionPaths: { [key: string]: 1 } = {};
Object.keys(Call.schema.paths).forEach((path) => {
  if (
    path !== "initiator" &&
    path !== "__v" &&
    !path.includes(".") &&
    !path.includes("*")
  ) {
    callProjectionPaths[path] = 1;
  }
});

const getMapPopulationStages = (): PipelineStage[] => {
  return [
    {
      $lookup: {
        from: "users",
        localField: "initiator",
        foreignField: "_id",
        as: "initiator",
      },
    },
    {
      $unwind: "$initiator",
    },
    {
      $addFields: {
        acceptedArr: { $objectToArray: "$acceptedAt" },
        disconnectedArr: { $objectToArray: "$disconnectedAt" },
      },
    },
    {
      $addFields: {
        allUserIds: {
          $setUnion: [
            {
              $map: { input: "$acceptedArr", in: { $toObjectId: "$$this.k" } },
            },
            {
              $map: {
                input: "$disconnectedArr",
                in: { $toObjectId: "$$this.k" },
              },
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { userIds: "$allUserIds" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$userIds"] } } },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              userName: 1,
              pfpPath: 1,
              bannerPath: 1,
              bio: 1,
            },
          },
        ],
        as: "userCache",
      },
    },
    {
      $addFields: {
        acceptedAt: {
          $map: {
            input: "$acceptedArr",
            as: "item",
            in: {
              timestamp: "$$item.v.timestamp",
              user: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$userCache",
                      as: "u",
                      cond: { $eq: ["$$u._id", { $toObjectId: "$$item.k" }] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
        disconnectedAt: {
          $map: {
            input: "$disconnectedArr",
            as: "item",
            in: {
              timestamp: "$$item.v.timestamp",
              user: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$userCache",
                      as: "u",
                      cond: { $eq: ["$$u._id", { $toObjectId: "$$item.k" }] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
  ];
};

const finalProjection = {
  ...callProjectionPaths,
  chatName: 1,
  "initiator._id": 1,
  "initiator.userName": 1,
  "initiator.firstName": 1,
  "initiator.lastName": 1,
  "initiator.pfpPath": 1,
  "initiator.bannerPath": 1,
  "initiator.bio": 1,
};

export const callQueries = {
  fetchCallsHistory: async (
    _: any,
    { pageSize, after }: any,
    ctx: AppContext,
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const matchFilter: FilterQuery<any> = {
        "chatDetails.members": { $in: [new ObjectId(ctx.loggedInUserId)] },
      };

      if (after) {
        matchFilter._id = { $lt: new ObjectId(after) };
      }

      const aggregate = Call.aggregate();

      aggregate
        .lookup({
          from: "chats",
          localField: "chatId",
          foreignField: "_id",
          as: "chatDetails",
        })
        .unwind("$chatDetails")
        .addFields({
          memberIds: "$chatDetails.members",
        })
        .lookup({
          from: "users",
          localField: "memberIds",
          foreignField: "_id",
          as: "chatDetails.populatedMembers",
        })
        .addFields({
          chatName: {
            $cond: {
              if: { $ifNull: ["$chatDetails.chatName", false] },
              then: "$chatDetails.chatName",
              else: {
                $let: {
                  vars: {
                    otherMember: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$chatDetails.populatedMembers",
                            as: "m",
                            cond: {
                              $not: {
                                $eq: [
                                  "$$m._id",
                                  new ObjectId(ctx.loggedInUserId),
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    $concat: [
                      "$$otherMember.firstName",
                      " ",
                      "$$otherMember.lastName",
                    ],
                  },
                },
              },
            },
          },
        })
        .match(matchFilter)
        .sort({ _id: -1 })
        .limit(pageSize)
        .append(...getMapPopulationStages())
        .project(finalProjection);

      const calls = await aggregate.exec();

      if (!calls || calls.length === 0) {
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        };
      }

      const countQuery = matchFilter;

      if (after) {
        countQuery._id = { $lt: new ObjectId(after) };
      }

      const countAggregate = Call.aggregate([
        {
          $lookup: {
            from: "chats",
            localField: "chatId",
            foreignField: "_id",
            as: "chatDetails",
          },
        },
        { $unwind: "$chatDetails" },
        { $match: countQuery },
        { $count: "totalDocuments" },
      ]);

      const countResult = await countAggregate.exec();
      const totalDocumentsAfterCursor = countResult.at(0).totalDocuments;
      const hasNextPage = totalDocumentsAfterCursor > calls.length;

      const endCursor =
        calls.length > 0 ? calls[calls.length - 1]._id.toHexString() : null;

      const edges: CallEdge[] = calls.map((call) => ({
        node: call,
        cursor: call._id.toHexString(),
      }));

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const userCalls: CallFeed = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: `${calls.length} calls for user ${ctx.loggedInUserId} fetched successfully. Calls cursor: ${after}`,
        data: userCalls,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchCallsHistoryByChat: async (
    _: any,
    { chatId, pageSize, after }: any,
    ctx: AppContext,
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const chat = await Chat.exists({
        _id: new ObjectId(chatId),
      });

      if (!chat) throw newGqlError("Chat not found.", 404);

      const matchFilter: FilterQuery<CallType> = {
        chatId: new ObjectId(chatId),
      };

      if (after) {
        matchFilter._id = { $lt: new ObjectId(after) };
      }

      const aggregate = Call.aggregate().match(matchFilter);

      aggregate
        .lookup({
          from: "chats",
          localField: "chatId",
          foreignField: "_id",
          as: "chatDetails",
        })
        .unwind("$chatDetails")
        .addFields({
          memberIds: "$chatDetails.members",
        })
        .lookup({
          from: "users",
          localField: "memberIds",
          foreignField: "_id",
          as: "chatDetails.populatedMembers",
        })
        .addFields({
          chatName: {
            $cond: {
              if: { $ifNull: ["$chatDetails.chatName", false] },
              then: "$chatDetails.chatName",
              else: {
                $let: {
                  vars: {
                    otherMember: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$chatDetails.populatedMembers",
                            as: "m",
                            cond: {
                              $not: {
                                $eq: [
                                  "$$m._id",
                                  new ObjectId(ctx.loggedInUserId),
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    $concat: [
                      "$$otherMember.firstName",
                      " ",
                      "$$otherMember.lastName",
                    ],
                  },
                },
              },
            },
          },
        })
        .sort({ _id: -1 })
        .limit(pageSize)
        .append(...getMapPopulationStages())
        .project(finalProjection);

      const calls = await aggregate.exec();

      if (!calls || calls.length === 0) {
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        };
      }

      const countQuery = matchFilter;

      if (after) {
        countQuery._id = { $lt: new ObjectId(after) };
      }

      const totalDocumentsAfterCursor =
        await Call.countDocuments(countQuery).exec();
      const hasNextPage = totalDocumentsAfterCursor > calls.length;

      const endCursor =
        calls.length > 0 ? calls[calls.length - 1]._id.toHexString() : null;

      const edges: CallEdge[] = calls.map((call) => ({
        node: call,
        cursor: call._id.toHexString(),
      }));

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const chatCalls: CallFeed = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: `${calls.length} calls made in chat ${chatId} fetched successfully. Calls cursor: ${after}`,
        data: chatCalls,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const callMutations = {
  // initiate
  createCall: async (_: any, { chatId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const call: Document = new Call<CallType>({
        chatId: chatId,
        initiator: ctx.loggedInUserId,
      });

      await call.save();
      await call.populate({
        path: "initiator",
        select: "_id pfpPath firstName lastName userName",
      });

      const response: HttpResponse = {
        success: true,
        code: 201,
        message: `Call (${call._id}) created successfully by userId: ${ctx.loggedInUserId}`,
        data: call,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // answer
  addUserToCall: async (_: any, { callId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const call = await Call.findById(callId);
      if (!call) throw newGqlError("Call not found.", 404);
      call.acceptedAt?.set(ctx.loggedInUserId.toString(), {
        timestamp: new Date(),
      });
      await call.save();

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: `User (${ctx.loggedInUserId}) added to call (${callId}) successfully.`,
        data: call._id,
      };

      logger.debug(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // reject
  removeUserFromCall: async (
    _: any,
    { callId, userId }: any,
    ctx: AppContext,
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const call = await Call.findById(callId);
      if (!call) throw newGqlError("Call not found.", 404);
      call.disconnectedAt?.set(userId ?? ctx.loggedInUserId.toString(), {
        timestamp: new Date(),
      });
      await call.save();

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: `User (${ctx.loggedInUserId}) removed from call (${callId}) successfully.`,
        data: call._id,
      };

      logger.debug(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
