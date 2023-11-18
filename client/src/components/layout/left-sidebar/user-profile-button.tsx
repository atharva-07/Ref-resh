import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getRandomAvatarBgColor } from "@/utility/utility-functions";

export interface UserProfileButtonProps {
  imagePath: string;
  fullName: string;
  username: string;
}

const UserProfileButton = ({
  imagePath,
  fullName,
  username,
}: UserProfileButtonProps) => {
  return (
    <div className="flex hover:bg-secondary hover:cursor-pointer">
      <Avatar>
        <AvatarImage src={imagePath} />
        <AvatarFallback className={getRandomAvatarBgColor()}>
          {fullName.split(" ")[0][0]}
        </AvatarFallback>
      </Avatar>
      <div className="ml-4">
        <p>{fullName}</p>
        <p>@{username}</p>
      </div>
    </div>
  );
};

export default UserProfileButton;
