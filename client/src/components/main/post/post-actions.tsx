import { Bookmark, Heart, MessageCircleIcon } from "lucide-react";

interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
  bookmarked?: boolean;
}

export const PostActions = ({
  likesCount,
  commentsCount,
}: PostActionsProps) => {
  return (
    <div className="flex gap-2 text-center mt-4 text-[15px]">
      <div className="flex-grow rounded-3xl child:mx-2 hover:text-like hover:cursor-pointer">
        <Heart className="inline-block" />
        {likesCount}
      </div>
      <div className="flex-grow rounded-3xl child:mx-2 hover:text-comment hover:cursor-pointer">
        <MessageCircleIcon className="inline-block" />
        {commentsCount}
      </div>
      <div className="flex-grow rounded-3xl child:mx-2 hover:text-bookmark hover:cursor-pointer">
        <Bookmark className="inline-block" />
      </div>
    </div>
  );
};
