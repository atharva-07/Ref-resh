import { useLazyQuery, useMutation } from "@apollo/client";
import { Edit3, LogOutIcon, RefreshCwOff, Settings2 } from "lucide-react";

import PostWriterModal from "@/components/modal/post-writer-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOGOUT } from "@/gql-calls/mutation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { authActions } from "@/store/auth-slice";

import { ModeToggle } from "../right-sidebar/theme-toggle";
import Navigation from "./navigation";
import UserProfileButton from "./user-profile-button";

const LeftSidebar = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [logout, { data, error, loading }] = useMutation(LOGOUT, {
    variables: { userId: user?.userId },
  });

  return (
    <>
      <div className="fixed flex flex-col gap-20 h-screen w-[260px] shrink-0">
        <div className="flex items-center gap-6 py-3">
          <RefreshCwOff className="text-accent" size={48} />
          <ModeToggle />
        </div>
        <Navigation />
        <PostWriterModal>
          <Button className="font-semibold">Compose New Post</Button>
        </PostWriterModal>
        <div className="flex justify-between items-center">
          <UserProfileButton />
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
                  logout();
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
