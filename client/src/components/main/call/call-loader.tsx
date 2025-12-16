import { DocumentNode, useSuspenseQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useInView } from "react-intersection-observer";

import { transformTimestamps } from "@/utility/utility-functions";

import MainSpinner from "../main-spinner";
import Call, { CallProps } from "./call";

interface CallLoaderProps {
  query: DocumentNode;
  variables: Record<string, any>;
  pageSize: number;
  fallbackHeading: string;
  fallbackContent: string;
  hero?: boolean;
}

const CallLoader = ({
  query,
  variables,
  pageSize,
  fallbackContent,
  fallbackHeading,
  hero = false,
}: CallLoaderProps) => {
  const [allCalls, setAllCalls] = useState<CallProps[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [ref, inView] = useInView();

  interface QueryResponse {
    [key: string]: {
      edges: Array<{ node: CallProps; cursor: string }>;
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
      setAllCalls((prevPosts) => {
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
    <ErrorBoundary fallback={<h2>Failed to fetch calls.</h2>}>
      <Suspense fallback={<MainSpinner message="Fetching calls..." />}>
        <div className="min-h-screen">
          {allCalls && allCalls.length > 0 ? (
            allCalls.map((node) => {
              const timestamps = transformTimestamps(
                node.createdAt,
                node.updatedAt
              );
              return (
                <Call key={node._id} {...node} {...timestamps} hero={hero} />
              );
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

          {/* {!hasNextPage && allCalls.length > 0 && (
            <p className="text-center my-5 text-gray-400 font-light">
              End of list.
            </p>
          )} */}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default CallLoader;
