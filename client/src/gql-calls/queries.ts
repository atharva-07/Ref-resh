import { gql, TypedDocumentNode } from "@apollo/client/core";

import { CommentProps } from "@/components/main/comment/comment";
import { NotificationProps } from "@/components/main/notification/notification";
import {
  BasicPostData,
  BasicUserData,
  PostProps,
} from "@/components/main/post/post";
import { ProfileInfo } from "@/routes/Profile";
import { Message } from "@/store/chat-slice";

export interface PaginatedData<TData> {
  edges: { node: TData; cursor: string }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

export const GET_USER_PROFILE: TypedDocumentNode<{
  fetchUserProfile: ProfileInfo;
}> = gql`
  query FetchUserProfile($userName: String!) {
    fetchUserProfile(userName: $userName) {
      _id
      firstName
      lastName
      userName
      gender
      dob
      privateAccount
      joinedDate
      pfpPath
      bannerPath
      bio
      followers {
        _id
        firstName
        lastName
        userName
        pfpPath
      }
      following {
        _id
        firstName
        lastName
        userName
        pfpPath
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEED: TypedDocumentNode<{
  loadFeed: PaginatedData<PostProps>;
}> = gql`
  query GetFeed($pageSize: Int!, $after: String) {
    loadFeed(pageSize: $pageSize, after: $after) {
      edges {
        node {
          _id
          content
          images
          commentsCount
          edited
          likes {
            _id
          }
          bookmarks
          author {
            _id
            firstName
            lastName
            userName
            pfpPath
          }
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const LOGIN = gql`
  query Login($loginData: LoginData!) {
    credentialsLogin(loginData: $loginData) {
      access_token
      refresh_token
      userId
      fullName
      username
      pfpPath
    }
  }
`;

export const GET_UPCOMING_BIRTHDAYS = gql`
  query GetUpcomingBirthdays {
    fetchUpcomingBirthdays {
      _id
      userName
      firstName
      lastName
      dob
      pfpPath
      bannerPath
      bio
    }
  }
`;

export const GET_INCOMING_FOLLOW_REQUESTS: TypedDocumentNode<{
  fetchIncomingFollowRequests: BasicUserData[];
}> = gql`
  query GetIncomingFollowRequests {
    fetchIncomingFollowRequests {
      _id
      userName
      firstName
      lastName
      pfpPath
      bannerPath
      bio
    }
  }
`;

export const GET_SENT_FOLLOW_REQUESTS: TypedDocumentNode<{
  fetchSentFollowRequests: BasicUserData[];
}> = gql`
  query GetSentFollowRequests {
    fetchSentFollowRequests {
      _id
      userName
      firstName
      lastName
      pfpPath
      bannerPath
      bio
    }
  }
`;

export const GET_CHATS = gql`
  query GetChats {
    fetchChats {
      _id
      chatName
      members {
        _id
        userName
        pfpPath
        lastName
        firstName
        bio
        bannerPath
      }
      lastSeen {
        userId
        messageId
        timestamp
      }
      unreadCount
      lastMessage {
        _id
        content
        sender {
          _id
          firstName
          lastName
          pfpPath
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_USER_FOLLOWERS: TypedDocumentNode<{
  fetchUserFollowers: PaginatedData<BasicUserData>;
}> = gql`
  query GetUserFollowers($pageSize: Int!, $after: String, $userId: ID!) {
    fetchUserFollowers(pageSize: $pageSize, after: $after, userId: $userId) {
      edges {
        node {
          _id
          firstName
          lastName
          userName
          pfpPath
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_USER_FOLLOWING: TypedDocumentNode<{
  fetchUserFollowing: PaginatedData<BasicUserData>;
}> = gql`
  query GetUserFollowing($pageSize: Int!, $after: String, $userId: ID!) {
    fetchUserFollowing(pageSize: $pageSize, after: $after, userId: $userId) {
      edges {
        node {
          _id
          firstName
          lastName
          userName
          pfpPath
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_CHAT_MESSAGES: TypedDocumentNode<{
  fetchChatMessages: PaginatedData<Message> & { chatName: string | null };
}> = gql`
  query GetChatMessages($chatId: ID!, $pageSize: Int!, $after: String) {
    fetchChatMessages(chatId: $chatId, pageSize: $pageSize, after: $after) {
      chatName
      edges {
        node {
          _id
          content
          sender {
            _id
            firstName
            lastName
            pfpPath
            userName
          }
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_USER_POSTS: TypedDocumentNode<{
  fetchUserPosts: PaginatedData<PostProps>;
}> = gql`
  query GetUserPosts($pageSize: Int!, $after: String, $userName: String!) {
    fetchUserPosts(pageSize: $pageSize, after: $after, userName: $userName) {
      edges {
        node {
          _id
          content
          images
          commentsCount
          edited
          likes {
            _id
          }
          bookmarks
          author {
            _id
            firstName
            lastName
            userName
            pfpPath
          }
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_USER_LIKES: TypedDocumentNode<{
  fetchUserLikes: PaginatedData<PostProps>;
}> = gql`
  query GetUserPosts($pageSize: Int!, $after: String) {
    fetchUserLikes(pageSize: $pageSize, after: $after) {
      edges {
        node {
          _id
          content
          images
          commentsCount
          edited
          likes {
            _id
          }
          bookmarks
          author {
            _id
            firstName
            lastName
            userName
            pfpPath
          }
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_USER_BOOKMARKS: TypedDocumentNode<{
  fetchUserBookmarks: PaginatedData<PostProps>;
}> = gql`
  query GetUserBookmarks($pageSize: Int!, $after: String) {
    fetchUserBookmarks(pageSize: $pageSize, after: $after) {
      edges {
        node {
          _id
          content
          images
          commentsCount
          edited
          likes {
            _id
          }
          bookmarks
          author {
            _id
            firstName
            lastName
            userName
            pfpPath
          }
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_CHILD_COMMENTS: TypedDocumentNode<{
  fetchChildComments: PaginatedData<CommentProps>;
}> = gql`
  query GetChildComments(
    $pageSize: Int!
    $after: String
    $postId: ID
    $commentId: ID
  ) {
    fetchChildComments(
      pageSize: $pageSize
      after: $after
      postId: $postId
      commentId: $commentId
    ) {
      edges {
        node {
          _id
          content
          post
          commentsCount
          edited
          likes {
            _id
          }
          author {
            _id
            firstName
            lastName
            userName
            pfpPath
          }
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_PARENT_COMMENTS: TypedDocumentNode<{
  fetchParentCommentsRecursively: { post: PostProps; comments: CommentProps[] };
}> = gql`
  query GetParentCommentsRecursively($commentId: ID!) {
    fetchParentCommentsRecursively(commentId: $commentId) {
      post {
        _id
        content
        images
        commentsCount
        edited
        likes {
          _id
        }
        bookmarks
        author {
          _id
          firstName
          lastName
          userName
          pfpPath
        }
        createdAt
        updatedAt
      }
      comments {
        _id
        content
        post
        commentsCount
        edited
        likes {
          _id
        }
        author {
          _id
          firstName
          lastName
          userName
          pfpPath
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_POST: TypedDocumentNode<{
  fetchSinglePost: PostProps;
}> = gql`
  query GetSinglePost($postId: ID!) {
    fetchSinglePost(postId: $postId) {
      _id
      content
      images
      commentsCount
      edited
      likes {
        _id
      }
      bookmarks
      author {
        _id
        firstName
        lastName
        userName
        pfpPath
      }
      createdAt
      updatedAt
    }
  }
`;

export const SEARCH_LIKES_ON_POST: TypedDocumentNode<{
  searchLikesOnPost: BasicUserData[];
}> = gql`
  query SearchLikesInPost($searchQuery: String!, $postId: ID!) {
    searchLikesOnPost(searchQuery: $searchQuery, postd: $postId) {
      _id
      firstName
      lastName
      userName
      pfpPath
    }
  }
`;

export const SEARCH_LIKES_ON_COMMENT: TypedDocumentNode<{
  searchLikesOnComment: BasicUserData[];
}> = gql`
  query SearchLikesOnComment($searchQuery: String!, $commentId: ID!) {
    searchLikesOnComment(searchQuery: $searchQuery, commentId: $commentId) {
      _id
      firstName
      lastName
      userName
      pfpPath
    }
  }
`;

export const SEARCH_USER_FOLLOWERS: TypedDocumentNode<{
  searchUserFollowers: BasicUserData[];
}> = gql`
  query SearchUserFollowers($searchQuery: String!, $userId: ID!) {
    searchUserFollowers(searchQuery: $searchQuery, userId: $userId) {
      _id
      firstName
      lastName
      userName
      pfpPath
    }
  }
`;

export const SEARCH_USER_FOLLOWING: TypedDocumentNode<{
  searchUserFollowing: BasicUserData[];
}> = gql`
  query SearchUserFollowing($searchQuery: String!, $userId: ID!) {
    searchUserFollowing(searchQuery: $searchQuery, userId: $userId) {
      _id
      firstName
      lastName
      userName
      pfpPath
    }
  }
`;

export const SEARCH_USERS: TypedDocumentNode<{
  searchUsers: BasicUserData[];
}> = gql`
  query SearchUsers($searchQuery: String!) {
    searchUsers(searchQuery: $searchQuery) {
      _id
      firstName
      lastName
      userName
      pfpPath
    }
  }
`;

export const SEARCH_POSTS: TypedDocumentNode<{
  searchPosts: BasicPostData[];
}> = gql`
  query SearchPosts($searchQuery: String!) {
    searchPosts(searchQuery: $searchQuery) {
      _id
      content
      author {
        _id
        firstName
        lastName
        userName
        pfpPath
      }
    }
  }
`;

export const GET_POST_LIKES: TypedDocumentNode<{
  fetchLikesFromPost: PaginatedData<BasicUserData>;
}> = gql`
  query FetchLikesFromPost($pageSize: Int!, $after: String, $postId: ID!) {
    fetchLikesFromPost(pageSize: $pageSize, after: $after, postId: $postId) {
      edges {
        node {
          _id
          firstName
          lastName
          userName
          pfpPath
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_COMMENT_LIKES: TypedDocumentNode<{
  fetchLikesFromComment: PaginatedData<BasicUserData>;
}> = gql`
  query FetchLikesFromComment(
    $pageSize: Int!
    $after: String
    $commentId: ID!
  ) {
    fetchLikesFromComment(
      pageSize: $pageSize
      after: $after
      commentId: $commentId
    ) {
      edges {
        node {
          _id
          firstName
          lastName
          userName
          pfpPath
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_NOTIFICATIONS: TypedDocumentNode<{
  fetchNotifications: PaginatedData<NotificationProps>;
}> = gql`
  query FetchUnreadNotifications($pageSize: Int!, $after: String) {
    fetchNotifications(pageSize: $pageSize, after: $after) {
      edges {
        node {
          _id
          eventType
          redirectionURL
          publisher {
            _id
            firstName
            lastName
            userName
            pfpPath
          }
          unread
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_ACCOUNT_SETTINGS_DATA: TypedDocumentNode<{
  fetchAccountSettingsData: {
    privateAccount: boolean;
    blockedAccounts: BasicUserData[];
  };
}> = gql`
  query GetAccountSettingsData {
    fetchAccountSettingsData {
      privateAccount
      blockedAccounts {
        _id
        firstName
        lastName
        userName
        pfpPath
      }
    }
  }
`;

export const FORGOT_PASSWORD: TypedDocumentNode<{
  forgotPassword: boolean;
}> = gql`
  query ForgotPassowrd($email: String, $userId: ID) {
    forgotPassword(email: $email, userId: $userId)
  }
`;
