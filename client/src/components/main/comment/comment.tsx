import { useMutation } from "@apollo/client";
import {
  Edit,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import EditCommentFormSheet from "@/components/forms/edit-comment";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DELETE_COMMENT, LIKE_UNLIKE_COMMENT } from "@/gql-calls/mutation";
import {
  GET_COMMENT_LIKES,
  PaginatedData,
  SEARCH_LIKES_ON_COMMENT,
} from "@/gql-calls/queries";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  getRandomAvatarBgColor,
  getRelativeTime,
} from "@/utility/utility-functions";

import { BasicUserData, PostProps } from "../post/post";
import SearchList, { Query } from "../search-list";

interface DeleteDialogInterface {
  open: boolean;
  onOpenChange(open: boolean): void;
  postId: string;
  commentId: string;
}

export const CommentDeleteDialog = ({
  open,
  onOpenChange,
  postId,
  commentId,
}: DeleteDialogInterface) => {
  const navigate = useNavigate();
  const [deleteComment] = useMutation(DELETE_COMMENT);

  const handleCommentDeletion = async () => {
    try {
      const { data } = await deleteComment({
        variables: {
          postId,
          commentId,
        },
      });
      if (data?.removeComment) {
        toast.success("Comment deleted.", {
          description: "Your comment was successfully deleted.",
        });
        navigate(`/post/${postId}`);
      }
    } catch (error) {
      toast.error("Error deleting comment.", {
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
          <DialogTitle>Delete Comment?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this comment?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            variant="destructive"
            onClick={handleCommentDeletion}
          >
            Yes, delete.
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export type CommentProps = Omit<PostProps, "images" | "bookmarks"> & {
  post: string;
};

const Comment = ({
  _id,
  content,
  likes,
  edited,
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

  const [isEditCommentFormOpen, setIsEditCommentFormOpen] =
    useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const [likeOrUnlikeComment] = useMutation(LIKE_UNLIKE_COMMENT);

  const [likeCount, setLikeCount] = useState<number>(likes.length);
  const [liked, setLiked] = useState<boolean>(
    typeof likes[0] === "string"
      ? (likes as string[]).includes(loggedInUser!.userId)
      : (likes as BasicUserData[]).some(
          (like) => like._id === loggedInUser!.userId
        )
  );

  const fetchLikes: Query<{
    fetchLikesFromComment: PaginatedData<BasicUserData>;
  }> = {
    query: GET_COMMENT_LIKES,
    variables: {
      commentId: _id,
    },
  };

  const searchLikes: Query<{ searchLikesOnComment: BasicUserData[] }> = {
    query: SEARCH_LIKES_ON_COMMENT,
    variables: {
      commentId: _id,
    },
  };

  const handleLike = async () => {
    const { data } = await likeOrUnlikeComment({
      variables: {
        commentId: _id,
      },
    });

    if (data?.likeOrUnlikeComment) {
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
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
              <div
                className={`flex ${hero ? "flex-col" : "items-center"} gap-1`}
              >
                <span className="font-semibold leading-5 text-foreground">
                  {author.firstName + " " + author.lastName}
                </span>
                <span className="text-muted-foreground text-sm hover:underline cursor-pointer">
                  <Link
                    to={
                      params.username ? `/${author.userName}` : author.userName
                    }
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
                  {edited && (
                    <>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">
                        edited
                      </span>
                    </>
                  )}
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
                          setIsEditCommentFormOpen(true);
                        }}
                      >
                        Edit Comment
                        <Edit className="ml-2 h-[1rem] w-[1rem]" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setIsDeleteDialogOpen(true);
                        }}
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
            {hero ? (
              <p className="mt-4 mb-3">{content}</p>
            ) : (
              <Link to={`/comment/${_id}`}>
                <p>{content}</p>
              </Link>
            )}
            {hero && (
              <div className="mb-4 flex justify-between">
                <span className="text-muted-foreground text-sm">
                  {moment(createdAt).format("LT")}
                  &nbsp;&middot;&nbsp;
                  {moment(createdAt).format("ll")}
                </span>
                {edited && (
                  <span className="text-muted-foreground text-sm">
                    - edited
                  </span>
                )}
              </div>
            )}
            {/* Actions */}
            <div
              className={`flex items-center justify-between ${hero ? "w-full" : "max-w-md"} mt-2`}
            >
              {/* Like */}
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

              {/* Comment */}
              <CommentWriterModal postId={postId} parentCommentId={_id}>
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
              {hero && (
                <SearchList fetchQuery={fetchLikes} searchQuery={searchLikes}>
                  <span className="text-sm text-muted-foreground">
                    View Likes
                  </span>
                </SearchList>
              )}
            </div>
          </div>
        </div>
      </Card>

      <EditCommentFormSheet
        open={isEditCommentFormOpen}
        onOpenChange={setIsEditCommentFormOpen}
        commentId={_id}
        content={content}
      />

      <CommentDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        postId={postId}
        commentId={_id}
      />
    </>
  );
};

export default Comment;
