import { gql, TypedDocumentNode } from "@apollo/client/core";

export const SIGNUP = gql`
  mutation Signup($signupData: SignUpData!) {
    signup(signupData: $signupData)
  }
`;

export const LOGOUT = gql`
  mutation Logout($userId: ID!) {
    logout(userId: $userId)
  }
`;

export const SET_READ_NOTIFICATIONS_AT = gql`
  mutation SetReadNotificationsAt {
    setReadNotificationsAt
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendChatMessage($messageData: MessageData!) {
    sendChatMessage(messageData: $messageData) {
      _id
      content
      chat {
        _id
        chatName
      }
      sender {
        _id
        userName
        lastName
        firstName
        pfpPath
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_NEW_CHAT = gql`
  mutation CreateNewChat($chatMembers: [ID!]!, $chatName: String) {
    createNewChat(chatMembers: $chatMembers, chatName: $chatName) {
      _id
      chatName
      members {
        _id
        userName
        pfpPath
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_LAST_SEEN = gql`
  mutation UpdateLastSeen($chatId: ID!, $messageId: ID!) {
    updateLastSeen(chatId: $chatId, messageId: $messageId) {
      messageId
      timestamp
    }
  }
`;

export const UPDATE_USER_INFO = gql`
  mutation UpdateUserInfo($userProfileData: UserProfileData!) {
    updateUserInfo(userProfileData: $userProfileData) {
      _id
      firstName
      lastName
      userName
      bio
      pfpPath
      bannerPath
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($postData: PostData!) {
    createPost(postData: $postData) {
      _id
      content
      images
      commentsCount
      author {
        _id
        userName
      }
      createdAt
      updatedAt
    }
  }
`;
