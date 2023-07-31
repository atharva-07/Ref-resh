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
    fetchUserFollowers(userName: String!): [User!]
    fetchUserFollowings(userName: String!): [User!]
    fetchUpcomingBirthdays: [User!]
    loadFeed: [Post!]
    fetchUserPosts(userName: String!): [Post!]
    fetchSinglePost(postId: ID!): Post!
  }
`;

const Mutations: string = `
  type Mutation {
    signup(signupData: SignUpData!): User!
    followUser(userName: String!): ID!
    unfollowUser(userName: String!): ID!
    blockUser(userName: String!): ID!
    unblockUser(userName: String!): ID!
    updateUserProfile(userProfileData: UserProfileData!): BasicUserData!
    createPost(postData: PostData): Post!
    editPost(postId: ID!, postData: PostData): Post!
    likeOrUnlikePost(postId: ID!): ID!
    removePost(postId: ID!): ID!
    postComment(content: String!, postId: ID!, commentId: ID): Comment!
    editComment(content: String!, commentId: ID!): Comment!
    likeOrUnlikeComment(commentId: ID!): ID!
    removeComment(commentId: ID!): ID!
  }
`;

export const typeDefs: string = `#graphql
  ${Queries}
  ${sdlTypeDefs}
  ${Mutations}
`;
