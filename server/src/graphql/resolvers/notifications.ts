import Notification from "../../models/Notification";
import User from "../../models/User";
import { AppContext } from "../../server";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";

export const notificationQueries = {
  fetchUnreadNotificationsCount: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findById(ctx.loggedInUserId);
      if (!user) throw newGqlError("User not found", 404);
      let unreadNotficationsCount = 0;
      if (user.readNotificationsAt) {
        unreadNotficationsCount = await Notification.count({
          $and: [
            { createdAt: { $gt: user?.readNotificationsAt } },
            { subscriber: ctx.loggedInUserId },
          ],
        });
      } else {
        unreadNotficationsCount = await Notification.count({
          subscriber: ctx.loggedInUserId,
        });
      }
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Unread Notfications Count fetched successfully.",
        data: unreadNotficationsCount,
      };
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
