import { ObjectId } from "mongodb";
import { FilterQuery, Types } from "mongoose";

import Notification, { NotificationType } from "../../models/Notification";
import User from "../../models/User";
import { AppContext } from "../../server";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";

interface NotificationEdge {
  node: NotificationType;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface NotificationFeed {
  edges: NotificationEdge[];
  pageInfo: PageInfo;
}

const notificationProjectionPaths: { [key: string]: 1 } = {};
Object.keys(Notification.schema.paths).forEach((path) => {
  if (path !== "subscriber" && path !== "publisher" && path !== "__v") {
    notificationProjectionPaths[path] = 1;
  }
});

export const notificationQueries = {
  fetchNotifications: async (
    _: any,
    { pageSize, after }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findById(ctx.loggedInUserId)
        .select("_id readNotificationsAt")
        .lean();
      if (!user) throw newGqlError("User not found.", 404);

      const matchFilter: FilterQuery<NotificationType> = {
        subscriber: new ObjectId(ctx.loggedInUserId),
      };

      if (after) {
        matchFilter._id = { $lt: new ObjectId(after) };
      }

      const aggregate = Notification.aggregate().match(matchFilter);

      aggregate
        .sort({ _id: -1 })
        .limit(pageSize)
        .lookup({
          from: "users",
          localField: "publisher",
          foreignField: "_id",
          as: "publisher",
        })
        .unwind("$publisher")
        .addFields({
          unread: {
            $cond: {
              if: {
                $and: [
                  { $ne: [user.readNotificationsAt, null] },
                  { $gt: ["$createdAt", user.readNotificationsAt] },
                ],
              },
              then: true,
              else: false,
            },
          },
        })
        .project({
          ...notificationProjectionPaths,
          "publisher._id": 1,
          "publisher.userName": 1,
          "publisher.firstName": 1,
          "publisher.lastName": 1,
          "publisher.pfpPath": 1,
          unread: 1,
        });

      const notifications = await aggregate.exec();

      if (!notifications || notifications.length === 0) {
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

      const totalDocumentsAfterCursor = await Notification.countDocuments(
        countQuery
      ).exec();
      const hasNextPage = totalDocumentsAfterCursor > notifications.length;

      const endCursor =
        notifications.length > 0
          ? notifications[notifications.length - 1]._id.toHexString()
          : null;

      const edges: NotificationEdge[] = notifications.map((notification) => ({
        node: notification,
        cursor: notification._id.toHexString(),
      }));

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const userNotifications: NotificationFeed = {
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Unread notifications fetched successfully.",
        data: userNotifications,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
