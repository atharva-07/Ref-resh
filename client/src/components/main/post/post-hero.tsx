import { useSuspenseQuery } from "@apollo/client";
import {
  Bookmark,
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
import { GET_POST } from "@/gql-calls/queries";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";
import { transformTimestamps } from "@/utility/utility-functions";

import { AspectRatio } from "../../ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../ui/carousel";
import { BasicUserData } from "./post";

const PostHero = () => {
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const params = useParams();
  const postId = params.postId;

  const { data } = useSuspenseQuery(GET_POST, {
    variables: { postId },
    fetchPolicy: "network-only",
  });

  const post = data.fetchSinglePost;
  const author = post.author;
  const authorInitials: string = author.firstName[0] + author.lastName[0];

  const [likeCount, setLikeCount] = useState<number>(post.likes.length);
  const [liked, setLiked] = useState<boolean>(
    typeof post.likes[0] === "string"
      ? (post.likes as string[]).includes(loggedInUser!.userId)
      : (post.likes as BasicUserData[]).some(
          (like) => like._id === loggedInUser!.userId
        )
  );
  const [bookmarked, setBookmarked] = useState<boolean>(
    post.bookmarks?.includes(loggedInUser!.userId)
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

  const { createdAt } = transformTimestamps(post.createdAt, post.updatedAt);

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={author.pfpPath} alt={authorInitials} />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">
              {author.firstName + " " + author.lastName}
            </span>
            <span className="text-muted-foreground text-sm hover:underline cursor-pointer">
              <Link
                to={
                  params.username
                    ? `/${author.userName}`
                    : `/${author.userName}`
                }
              >
                @{author.userName}
              </Link>
            </span>
          </div>
        </div>
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
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="leading-relaxed">{post.content}</p>
      </div>

      {/* Conditional Image Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          <Carousel className="w-full">
            <CarouselContent>
              {post.images.map((image, index) => (
                <CarouselItem key={index}>
                  <Link to={`/post/${post._id}/photos`} key={index}>
                    <AspectRatio ratio={16 / 9}>
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-auto rounded-lg border border-secondary"
                      />
                    </AspectRatio>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {post.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 bg-accent/60 text-accent-foreground border-muted hover:bg-accent" />
                <CarouselNext className="right-2 bg-accent/60 text-accent-foreground border-muted hover:bg-accent" />
              </>
            )}
          </Carousel>
        </div>
      )}

      {/* Timestamps */}
      <div className="mb-4">
        <span className="text-muted-foreground text-sm">
          {moment(createdAt).format("LT")}
          &nbsp;&middot;&nbsp;
          {moment(createdAt).format("ll")}
        </span>
      </div>

      {/* Engagement Buttons */}
      <div className="flex items-center justify-between">
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
            {post.commentsCount > 0 ? formatCount(post.commentsCount) : ""}
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
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
        </Button>
      </div>
    </Card>
  );
};

export default PostHero;
