"use client";

import { useSuspenseQuery } from "@apollo/client";
import {
  BadgeCheck,
  Calendar,
  LinkIcon,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

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
import { Separator } from "@/components/ui/separator";
import { GET_USER_PROFILE } from "@/gql-calls/queries";
import {
  getISOStringFromTimestamp,
  getMonthAndYear,
} from "@/utility/utility-functions";

const ProfileHeader = () => {
  const params = useParams();
  const username = params.username as string;

  const updateProfileFormRef = useRef<{ submitForm: () => void }>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const { data } = useSuspenseQuery(GET_USER_PROFILE, {
    variables: {
      userName: username,
    },
  });
  const user = data.fetchUserProfile;

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
            <DropdownMenuItem>Share profile</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Block</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
          {/* {user.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {user.location}
            </span>
          ) : null}
          {user.website ? (
            <span className="inline-flex items-center gap-1.5">
              <LinkIcon className="h-4 w-4" />
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                {user.website.replace(/^https?:\/\//, "")}
              </a>
            </span>
          ) : null} */}
          {user.joinedDate ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Joined{" "}
              {getMonthAndYear(getISOStringFromTimestamp(user.joinedDate))}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span>
            <b className="font-semibold">{user.following.length}</b>{" "}
            <span className="text-muted-foreground">Following</span>
          </span>
          <span>
            <b className="font-semibold">{user.followers.length}</b>{" "}
            <span className="text-muted-foreground">Followers</span>
          </span>
          {/* <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {user.postsCount.toLocaleString()} posts
          </span> */}
        </div>
      </div>

      <Separator />
    </section>
  );
};

export default ProfileHeader;
