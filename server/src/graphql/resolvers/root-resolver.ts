// Query Imports
import { NotificationEvents } from "../../models/Notification";
import { authQueries } from "./auth";
// Mutation Imports
import { authMutations } from "./auth";
import { commentQueries } from "./comments";
import { commentMutations } from "./comments";
import { postQueries } from "./posts";
import { postMutations } from "./posts";
import { userQueries } from "./users";
import { userMutations } from "./users";

export const resolvers = {
  NotificationEvents,
  Query: {
    ...authQueries,
    ...userQueries,
    ...postQueries,
    ...commentQueries,
  },
  Mutation: {
    ...authMutations,
    ...userMutations,
    ...postMutations,
    ...commentMutations,
  },
};
