import { Bookmark, Heart, MessageCircleIcon } from "lucide-react";
import { useState } from "react";

interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
  liked?: boolean;
  bookmarked?: boolean;
}

export const PostActions = ({
  likesCount,
  commentsCount,
  liked,
  bookmarked,
}: PostActionsProps) => {
  return (
    <div className="flex gap-2 text-center mt-4 text-[15px]">
      <div
        className={`flex-grow rounded-3xl child:mx-2 hover:text-like hover:cursor-pointer ${
          liked && "text-like"
        }`}
      >
        <Heart className={`inline-block ${liked && "liked"}`} />
        {likesCount}
      </div>
      <div className="flex-grow rounded-3xl child:mx-2 hover:text-comment hover:cursor-pointer">
        <MessageCircleIcon className="inline-block" />
        {commentsCount}
      </div>
      <div
        className={`flex-grow rounded-3xl child:mx-2 hover:text-bookmark hover:cursor-pointer ${
          bookmarked && "text-bookmark"
        }`}
      >
        <Bookmark className={`inline-block ${bookmarked && "bookmarked"}`} />
      </div>
    </div>
  );
};
