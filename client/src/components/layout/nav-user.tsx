import { useMutation } from "@apollo/client";
import { ChevronsUpDown, Edit, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LOGOUT } from "@/gql-calls/mutation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { client } from "@/middlewares/auth";
import { authActions } from "@/store/auth-slice";
import { socketActions } from "@/store/middlewares/socket-middleware";
import { sseActions } from "@/store/middlewares/sse-middleware";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface NavUserProps {
  user: {
    userId: string;
    fullName: string;
    username: string;
    pfpPath: string;
  };
}

const NavUser = ({ user }: NavUserProps) => {
  const dispatch = useAppDispatch();
  const [logout] = useMutation(LOGOUT);

  const { isMobile } = useSidebar();
  const [firstName, lastName] = user.fullName.split(" ");
  const userInitials = firstName[0] + lastName[0];

  const handleLogout = async () => {
    try {
      const { data } = await logout();
      if (data?.logout) {
        dispatch(authActions.logout());
        dispatch({ type: socketActions.disconnect });
        dispatch({ type: sseActions.disconnect });
        client.clearStore();
      }
    } catch (error) {
      toast.error("Could not logout.", {
        description: "Please try again.",
      });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.pfpPath} alt={user?.fullName} />
                <AvatarFallback className="rounded-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.fullName}</span>
                <span className="truncate text-xs">{user?.username}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <Link to={`${user.username}`}>
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.pfpPath} alt={user?.fullName} />
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.fullName}
                    </span>
                    <span className="truncate text-xs">{user?.username}</span>
                  </div>
                </div>
              </Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link to="/settings" className="flex w-full">
                  <Settings className="size-4 mr-2" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="bg-destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default NavUser;
