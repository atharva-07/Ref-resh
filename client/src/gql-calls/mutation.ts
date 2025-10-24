import { gql, TypedDocumentNode } from "@apollo/client/core";

import { CommentProps } from "@/components/main/comment/comment";
import { BasicUserData, PostProps } from "@/components/main/post/post";
import { StoryProps } from "@/components/main/story/story";

export const SIGNUP = gql`
  mutation Signup($signupData: SignUpData!) {
    signup(signupData: $signupData)
  }
`;

export const LOGOUT: TypedDocumentNode<{
  logout: string;
}> = gql`
  mutation Logout {
    logout
  }
`;

export const SET_READ_NOTIFICATIONS_AT: TypedDocumentNode<{
  setReadNotificationsAt: string;
}> = gql`
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

export const UPDATE_LAST_SEEN: TypedDocumentNode<{
  updateLastSeen: {
    userId: string;
    messageId: string;
    timestamp: string;
  };
}> = gql`
  mutation UpdateLastSeen($chatId: ID!, $messageId: ID!) {
    updateLastSeen(chatId: $chatId, messageId: $messageId) {
      messageId
      timestamp
    }
  }
`;

export const UPDATE_USER_PROFILE: TypedDocumentNode<{
  updateUserProfile: BasicUserData;
}> = gql`
  mutation UpdateUserProfile($userProfileData: UserProfileData!) {
    updateUserProfile(userProfileData: $userProfileData) {
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

export const UPDATE_USER_INFO: TypedDocumentNode<{
  updateUserInfo: BasicUserData;
}> = gql`
  mutation UpdateUserInfo($userInfoData: UserInfoData!) {
    updateUserInfo(userInfoData: $userInfoData) {
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

export const CREATE_POST: TypedDocumentNode<{
  createPost: PostProps;
}> = gql`
  mutation CreatePost($postData: PostData!) {
    createPost(postData: $postData) {
      _id
      content
      images
      commentsCount
      edited
      author {
        _id
        userName
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_COMMENT: TypedDocumentNode<{
  postComment: CommentProps;
}> = gql`
  mutation PostComment($commentData: CommentData!) {
    postComment(commentData: $commentData) {
      _id
      content
      commentsCount
      edited
      author {
        _id
        userName
      }
      createdAt
      updatedAt
    }
  }
`;

export const LIKE_UNLIKE_POST: TypedDocumentNode<{
  likeOrUnlikePost: string;
}> = gql`
  mutation LikeOrUnlikePost($postId: ID!) {
    likeOrUnlikePost(postId: $postId)
  }
`;

export const ADD_REMOVE_BOOKMARK: TypedDocumentNode<{
  addOrRemoveBookmark: string;
}> = gql`
  mutation AddOrRemoveBookmark($postId: ID!) {
    addOrRemoveBookmark(postId: $postId)
  }
`;

export const LIKE_UNLIKE_COMMENT: TypedDocumentNode<{
  likeOrUnlikeComment: string;
}> = gql`
  mutation LikeOrUnlikeComment($commentId: ID!) {
    likeOrUnlikeComment(commentId: $commentId)
  }
`;

export const EDIT_POST: TypedDocumentNode<{
  editPost: PostProps;
}> = gql`
  mutation EditPost($postId: ID!, $content: String!) {
    editPost(postId: $postId, content: $content) {
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

export const EDIT_COMMENT: TypedDocumentNode<{
  editComment: CommentProps;
}> = gql`
  mutation EditComment($commentId: ID!, $content: String!) {
    editComment(commentId: $commentId, content: $content) {
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
`;

export const DELETE_POST: TypedDocumentNode<{
  removePost: string;
}> = gql`
  mutation RemovePost($postId: ID!) {
    removePost(postId: $postId)
  }
`;

export const DELETE_COMMENT: TypedDocumentNode<{
  removeComment: string;
}> = gql`
  mutation RemoveComment($postId: ID!, $commentId: ID!) {
    removeComment(postId: $postId, commentId: $commentId)
  }
`;

export const ACCEPT_REQUEST: TypedDocumentNode<{
  acceptFollowRequest: string;
}> = gql`
  mutation AcceptFollowRequest($userId: ID!) {
    acceptFollowRequest(userId: $userId)
  }
`;

export const REJECT_REQUEST: TypedDocumentNode<{
  rejectFollowRequest: string;
}> = gql`
  mutation RejectFollowRequest($userId: ID!) {
    rejectFollowRequest(userId: $userId)
  }
`;

export const FOLLOW_UNFOLLOW_USER: TypedDocumentNode<{
  followOrUnfollowUser: {
    _id: string;
    status: "REMOVED" | "REQUESTED" | "UNFOLLOWED" | "FOLLOWED";
  };
}> = gql`
  mutation FollowOrUnfollowUser($userName: String!) {
    followOrUnfollowUser(userName: $userName) {
      _id
      status
    }
  }
`;

export const BLOCK_UNBLOCK_USER: TypedDocumentNode<{
  blockOrUnblockUser: {
    user: BasicUserData;
    status: "BLOCKED" | "UNBLOCKED";
  };
}> = gql`
  mutation BlockOrUnblockUser($userId: ID!) {
    blockOrUnblockUser(userId: $userId) {
      user {
        _id
        userName
      }
      status
    }
  }
`;

export const TOGGLE_ACCOUNT_TYPE: TypedDocumentNode<{
  toggleAccountType: {
    _id: string;
    updatedAccountType: "PRIVATE" | "PUBLIC";
  };
}> = gql`
  mutation ToggleAccountType {
    toggleAccountType {
      _id
      updatedAccountType
    }
  }
`;

export const CHANGE_PASSWORD: TypedDocumentNode<{
  changePassword: string;
}> = gql`
  mutation ChangePassword($passwordResetData: PasswordResetData!) {
    changePassword(passwordResetData: $passwordResetData)
  }
`;

export const CREATE_STORY: TypedDocumentNode<{
  createStory: StoryProps;
}> = gql`
  mutation CreateStory($storyData: StoryData!) {
    createStory(storyData: $storyData) {
      _id
      image
      caption
      createdAt
      updatedAt
      author {
        _id
        firstName
        lastName
        userName
        bio
        pfpPath
        bannerPath
      }
    }
  }
`;

export const DELETE_STORY: TypedDocumentNode<{
  removeStory: string;
}> = gql`
  mutation RemoveStory($storyId: ID!) {
    removeStory(storyId: $storyId)
  }
`;

export const SET_STORY_SEEN: TypedDocumentNode<{
  setStorySeenBy: string;
}> = gql`
  mutation SetStorySeenBy($storyId: ID!) {
    setStorySeenBy(storyId: $storyId)
  }
`;
