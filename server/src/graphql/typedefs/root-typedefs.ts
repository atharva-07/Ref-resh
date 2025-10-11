import { readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sdlTypeDefs: string = "";

const dotGraphqlFiles = readdirSync(path.join(__dirname));

dotGraphqlFiles.forEach((file) => {
  if (!file.endsWith(".graphql")) {
    return;
  }
  sdlTypeDefs += readFileSync(path.join(__dirname, file), {
    encoding: "utf-8",
  });
  sdlTypeDefs += "\n";
});

const Queries: string = `
  type Query {
    credentialsLogin(loginData: LoginData!): AuthData!
    fetchUserProfile(userName: String!): User!
    fetchUserFollowers(pageSize: Int!, after: String, userId: ID!): PaginatedBasicUserData!
    fetchUserFollowing(pageSize: Int!, after: String, userId: ID!): PaginatedBasicUserData!
    fetchIncomingFollowRequests: [BasicUserData!]
    fetchSentFollowRequests: [BasicUserData!]
    fetchUpcomingBirthdays: [BasicUserData!]
    loadFeed(pageSize: Int!, after: String): PostFeed!
    fetchUserPosts(pageSize: Int!, after: String, userName: String!): PostFeed!
    fetchSinglePost(postId: ID!): Post!
    fetchParentCommentsRecursively(commentId: ID!): CommentsWithPost!
    fetchChildComments(pageSize: Int!, after: String, postId: ID, commentId: ID): CommentFeed!
    fetchUserBookmarks(pageSize: Int!, after: String): PostFeed!
    fetchUserLikes(pageSize: Int!, after: String): PostFeed!
    fetchLikesFromPost(pageSize: Int!, after: String, postId: ID!): PaginatedBasicUserData!
    fetchLikesFromComment(pageSize: Int!, after: String, commentId: ID!): PaginatedBasicUserData!
    fetchNotifications(pageSize: Int!, after: String): NotificationFeed! 
    fetchChats: [Chat!]
    fetchChatMessages(chatId: ID!, pageSize: Int!, after: String): ChatMessages!
    searchLikesOnPost(searchQuery: String!, postId: ID!): [BasicUserData!]
    searchLikesOnComment(searchQuery: String!, commentId: ID!): [BasicUserData!]
    searchUserFollowers(searchQuery: String!, userId: ID!): [BasicUserData!]
    searchUserFollowing(searchQuery: String!, userId: ID!): [BasicUserData!]
    searchUsers(searchQuery: String!): [BasicUserData!]
    searchPosts(searchQuery: String!): [BasicPostData!]
    fetchAccountSettingsData: AccountSettingsData!
    forgotPassword(email: String!): String!
  }
`;

const Mutations: string = `
  type Mutation {
    signup(signupData: SignUpData!): ID!
    followOrUnfollowUser(userName: String!): FollowRequestResult!
    acceptFollowRequest(userId: ID!): ID!
    rejectFollowRequest(userId: ID!): ID!
    blockOrUnblockUser(userId: ID!): BlockResult!
    updateUserInfo(userProfileData: UserProfileData!): BasicUserData!
    createPost(postData: PostData!): Post!
    editPost(postId: ID!, content: String!): Post!
    likeOrUnlikePost(postId: ID!): ID!
    addOrRemoveBookmark(postId: ID!): ID!
    removePost(postId: ID!): ID!
    postComment(commentData: CommentData!): Comment!
    editComment(commentId: ID!, content: String!): Comment!
    likeOrUnlikeComment(commentId: ID!): ID!
    removeComment(postId: ID!, commentId: ID!): ID!
    logout: ID!
    setReadNotificationsAt: String!
    createNewChat(chatMembers: [ID!]!, chatName: String): Chat!
    sendChatMessage(messageData: MessageData!): Message!
    updateLastSeen(chatId: ID!, messageId: ID!): LastSeenData
    toggleAccountType: AccountToggleResult!
    changePassword(passwordResetData: PasswordResetData!): ID!
  }
`;

export const typeDefs: string = `#graphql
  ${Queries}
  ${sdlTypeDefs}
  ${Mutations}
`;
