import { DocumentNode, useSuspenseQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useInView } from "react-intersection-observer";

import { transformTimestamps } from "@/utility/utility-functions";

import MainSpinner from "../main-spinner";
import Post, { PostProps } from "./post";

interface PostLoaderProps {
  query: DocumentNode;
  variables: Record<string, any>;
  pageSize: number;
  fallbackHeading: string;
  fallbackContent: string;
}

const PostLoader = ({
  query,
  variables,
  pageSize,
  fallbackContent,
  fallbackHeading,
}: PostLoaderProps) => {
  const [allPosts, setAllPosts] = useState<PostProps[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [ref, inView] = useInView();

  interface QueryResponse {
    [key: string]: {
      edges: Array<{ node: PostProps; cursor: string }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  }

  const { data, fetchMore } = useSuspenseQuery<QueryResponse>(query, {
    variables: {
      ...variables,
      pageSize: pageSize,
      after: null,
    },
  });

  useEffect(() => {
    if (data && data[Object.keys(data)[0]]?.edges) {
      const fieldName = Object.keys(data)[0];
      setAllPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map((p) => p._id));
        const newPosts = data[fieldName].edges
          .map((edge: any) => edge.node)
          .filter((node: any) => !existingPostIds.has(node._id));

        return [...prevPosts, ...newPosts];
      });
      setHasNextPage(data[fieldName].pageInfo.hasNextPage);
      setEndCursor(data[fieldName].pageInfo.endCursor);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !loadingMore) {
      setLoadingMore(true);

      fetchMore({
        variables: {
          ...variables,
          pageSize: pageSize,
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
  }, [
    inView,
    hasNextPage,
    endCursor,
    fetchMore,
    loadingMore,
    variables,
    pageSize,
  ]);

  return (
    <ErrorBoundary fallback={<h2>Failed to fetch posts.</h2>}>
      <Suspense fallback={<MainSpinner message="Fetching posts..." />}>
        <div className="min-h-screen">
          {allPosts && allPosts.length > 0 ? (
            allPosts.map((node) => {
              const timestamps = transformTimestamps(
                node.createdAt,
                node.updatedAt
              );
              return <Post key={node._id} {...node} {...timestamps} />;
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

          {!hasNextPage && allPosts.length > 0 && (
            <p className="text-center my-5 text-gray-400 font-light">
              You're all caught up. Time to touch some grass.
            </p>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default PostLoader;
