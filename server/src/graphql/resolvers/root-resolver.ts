// Query Imports
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
import { storyMutations, storyQueries } from "./stories";
import { userQueries } from "./users";
import { userMutations } from "./users";

export const resolvers = {
  Query: {
    ...authQueries,
    ...userQueries,
    ...postQueries,
    ...commentQueries,
    ...notificationQueries,
    ...chatQueries,
    ...searchQueries,
    ...storyQueries,
  },
  Mutation: {
    ...authMutations,
    ...userMutations,
    ...postMutations,
    ...commentMutations,
    ...chatMutations,
    ...storyMutations,
  },
};
