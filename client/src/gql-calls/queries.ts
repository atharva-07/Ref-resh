import { gql, TypedDocumentNode } from "@apollo/client/core";

import { MessageProps } from "@/components/main/chat/Message";
import { PostProps } from "@/components/main/post/post";

export const GET_USER_PROFILE = gql`
  query FetchUserProfile($userName: String!) {
    fetchUserProfile(userName: $userName) {
      _id
      firstName
      lastName
      userName
      email
      password
      gender
      dob
      privateAccount
      joinedDate
      pfpPath
      bannerPath
      bio
      authType
      lastLoginAt
      readNotificationsAt
      readChatsAt
      followers {
        userName
      }
      following {
        userName
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEED: TypedDocumentNode<{
  loadFeed: {
    edges: { node: PostProps; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}> = gql`
  query GetFeed($pageSize: Int!, $after: String) {
    loadFeed(pageSize: $pageSize, after: $after) {
      edges {
        node {
          _id
          content
          images
          commentsCount
          createdAt
          updatedAt
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

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount {
    fetchUnreadNotificationsCount
  }
`;

export const GET_UNREAD_CHATS_COUNT = gql`
  query GetUnreadChatsCount {
    fetchUnreadChatsCount
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

export const GET_INCOMING_FOLLOW_REQUESTS = gql`
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
      lastMessage {
        content
        sender {
          _id
          firstName
          lastName
          pfpPath
        }
        createdAt
      }
    }
  }
`;

export const GET_USER_FOLLOWERS = gql`
  query GetUserFollowers($userName: String!) {
    fetchUserFollowers(userName: $userName) {
      _id
      userName
      pfpPath
      lastName
      firstName
      bio
      bannerPath
    }
  }
`;

export const GET_CHAT_MESSAGES: TypedDocumentNode<{
  fetchChatMessages: MessageProps[];
}> = gql`
  query GetChatMessages($chatId: ID!) {
    fetchChatMessages(chatId: $chatId) {
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
`;
