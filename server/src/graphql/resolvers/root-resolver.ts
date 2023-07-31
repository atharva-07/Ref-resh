// Query Imports
import { authQueries } from "./auth";
import { userQueries } from "./users";
import { postQueries } from "./posts";

// Mutation Imports
import { authMutations } from "./auth";
import { userMutations } from "./users";
import { postMutations } from "./posts";
import { commentMutations } from "./comments";

import { NotificationEvents } from "../../models/Notification";

export const resolvers = {
  NotificationEvents,
  Query: {
    ...authQueries,
    ...userQueries,
    ...postQueries,
  },
  Mutation: {
    ...authMutations,
    ...userMutations,
    ...postMutations,
    ...commentMutations,
  },
};
