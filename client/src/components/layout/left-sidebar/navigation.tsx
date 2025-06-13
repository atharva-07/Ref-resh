import {
  BellIcon,
  Bookmark,
  Home,
  MessageSquarePlusIcon,
  User2,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAppSelector } from "@/hooks/useAppSelector";

const Navigation = () => {
  const loggedInUser = useAppSelector((state) => state.auth.user);

  return (
    <nav>
      <NavLink
        to="/"
        className={({ isActive }) => `inline-block ${isActive ? "active" : ""}`}
        end
      >
        <div className="p-2.5 flex transition-linear-bg-secondary w-fit rounded-3xl">
          <Home className="inline-block h-fit w-[2rem]" />
          <span className="mx-3 text-2xl tracking-wide">Home</span>
        </div>
      </NavLink>
      <NavLink
        to="/notifications"
        className={({ isActive }) => `inline-block ${isActive ? "active" : ""}`}
      >
        <div className="p-2.5 flex transition-linear-bg-secondary w-fit rounded-3xl relative">
          <BellIcon className="inline-block h-fit w-[2rem]" />
          <span className="mx-3 text-2xl tracking-wide">Notifications</span>
          <span className="absolute top-1 left-0 rounded-full py-[0.5] px-2 bg-primary">
            4
          </span>
        </div>
      </NavLink>
      <NavLink
        to="/conversations"
        className={({ isActive }) => `inline-block ${isActive ? "active" : ""}`}
      >
        <div className="p-2.5 flex transition-linear-bg-secondary w-fit rounded-3xl">
          <MessageSquarePlusIcon className="inline-block h-fit w-[2rem]" />
          <span className="mx-3 text-2xl tracking-wide">Conversations</span>
        </div>
      </NavLink>
      <NavLink
        to="/bookmarks"
        className={({ isActive }) => `inline-block ${isActive ? "active" : ""}`}
      >
        <div className="p-2.5 flex transition-linear-bg-secondary w-fit rounded-3xl">
          <Bookmark className="inline-block h-fit w-[2rem]" />
          <span className="mx-3 text-2xl tracking-wide">Bookmarks</span>
        </div>
      </NavLink>
      <NavLink
        to={`@${loggedInUser?.username}`}
        className={({ isActive }) => `inline-block ${isActive ? "active" : ""}`}
      >
        <div className="p-2.5 flex transition-linear-bg-secondary w-fit rounded-3xl">
          <User2 className="inline-block h-fit w-[2rem]" />
          <span className="mx-3 text-2xl tracking-wide">Profile</span>
        </div>
      </NavLink>
    </nav>
  );
};

export default Navigation;
