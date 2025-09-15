import { useQuery, useSuspenseQuery } from "@apollo/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";

import MainSpinner from "@/components/main/main-spinner";
import { TimeStamps } from "@/components/main/post/post";
import { BasicUserData } from "@/components/main/post/post-author";
import ProfileHeader from "@/components/main/profile/profile-header";
import ProfileTabs from "@/components/main/profile/profile-tabs";
import { GET_USER_PROFILE } from "@/gql-calls/queries";

export interface ProfileInfo extends TimeStamps {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  gender: string;
  dob: string;
  privateAccount: boolean;
  joinedDate: string;
  pfpPath: string;
  bannerPath: string;
  bio: string;
  followers: BasicUserData[];
  following: BasicUserData[];
}

const Profile = () => {
  return (
    <ErrorBoundary fallback={<h2>Failed to fetch posts.</h2>}>
      <Suspense fallback={<MainSpinner message="Loading user profile..." />}>
        <main className="w-4/5 *:w-4/5 *:mx-auto *:border border-t-0">
          <ProfileHeader />
          <ProfileTabs />
        </main>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Profile;
