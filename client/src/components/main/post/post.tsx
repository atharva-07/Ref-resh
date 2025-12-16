import { useMutation } from "@apollo/client";
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
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import EditPostForm from "@/components/forms/edit-post";
import EditPostFormSheet from "@/components/forms/edit-post";
import CommentWriterModal from "@/components/modal/comment-writer-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ADD_REMOVE_BOOKMARK,
  DELETE_POST,
  LIKE_UNLIKE_POST,
} from "@/gql-calls/mutation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { user } from "@/store/auth-slice";
import {
  getRandomAvatarBgColor,
  getRelativeTime,
} from "@/utility/utility-functions";

interface DeleteDialogInterface {
  open: boolean;
  onOpenChange(open: boolean): void;
  postId: string;
}

export const PostDeleteDialog = ({
  open,
  onOpenChange,
  postId,
}: DeleteDialogInterface) => {
  const navigate = useNavigate();
  const [deletePost] = useMutation(DELETE_POST);

  const handlePostDeletion = async () => {
    try {
      const { data } = await deletePost({
        variables: {
          postId,
        },
      });
      if (data?.removePost) {
        toast.success("Post deleted.", {
          description: "Your post was successfully deleted.",
        });
      }
      navigate("/");
    } catch (error) {
      toast.error("Error deleting post.", {
        description: "Please try again later.",
      });
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Post?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this post?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            variant="destructive"
            onClick={handlePostDeletion}
          >
            Yes, delete.
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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

export interface BasicPostData {
  _id: string;
  content: string;
  author: BasicUserData;
}

export interface PostProps extends TimeStamps {
  _id: string;
  content: string;
  images?: string[];
  commentsCount: number;
  edited: boolean;
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
  edited,
  commentsCount,
  bookmarks,
  author,
  createdAt,
  className,
}: PostProps) => {
  const { theme } = useTheme();
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const params = useParams();

  const [isEditPostFormOpen, setIsEditPostFormOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const [likeOrUnlikePost] = useMutation(LIKE_UNLIKE_POST);
  const [addOrRemoveBookmark] = useMutation(ADD_REMOVE_BOOKMARK);

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

  const handleLike = async () => {
    const { data } = await likeOrUnlikePost({
      variables: {
        postId: _id,
      },
    });

    if (data?.likeOrUnlikePost) {
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    }
  };

  const handleBookmark = async () => {
    const { data } = await addOrRemoveBookmark({
      variables: {
        postId: _id,
      },
    });

    if (data?.addOrRemoveBookmark) {
      setBookmarked((prev) => !prev);
    }
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
    <>
      <Card
        key={_id}
        className={cn(
          "border-0 border-b border-border rounded-none p-4 hover:bg-muted/50 transition-colors",
          className
        )}
      >
        <div className="flex gap-3">
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

          <div className="flex-1 min-w-0">
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
              {edited && (
                <>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">edited</span>
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
                        onClick={() => {
                          setIsEditPostFormOpen(true);
                        }}
                      >
                        Edit Post
                        <Edit className="ml-2 h-[1rem] w-[1rem]" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete Post
                        <Trash2 className="ml-2 h-[1rem] w-[1rem]" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* <div className="text-foreground mb-3 leading-relaxed whitespace-pre-wrap text-base"> */}
            <Link to={`/post/${_id}`}>
              <p className="cursor-pointer">{content}</p>
            </Link>

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

            <div className="flex items-center justify-between max-w-md mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "h-8 px-2 hover:bg-red-500/10 group",
                  liked
                    ? "text-like"
                    : "text-muted-foreground hover:text-red-500"
                )}
              >
                <Heart
                  className={cn("h-4 w-4 mr-1", liked && "fill-current")}
                />
                <span className="text-sm">
                  {likeCount > 0 ? formatCount(likeCount) : ""}
                </span>
              </Button>

              <CommentWriterModal postId={_id} parentCommentId={null}>
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
              </CommentWriterModal>

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

      <EditPostFormSheet
        open={isEditPostFormOpen}
        onOpenChange={setIsEditPostFormOpen}
        postId={_id}
        content={content}
      />

      <PostDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        postId={_id}
      />
    </>
  );
};

export default Post;
