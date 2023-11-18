import { gql } from "@apollo/client/core";

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
      lastLogin
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

export const GET_POSTS = gql`
  query LoadFeed {
    loadFeed {
      _id
      content
      images
      commentsCount
      createdAt
      updatedAt
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
    }
  }
`;
