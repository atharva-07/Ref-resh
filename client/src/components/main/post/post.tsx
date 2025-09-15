import {
  Bookmark,
  Edit,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { user } from "@/store/auth-slice";
import {
  getRandomAvatarBgColor,
  getRelativeTime,
} from "@/utility/utility-functions";

import ImageGrid, { ImageGridProps } from "../image-grid";
import { PostActions } from "./post-actions";
import { PostAuthor } from "./post-author";

export interface TimeStamps {
  createdAt: string;
  updatedAt: string;
}

export interface BasicUserData {
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
  bookmarks: string[];
  author: BasicUserData;
  className?: string;
}

const Post = ({
  _id,
  content,
  images,
  likes,
  commentsCount,
  bookmarks,
  author,
  createdAt,
  className,
}: PostProps) => {
  const { theme } = useTheme();
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const params = useParams();

  const [likeCount, setLikeCount] = useState<number>(likes.length);
  const [liked, setLiked] = useState<boolean>(
    typeof likes[0] === "string"
      ? (likes as string[]).includes(loggedInUser!.userId)
      : (likes as BasicUserData[]).some(
          (like) => like._id === loggedInUser!.userId
        )
  );
  const [bookmarked, setBookmarked] = useState<boolean>(
    bookmarks?.includes(loggedInUser!.userId)
  );

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const authorInitials: string = author.firstName[0] + author.lastName[0];

  return (
    <Card
      key={_id}
      className={cn(
        "border-0 border-b border-border rounded-none p-4 hover:bg-muted/50 transition-colors",
        className
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 rounded-lg">
          {/* <Link to={`@${author.userName}`}> */}
          <AvatarImage src={author.pfpPath} alt={authorInitials} />
          <AvatarFallback
            className={`w-full h-full rounded-lg
               ${getRandomAvatarBgColor(theme)}`}
          >
            {authorInitials}
          </AvatarFallback>
          {/* </Link> */}
        </Avatar>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-2 mb-1">
            <span className="font-semibold leading-5 text-foreground">
              {author.firstName + " " + author.lastName}
            </span>
            <span className="text-muted-foreground text-sm hover:underline cursor-pointer">
              <Link
                to={params.username ? `/${author.userName}` : author.userName}
              >
                @{author.userName}
              </Link>
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {getRelativeTime(createdAt)}
            </span>
            {author._id === loggedInUser?.userId && (
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => console.log("Post Updated.")}
                    >
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
            )}
          </div>

          {/* Content */}
          {/* <div className="text-foreground mb-3 leading-relaxed whitespace-pre-wrap text-base"> */}
          <Link to={`/post/${_id}`}>
            <p className="cursor-pointer">{content}</p>
          </Link>
          {/* </div> */}

          {/* Images */}
          {images && images.length > 0 && (
            <div
              className={cn(
                "my-3 rounded-2xl overflow-hidden border border-border",
                images.length === 1 && "max-w-lg",
                images.length === 2 && "grid grid-cols-2 gap-0.5 h-48",
                images.length === 3 &&
                  "grid grid-cols-2 grid-rows-2 gap-0.5 h-64",
                images.length >= 4 &&
                  "grid grid-cols-2 grid-rows-2 gap-0.5 h-64"
              )}
            >
              {images.slice(0, 4).map((image, index) => (
                <Link to={`/post/${_id}/photos`} key={index}>
                  <div
                    className={cn(
                      "relative bg-muted",
                      images.length === 3 && index === 2 && "col-span-2",
                      images.length === 1 && "aspect-video max-h-96",
                      images.length === 2 && "h-full",
                      images.length === 3 && "h-full",
                      images.length >= 4 && "h-full"
                    )}
                  >
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 4 && index === 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-xl">
                          +{images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md mt-2">
            {/* Like */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-8 px-2 hover:bg-red-500/10 group",
                liked ? "text-like" : "text-muted-foreground hover:text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4 mr-1", liked && "fill-current")} />
              <span className="text-sm">
                {likeCount > 0 ? formatCount(likeCount) : ""}
              </span>
            </Button>

            {/* Reply */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 group"
            >
              <MessageCircle className="h-4 w-4 mr-1 group-hover:fill-current" />
              <span className="text-sm">
                {commentsCount > 0 ? formatCount(commentsCount) : ""}
              </span>
            </Button>

            {/* Bookmark */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={cn(
                "h-8 px-2 hover:bg-green-500/10 group",
                bookmarked
                  ? "text-bookmark"
                  : "text-muted-foreground hover:text-green-500"
              )}
            >
              <Bookmark
                className={cn("h-4 w-4", bookmarked && "fill-current")}
              />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Post;
