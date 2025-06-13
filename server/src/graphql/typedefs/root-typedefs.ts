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
    loadFeed(pageSize: Int!, after: String): Feed!
    fetchUserPosts(userName: String!): [Post!]
    fetchSinglePost(postId: ID!): Post!
    fetchTopLevelComments(postId: ID!): [Comment!]
    fetchChildComments(postId: ID, commentId: ID): [Comment!]
    fetchUnreadNotificationsCount: Int! 
    fetchChats: [Chat!]
    fetchChatMessages(chatId: ID!): [Message!]!
    fetchUnreadChatsCount: Int!
  }
`;

const Mutations: string = `
  type Mutation {
    signup(signupData: SignUpData!): User!
    followOrUnfollowUser(userName: String!): ID!
    acceptFollowRequest(userId: ID!): ID!
    rejectFollowRequest(userId: ID!): ID!
    blockOrUnblockUser(userName: String!): ID!
    updateUserProfile(userProfileData: UserProfileData!): BasicUserData!
    createPost(postData: PostData): Post!
    editPost(postId: ID!, postData: PostData): Post!
    likeOrUnlikePost(postId: ID!): ID!
    removePost(postId: ID!): ID!
    postComment(content: String!, postId: ID!, parentCommentId: ID, topLevelCommentId: ID): Comment!
    editComment(content: String!, commentId: ID!): Comment!
    likeOrUnlikeComment(commentId: ID!): ID!
    removeComment(postId: ID!, commentId: ID!): ID!
    logout(userId: ID!): ID!
    setReadNotificationsAt: String!
    setReadChatsAt: String!
    createNewChat(chatMembers: [ID!]!, chatName: String): ID! 
    sendChatMessage(messageData: MessageData!): Message!
  }
`;

export const typeDefs: string = `#graphql
  ${Queries}
  ${sdlTypeDefs}
  ${Mutations}
`;
