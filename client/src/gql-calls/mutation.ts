import { gql, TypedDocumentNode } from "@apollo/client/core";

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
    createNewChat(chatMembers: $chatMembers, chatName: $chatName)
  }
`;
