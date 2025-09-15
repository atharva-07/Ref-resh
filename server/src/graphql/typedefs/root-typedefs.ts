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
    fetchUserFollowers(userName: String!): [BasicUserData!]
    fetchUserFollowings(userName: String!): [BasicUserData!]
    fetchIncomingFollowRequests: [BasicUserData!]
    fetchUpcomingBirthdays: [BasicUserData!]
    loadFeed(pageSize: Int!, after: String): PostFeed!
    fetchUserPosts(pageSize: Int!, after: String, userName: String!): PostFeed!
    fetchSinglePost(postId: ID!): Post!
    fetchParentCommentsRecursively(commentId: ID!): CommentsWithPost!
    fetchChildComments(pageSize: Int!, after: String, postId: ID, commentId: ID): CommentFeed!
    fetchUserBookmarks(pageSize: Int!, after: String): PostFeed!
    fetchUserLikes(pageSize: Int!, after: String): PostFeed! 
    fetchUnreadNotificationsCount: Int! 
    fetchChats: [Chat!]
    fetchChatMessages(chatId: ID!, pageSize: Int!, after: String): ChatMessages!
  }
`;

const Mutations: string = `
  type Mutation {
    signup(signupData: SignUpData!): ID!
    followOrUnfollowUser(userName: String!): ID!
    acceptFollowRequest(userId: ID!): ID!
    rejectFollowRequest(userId: ID!): ID!
    blockOrUnblockUser(userName: String!): ID!
    updateUserInfo(userProfileData: UserProfileData!): BasicUserData!
    createPost(postData: PostData!): Post!
    editPost(postId: ID!, postData: PostData): Post!
    likeOrUnlikePost(postId: ID!): ID!
    removePost(postId: ID!): ID!
    postComment(commentData: CommentData!): Comment!
    editComment(content: String!, commentId: ID!): Comment!
    likeOrUnlikeComment(commentId: ID!): ID!
    removeComment(postId: ID!, commentId: ID!): ID!
    logout(userId: ID!): ID!
    setReadNotificationsAt: String!
    createNewChat(chatMembers: [ID!]!, chatName: String): Chat!
    sendChatMessage(messageData: MessageData!): Message!
    updateLastSeen(chatId: ID!, messageId: ID!): LastSeenData
  }
`;

export const typeDefs: string = `#graphql
  ${Queries}
  ${sdlTypeDefs}
  ${Mutations}
`;
