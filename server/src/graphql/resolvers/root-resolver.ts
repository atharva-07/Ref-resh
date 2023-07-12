import { userQueries } from "./users";

import { NotificationEvents } from "../../models/Notification";

export const resolvers = {
  NotificationEvents,
  Query: {
    ...userQueries,
  },
  // Mutation: {},
};
