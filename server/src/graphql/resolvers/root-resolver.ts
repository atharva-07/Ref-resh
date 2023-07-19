import { authQueries } from "./auth";
import { userQueries } from "./users";

import { authMutations } from "./auth";

import { NotificationEvents } from "../../models/Notification";

export const resolvers = {
  NotificationEvents,
  Query: {
    ...authQueries,
    ...userQueries,
  },
  Mutation: {
    ...authMutations,
  },
};
