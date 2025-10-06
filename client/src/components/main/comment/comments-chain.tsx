import { useSuspenseQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

import CommentComposer from "@/components/forms/composer/comment-composer";
import { GET_PARENT_COMMENTS } from "@/gql-calls/queries";
import { transformTimestamps } from "@/utility/utility-functions";

import Post from "../post/post";
import Comment from "./comment";

const CommentsChain = () => {
  const params = useParams();
  const commentId = params.commentId;

  const { data } = useSuspenseQuery(GET_PARENT_COMMENTS, {
    variables: { commentId },
  });

  const post = data.fetchParentCommentsRecursively.post;
  const postTimestamps = transformTimestamps(post.createdAt, post.updatedAt);
  const comments = data.fetchParentCommentsRecursively.comments;

  return (
    <>
      <div>
        <Post key={post._id} {...post} {...postTimestamps} />
        {comments.length > 0 &&
          comments.map((comment, idx) => {
            const timestamps = transformTimestamps(
              comment.createdAt,
              comment.updatedAt
            );
            return (
              <Comment
                key={comment._id}
                {...comment}
                {...timestamps}
                hero={idx === comments.length - 1}
                className="border-0"
              />
            );
          })}
      </div>
      <CommentComposer
        mode="comment"
        parentCommentId={commentId!}
        postId={post._id}
      />
    </>
  );
};

export default CommentsChain;
