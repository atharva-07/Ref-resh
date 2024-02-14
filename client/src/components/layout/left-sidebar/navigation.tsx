import {
  BellIcon,
  Bookmark,
  Home,
  MessageSquarePlusIcon,
  User2,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const username: string = "atharva07";

const Navigation = () => {
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
        <div className="p-2.5 flex transition-linear-bg-secondary w-fit rounded-3xl">
          <BellIcon className="inline-block h-fit w-[2rem]" />
          <span className="mx-3 text-2xl tracking-wide">Notifications</span>
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
        to={`@${username}`}
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
