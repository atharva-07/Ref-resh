import { useSuspenseQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useInView } from "react-intersection-observer";
import { useParams } from "react-router-dom";

import { GET_CHILD_COMMENTS } from "@/gql-calls/queries";
import { COMMENTS_PAGE_SIZE } from "@/utility/constants";
import { transformTimestamps } from "@/utility/utility-functions";

import MainSpinner from "../main-spinner";
import Comment, { CommentProps } from "./comment";

const fallbackHeading = "Wow, such empty!";
const fallbackContent = "No comments yet. Be the first to comment!";

const CommentLoader = () => {
  const [allComments, setAllComments] = useState<CommentProps[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [ref, inView] = useInView({
    rootMargin: "200px",
    threshold: 0,
  });

  const params = useParams();

  interface QueryResponse {
    [key: string]: {
      edges: Array<{ node: CommentProps; cursor: string }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  }

  const { data, fetchMore } = useSuspenseQuery<QueryResponse>(
    GET_CHILD_COMMENTS,
    {
      variables: {
        postId: params.postId || null,
        commentId: params.commentId || null,
        pageSize: COMMENTS_PAGE_SIZE,
        after: null,
      },
    }
  );

  useEffect(() => {
    if (data && data[Object.keys(data)[0]]?.edges) {
      const fieldName = Object.keys(data)[0];
      setAllComments((prevComments) => {
        const existingCommentIds = new Set(prevComments.map((p) => p._id));
        const newComments = data[fieldName].edges
          .map((edge: any) => edge.node)
          .filter((node: any) => !existingCommentIds.has(node._id));

        return [...prevComments, ...newComments];
      });
      setHasNextPage(data[fieldName].pageInfo.hasNextPage);
      setEndCursor(data[fieldName].pageInfo.endCursor);
    }
  }, [data, params]);

  useEffect(() => {
    if (inView && hasNextPage && !loadingMore) {
      setLoadingMore(true);

      fetchMore({
        variables: {
          postId: params.postId || null,
          commentId: params.commentId || null,
          pageSize: COMMENTS_PAGE_SIZE,
          after: endCursor,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prevResult;
          }

          const fieldName = Object.keys(fetchMoreResult)[0];
          const newEdges = fetchMoreResult[fieldName].edges || [];
          const newPageInfo = fetchMoreResult[fieldName].pageInfo;
          const updatedEdges = [
            ...(prevResult[fieldName]?.edges || []),
            ...newEdges,
          ];

          return {
            [fieldName]: {
              ...prevResult[fieldName],
              edges: updatedEdges,
              pageInfo: newPageInfo,
            },
          };
        },
      }).finally(() => setLoadingMore(false));
    }
  }, [inView, hasNextPage, endCursor, fetchMore, loadingMore, params]);

  return (
    <ErrorBoundary fallback={<h2>Failed to fetch comments.</h2>}>
      <Suspense fallback={<MainSpinner message="Fetching comments..." />}>
        <div className="min-h-screen">
          {allComments && allComments.length > 0 ? (
            allComments.map((node) => {
              const timestamps = transformTimestamps(
                node.createdAt,
                node.updatedAt
              );
              return <Comment key={node._id} {...node} {...timestamps} />;
            })
          ) : (
            <div className="m-4 text-center">
              <h3>{fallbackHeading}</h3>
              <p>{fallbackContent}</p>
            </div>
          )}

          {hasNextPage && <div ref={ref} className="h-1"></div>}

          {loadingMore && (
            <div className="flex justify-center my-4">
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}

          {!hasNextPage && allComments.length > 0 && (
            <p className="text-center my-5 text-gray-400 font-light">
              You've seen all the comments. &#58;&#41;
            </p>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default CommentLoader;
