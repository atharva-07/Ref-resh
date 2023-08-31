import { gql } from "@apollo/client/core";

const GET_USER_PROFILE = gql`
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
