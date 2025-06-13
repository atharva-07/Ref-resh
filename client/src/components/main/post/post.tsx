import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { user } from "@/store/auth-slice";

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
  bookmarks: string[];
  author: BasicUserData;
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
}: PostProps) => {
  const loggedInUser = useAppSelector((state) => state.auth.user);

  return (
    <div key={_id} className="border-border border-b py-2 hover:cursor-pointer">
      <PostAuthor author={author} createdAt={createdAt} />
      <div className="pl-16">
        <div>{content}</div>
        {images && images?.length > 0 && <ImageGrid images={images} />}
      </div>
      <PostActions
        likesCount={likes.length}
        commentsCount={commentsCount}
        liked={
          typeof likes[0] === "string"
            ? (likes as string[]).includes(loggedInUser!.userId)
            : (likes as BasicUserData[]).some(
                (like) => like._id === loggedInUser!.userId
              )
        }
        bookmarked={bookmarks?.includes(loggedInUser!.userId)}
      />
    </div>
  );
};

export default Post;
