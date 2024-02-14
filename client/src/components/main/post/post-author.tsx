import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRandomAvatarBgColor } from "@/utility/utility-functions";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

interface BasicUserData {
  _id: string;
  userName: string;
  firstName: string;
  lastName: string;
  pfpPath: string;
}

interface PostAuthorProps {
  author: BasicUserData;
  createdAt: string;
}

export const PostAuthor = ({ author, createdAt }: PostAuthorProps) => {
  return (
    <div className="flex">
      <div className="px-3">
        <Avatar className="w-10 h-10 hover:cursor-pointer">
          <AvatarImage src={author.pfpPath} />
          <AvatarFallback className={getRandomAvatarBgColor()}>
            {author.firstName[0]}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex justify-between items-start flex-grow">
        <div className="flex gap-2 items-center text-[17px] font-normal">
          <span className="font-bold">
            {`${author.firstName} ${author.lastName}`}
          </span>
          <span className="text-slate-500">@{author.userName}</span>
          <div className="w-1 h-1 rounded-full bg-slate-600 opacity-80"></div>
          <span className="text-slate-500">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="px-2 rounded-full hover:bg-secondary">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreHorizontal className="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log("Post Updated.")}>
                Edit Post
                <Edit className="ml-2 h-[1rem] w-[1rem]" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => console.log("Post Deleted.")}
              >
                Delete Post
                <Trash2 className="ml-2 h-[1rem] w-[1rem]" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
