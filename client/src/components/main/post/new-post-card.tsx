import { Image } from "lucide-react";

import { getRandomAvatarBgColor } from "@/utility/utility-functions";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

const NewPostCard = () => {
  return (
    <div className="flex align-center mt-2 child:m-2 child:mt-0 border-accent border-b-4 cursor-pointer">
      <Avatar className="w-10 h-10">
        <AvatarImage
          src={"https://avatars.githubusercontent.com/u/67833926?v=4"}
        />
        <AvatarFallback className={getRandomAvatarBgColor()}>
          A{/* {user.firstName[0]} */}
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
