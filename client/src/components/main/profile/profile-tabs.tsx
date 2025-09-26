import { Outlet, useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfileTabs = ({
  isPrivate,
  following,
}: {
  isPrivate: boolean;
  following: boolean;
}) => {
  const params = useParams();
  const username = params.username as string;

  return (
    <Tabs defaultValue="posts" value={username} className="w-full">
      <div className="sticky top-0 z-10 bg-background">
        <TabsList className="flex w-full justify-around rounded-none border-b bg-transparent">
          <NavLink to={""} end>
            <TabsTrigger value="posts" className="rounded-none">
              Posts
            </TabsTrigger>
          </NavLink>
          <NavLink to={"likes"}>
            <TabsTrigger value="likes" className="rounded-none">
              Likes
            </TabsTrigger>
          </NavLink>
          <NavLink to={"stories"}>
            <TabsTrigger value="stories" className="rounded-none">
              Stories
            </TabsTrigger>
          </NavLink>
        </TabsList>
      </div>
      <Separator className="mb-1" />
      {isPrivate && !following ? <h3>This account is private.</h3> : <Outlet />}
    </Tabs>
  );
};

export default ProfileTabs;
