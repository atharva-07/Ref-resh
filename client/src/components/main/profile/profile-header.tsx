"use client";

import { useMutation, useSuspenseQuery } from "@apollo/client";
import { Calendar, MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";

import UpdateProfileForm from "@/components/forms/update-profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FOLLOW_UNFOLLOW_USER } from "@/gql-calls/mutation";
import {
  GET_SENT_FOLLOW_REQUESTS,
  GET_USER_FOLLOWERS,
  GET_USER_FOLLOWING,
  GET_USER_PROFILE,
  PaginatedData,
  SEARCH_USER_FOLLOWERS,
  SEARCH_USER_FOLLOWING,
} from "@/gql-calls/queries";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ProfileInfo } from "@/routes/Profile";
import {
  getISOStringFromTimestamp,
  getMonthAndYear,
} from "@/utility/utility-functions";

import { BasicUserData } from "../post/post";
import SearchList, { Query } from "../search-list";

const ProfileHeader = (user: ProfileInfo) => {
  const location = useLocation();
  const { user: loggedInUser } = useAppSelector((state) => state.auth);

  const updateProfileFormRef = useRef<{ submitForm: () => void }>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const fetchFollowers: Query<{
    fetchUserFollowers: PaginatedData<BasicUserData>;
  }> = {
    query: GET_USER_FOLLOWERS,
    variables: {
      userId: loggedInUser!.userId,
    },
  };

  const fetchFollowing: Query<{
    fetchUserFollowing: PaginatedData<BasicUserData>;
  }> = {
    query: GET_USER_FOLLOWING,
    variables: {
      userId: loggedInUser!.userId,
    },
  };

  const searchFollowers: Query<{ searchUserFollowers: BasicUserData[] }> = {
    query: SEARCH_USER_FOLLOWERS,
    variables: {
      userId: loggedInUser!.userId,
    },
  };

  const searchFollowing: Query<{ searchUserFollowing: BasicUserData[] }> = {
    query: SEARCH_USER_FOLLOWING,
    variables: {
      userId: loggedInUser!.userId,
    },
  };

  const [followUnfollowUser] = useMutation(FOLLOW_UNFOLLOW_USER);

  const alreadyFollowing = user.followers.find(
    (user) => user._id === loggedInUser?.userId
  );

  const ownAccount = loggedInUser?.userId === user._id;

  const { data: sentRequests } = useSuspenseQuery(GET_SENT_FOLLOW_REQUESTS);
  const alreadyRequested = sentRequests.fetchSentFollowRequests.find(
    (reqUser) => reqUser._id === user._id
  );

  const [followStatus, setFollowStatus] = useState<string>(
    alreadyFollowing ? "Following" : alreadyRequested ? "Requested" : "Follow"
  );

  const handleProfileShare = async () => {
    try {
      // TODO: FIXME: domain name has to manually pre-pended here.
      await navigator.clipboard.writeText(`${location.pathname}`);
      toast.success("Copied to Clipboard.", {
        description: "Profile URL has been copied.",
      });
    } catch (error) {
      toast.error("Failed to copy.");
    }
  };

  // const handleAccountBlock = async () => {
  //   try {

  //   } catch(error) {

  //   }
  // }

  const handleFollowUnfollow = async () => {
    try {
      const { data } = await followUnfollowUser({
        variables: {
          userName: user.userName,
        },
        refetchQueries: [GET_USER_PROFILE],
      });

      if (data?.followOrUnfollowUser) {
        if (data.followOrUnfollowUser.status === "UNFOLLOWED") {
          toast.success(`Unfollowed ${user.userName}.`, {
            description: `You have unfollowed ${user.userName}.`,
          });
          setFollowStatus("Follow");
        } else if (data.followOrUnfollowUser.status === "REMOVED") {
          setFollowStatus("Follow");
        } else if (data.followOrUnfollowUser.status === "REQUESTED") {
          toast.success(`Requested ${user.userName}.`, {
            description: `You have requested to follow ${user.userName}.`,
          });
          setFollowStatus("Requested");
        } else {
          toast.success(`Followed ${user.userName}.`, {
            description: `You are now following ${user.userName}.`,
          });
          setFollowStatus("Following");
        }
      }
    } catch (error) {
      toast.error(
        `Could not ${alreadyFollowing ? "unfollow" : "follow"} @${user.userName}.`,
        {
          description: "Please try again later.",
        }
      );
    }
  };

  return (
    <section className="w-full">
      {/* Banner */}
      <div className="relative h-44 bg-muted md:h-56">
        {user.bannerPath ? (
          <img
            src={user.bannerPath}
            alt="Profile banner"
            className="h-full w-full object-cover"
          />
        ) : null}

        {/* Overlapping avatar */}
        <div className="absolute -bottom-12 left-4">
          <Avatar className="h-24 w-24 border-4 border-background md:h-28 md:w-28">
            <AvatarImage src={user.pfpPath} alt={`${user.firstName} avatar`} />
            <AvatarFallback className="text-lg">
              {user.firstName[0] + user.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-end gap-2 px-4 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleProfileShare}>
              Share profile
            </DropdownMenuItem>
            {!ownAccount && (
              <DropdownMenuItem
                className="text-destructive"
                // onClick={handleAccountBlock}
              >
                Block Account
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {!ownAccount && (
          <Button className="rounded-full" onClick={handleFollowUnfollow}>
            {followStatus}
          </Button>
        )}

        {ownAccount && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              asChild
              onClick={() => {
                setIsDialogOpen(true);
              }}
            >
              <Button className="rounded-full">Edit profile</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Please update the profile information as you like...
              </DialogDescription>
              <UpdateProfileForm
                ref={updateProfileFormRef}
                user={{
                  firstname: user.firstName,
                  lastname: user.lastName,
                  username: user.userName,
                  bio: user.bio,
                }}
                onSubmissionComplete={() => {
                  setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Identity and meta */}
      <div className="space-y-3 px-4 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold leading-none">
              {user.firstName + " " + user.lastName}
            </h1>
          </div>
          <span className="text-sm text-muted-foreground">
            @{user.userName}
          </span>
        </div>

        {user.bio ? (
          <p className="text-pretty text-sm leading-relaxed">{user.bio}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {user.joinedDate ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Joined{" "}
              {getMonthAndYear(getISOStringFromTimestamp(user.joinedDate))}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <SearchList searchQuery={searchFollowers} fetchQuery={fetchFollowers}>
            <span>
              <b className="font-semibold">{user.followers.length}</b>{" "}
              <span className="text-muted-foreground">Followers</span>
            </span>
          </SearchList>
          <SearchList searchQuery={searchFollowing} fetchQuery={fetchFollowing}>
            <span>
              <b className="font-semibold">{user.following.length}</b>{" "}
              <span className="text-muted-foreground">Following</span>
            </span>
          </SearchList>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
