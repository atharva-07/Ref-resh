import {
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

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import ImageGrid, { ImageGridProps } from "../image-grid";
import { PostActions } from "./post-actions";
import { PostAuthor } from "./post-author";

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
    <div key={_id} className="border-border border-b py-2 hover:cursor-pointer">
      <PostAuthor author={author} createdAt={createdAt} />
      <div className="pl-16">
        <div>{content}</div>
        {images && images?.length > 0 && <ImageGrid images={images} />}
      </div>
      <PostActions likesCount={likes.length} commentsCount={commentsCount} />
    </div>
  );
};

export default Post;
