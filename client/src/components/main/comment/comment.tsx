import {
  Edit,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  getRandomAvatarBgColor,
  getRelativeTime,
} from "@/utility/utility-functions";

import { BasicUserData, PostProps } from "../post/post";

export type CommentProps = Omit<PostProps, "images" | "bookmarks"> & {
  post: string;
};

const Comment = ({
  _id,
  content,
  likes,
  post: postId,
  commentsCount,
  author,
  createdAt,
  className,
  hero = false,
}: CommentProps & { hero?: boolean }) => {
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

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
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
        "border-0 border-b border-border rounded-none p-4 pb-1 hover:bg-muted/50 transition-colors",
        className
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className={`${hero ? "h-10 w-10" : "h-8 w-8 rounded-lg"}`}>
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
            <div className={`flex ${hero ? "flex-col" : "items-center"} gap-1`}>
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
            </div>

            {!hero && (
              <>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm">
                  {getRelativeTime(createdAt)}
                </span>
              </>
            )}
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
                      Edit Comment
                      <Edit className="ml-2 h-[1rem] w-[1rem]" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => console.log("Post Deleted.")}
                    >
                      Delete Comment
                      <Trash2 className="ml-2 h-[1rem] w-[1rem]" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          {/* Content */}
          {/* <div className="text-foreground mb-3 leading-relaxed whitespace-pre-wrap text-base"> */}

          {hero ? (
            <p className="mt-4">{content}</p>
          ) : (
            <Link to={`/comment/${_id}`}>
              <p>{content}</p>
            </Link>
          )}
          {/* </div> */}
          {hero && (
            <div className="mb-4">
              <span className="text-muted-foreground text-sm">
                {moment(createdAt).format("LT")}
                &nbsp;&middot;&nbsp;
                {moment(createdAt).format("ll")}
              </span>
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
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Comment;
