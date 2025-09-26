// Query Imports
import { NotificationEvents } from "../../models/Notification";
import { authQueries } from "./auth";
// Mutation Imports
import { authMutations } from "./auth";
import { chatMutations, chatQueries } from "./chats";
import { commentQueries } from "./comments";
import { commentMutations } from "./comments";
import { notificationQueries } from "./notifications";
import { postQueries } from "./posts";
import { postMutations } from "./posts";
import { searchQueries } from "./search";
import { userQueries } from "./users";
import { userMutations } from "./users";

export const resolvers = {
  NotificationEvents,
  Query: {
    ...authQueries,
    ...userQueries,
    ...postQueries,
    ...commentQueries,
    ...notificationQueries,
    ...chatQueries,
    ...searchQueries,
  },
  Mutation: {
    ...authMutations,
    ...userMutations,
    ...postMutations,
    ...commentMutations,
    ...chatMutations,
  },
};
