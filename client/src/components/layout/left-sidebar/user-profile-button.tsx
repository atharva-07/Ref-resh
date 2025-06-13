import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getRandomAvatarBgColor } from "@/utility/utility-functions";

const UserProfileButton = () => {
  const loggedInUser = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex p-1 pr-2 rounded-md hover:bg-secondary hover:cursor-pointer">
      <Avatar>
        <AvatarImage src={loggedInUser?.pfpPath} />
        <AvatarFallback className={getRandomAvatarBgColor()}>
          {loggedInUser?.fullName.split(" ")[0][0]}
        </AvatarFallback>
      </Avatar>
      <div className="ml-4">
        <p>{loggedInUser?.fullName}</p>
        <p className="text-sm text-slate-400">@{loggedInUser?.username}</p>
      </div>
    </div>
  );
};

export default UserProfileButton;
