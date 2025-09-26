import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import MainSpinner from "@/components/main/main-spinner";
import { BasicUserData, TimeStamps } from "@/components/main/post/post";
import ProfileLoader from "@/components/main/profile/profile-loader";

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
    <ErrorBoundary fallback={<h2>Failed to load profile.</h2>}>
      <Suspense fallback={<MainSpinner message="Loading user profile..." />}>
        <main className="w-4/5 *:w-4/5 *:mx-auto *:border border-t-0">
          <ProfileLoader />
        </main>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Profile;
