import { Image } from "lucide-react";

import { useAppSelector } from "@/hooks/useAppSelector";
import { getRandomAvatarBgColor } from "@/utility/utility-functions";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

const NewPostCard = () => {
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const [firstName, lastName] = loggedInUser!.fullName.split(" ");
  const userInitials = firstName[0] + lastName[0];

  return (
    <div className="flex align-center mt-2 child:m-2 child:mt-0 border-accent border-b-4 cursor-pointer">
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={loggedInUser?.pfpPath} alt={loggedInUser?.fullName} />
        <AvatarFallback className={`rounded-lg ${getRandomAvatarBgColor()}`}>
          {userInitials}
        </AvatarFallback>
      </Avatar>
      <span className="pl-3 leading-9 border border-border text-muted-foreground grow rounded-full">
        What's happening?
      </span>
      <div className="rounded-full p-2">
        <Image className="w-5 h-5" />
      </div>
    </div>
  );
};

export default NewPostCard;
