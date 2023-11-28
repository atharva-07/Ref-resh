import { Image } from "lucide-react";

import { getRandomAvatarBgColor } from "@/utility/utility-functions";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "./button";

const PostWriter = () => {
  return (
    <div className="mt-2 child:m-2 child:mt-0 border-accent border-b-4">
      <div className="ml-2 text-xl font-bold">Hi there, Atharva! 👋</div>
      <div className="flex gap-4 text-base">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={"https://avatars.githubusercontent.com/u/67833926?v=4"}
          />
          <AvatarFallback className={getRandomAvatarBgColor()}>
            A{/* {user.firstName[0]} */}
          </AvatarFallback>
        </Avatar>
        <div
          contentEditable={true}
          data-text="What's happening?"
          className="flex-grow overflow-auto focus-within:outline-none text-[15px]"
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <div className="rounded-full p-2 hover:cursor-pointer hover-secondary">
            <Image className="w-5 h-5" />
          </div>
        </div>
        <Button size="sm" className="font-semibold rounded-3xl hover-primary">
          Post
        </Button>
      </div>
    </div>
  );
};

export default PostWriter;
