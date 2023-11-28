import {
  Dot,
  Edit,
  Heart,
  MessageCircleIcon,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRandomAvatarBgColor } from "@/utility/utility-functions";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import ImageGrid, { ImageGridProps } from "./image-grid";

export interface TimeStamps {
  createdAt: string;
  updatedAt: string;
}

interface BasicUserData {
  _id: string;
  userName: string;
  firstName: string;
  lastName: string;
  pfpPath: string;
}

export interface PostProps extends TimeStamps {
  _id: string;
  content: string;
  images?: string[];
  commentsCount: number;
  likes: string[] | BasicUserData[];
  author: BasicUserData;
}

const Post = ({
  _id,
  content,
  images,
  likes,
  commentsCount,
  author,
  createdAt,
}: PostProps) => {
  return (
    <div className="flex border-border border-b pt-3 hover:cursor-pointer">
      <div className="p-2 pt-0">
        <Avatar className="w-10 h-10 hover:cursor-pointer">
          <AvatarImage src={author.pfpPath} />
          <AvatarFallback className={getRandomAvatarBgColor()}>
            {author.firstName[0]}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow px-3 child:mb-1.5 last:child:mb-2.5">
        <div className="flex justify-between">
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
          <div className="px-2 rounded-full hover-secondary">
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
        <div>{content}</div>
        {images && images?.length > 0 && <ImageGrid images={images} />}
        <div className="flex gap-2 text-center mt-4 text-[15px]">
          <div className="flex-grow rounded-3xl child:mx-2 hover:text-red-500 hover:cursor-pointer">
            <Heart className="inline-block" />
            {likes.length}
          </div>
          <div className="flex-grow rounded-3xl child:mx-2 hover:text-sky-500 hover:cursor-pointer">
            <MessageCircleIcon className="inline-block" />
            {commentsCount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
