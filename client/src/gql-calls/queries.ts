import { gql, TypedDocumentNode } from "@apollo/client/core";

import { MessageProps } from "@/components/main/chat/message";
import { CommentProps } from "@/components/main/comment/comment";
import { PostProps } from "@/components/main/post/post";
import { ProfileInfo } from "@/routes/Profile";
import { Message } from "@/store/chat-slice";

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
  loadFeed: {
    edges: { node: PostProps; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
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

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount {
    fetchUnreadNotificationsCount
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
  fetchChatMessages: {
    chatName: string | null;
    edges: { node: Message; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
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
  fetchUserPosts: {
    edges: { node: PostProps; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
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
  fetchUserLikes: {
    edges: { node: PostProps; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
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
  fetchUserBookmarks: {
    edges: { node: PostProps; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
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
  fetchChildComments: {
    edges: { node: CommentProps; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
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
