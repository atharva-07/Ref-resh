import { Edit3, LogOutIcon, RefreshCwOff, Settings2 } from "lucide-react";
import { useState } from "react";

import { Modal, OverlayType } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { authActions } from "@/store/auth-slice";

import { ModeToggle } from "../right-sidebar/theme-toggle";
import Navigation from "./navigation";
import UserProfileButton, {
  UserProfileButtonProps,
} from "./user-profile-button";

const userProfileButtonProps: UserProfileButtonProps = {
  imagePath: "https://avatars.githubusercontent.com/u/67833926?v=4",
  fullName: "Atharva Wankhede",
  username: "atharva07",
};

const LeftSidebar = () => {
  const [modal, openModal] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  return (
    <>
      {modal && (
        <Modal
          type={OverlayType.NEW_POST}
          strict={true}
          onClose={() => {
            openModal(false);
          }}
        />
      )}
      <div className="fixed flex flex-col gap-20 h-screen w-[260px] shrink-0">
        <div className="flex items-center gap-6 py-3">
          <RefreshCwOff className="text-accent" size={48} />
          <ModeToggle />
        </div>
        <Navigation />
        <Button
          className="font-semibold"
          onClick={() => {
            openModal(true);
          }}
        >
          Compose New Post
        </Button>
        <div className="flex justify-between items-center">
          <UserProfileButton {...userProfileButtonProps} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => console.log("Password Updated.")}
              >
                Update Password
                <Edit3 className="ml-2 h-[1rem] w-[1rem]" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  dispatch(authActions.logout());
                  console.log("Logged Out.");
                }}
              >
                Logout
                <LogOutIcon className="ml-2 h-[1rem] w-[1rem]" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
