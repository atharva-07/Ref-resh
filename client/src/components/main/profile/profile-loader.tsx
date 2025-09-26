import { useQuery, useSuspenseQuery } from "@apollo/client";
import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";

import { GET_USER_PROFILE } from "@/gql-calls/queries";
import { useAppSelector } from "@/hooks/useAppSelector";

import ProfileHeader from "./profile-header";
import ProfileTabs from "./profile-tabs";

const ProfileLoader = () => {
  const { user: loggedInUser } = useAppSelector((state) => state.auth);

  const params = useParams();
  const username = params.username as string;

  const { data, error } = useQuery(GET_USER_PROFILE, {
    variables: {
      userName: username,
    },
  });

  const blocked =
    error && error.cause && error.cause.message === "Blocked/Forbidden";
  const user = data && data.fetchUserProfile;

  const alreadyFollowing =
    user && user.followers.find((user) => user._id === loggedInUser?.userId);

  return (
    <>
      {blocked && (
        <div className="text-center">
          <h4>Content not visible.</h4>
        </div>
      )}
      {data && (
        <>
          <ProfileHeader {...user!} />
          <ProfileTabs
            isPrivate={user!.privateAccount}
            following={!!alreadyFollowing}
          />
        </>
      )}
    </>
  );
};

export default ProfileLoader;
