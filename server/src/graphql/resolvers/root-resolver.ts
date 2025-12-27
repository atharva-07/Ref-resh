// Query Imports
import { authQueries } from "./auth.js";
// Mutation Imports
import { authMutations } from "./auth.js";
import { callMutations, callQueries } from "./calls.js";
import { chatMutations, chatQueries } from "./chats.js";
import { commentQueries } from "./comments.js";
import { commentMutations } from "./comments.js";
import { notificationQueries } from "./notifications.js";
import { postQueries } from "./posts.js";
import { postMutations } from "./posts.js";
import { searchQueries } from "./search.js";
import { storyMutations, storyQueries } from "./stories.js";
import { userQueries } from "./users.js";
import { userMutations } from "./users.js";

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
    ...callQueries,
  },
  Mutation: {
    ...authMutations,
    ...userMutations,
    ...postMutations,
    ...commentMutations,
    ...chatMutations,
    ...storyMutations,
    ...callMutations,
  },
};
