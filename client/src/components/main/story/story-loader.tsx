import { DocumentNode, useSuspenseQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useInView } from "react-intersection-observer";

import { PaginatedData } from "@/gql-calls/queries";
import { transformTimestamps } from "@/utility/utility-functions";

import MainSpinner from "../main-spinner";
import GridCard from "./grid-card";
import { StoryProps } from "./story";

interface StoryLoaderProps {
  query: DocumentNode;
  variables: Record<string, any>;
  pageSize: number;
  fallbackHeading: string;
  fallbackContent: string;
}

const StoryLoader = ({
  query,
  variables,
  pageSize,
  fallbackContent,
  fallbackHeading,
}: StoryLoaderProps) => {
  const [allStories, setAllStories] = useState<StoryProps[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [ref, inView] = useInView();

  interface QueryResponse {
    [key: string]: PaginatedData<StoryProps>;
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
      setAllStories((prevStories) => {
        const existingPostIds = new Set(prevStories.map((s) => s._id));
        const newStories = data[fieldName].edges
          .map((edge: any) => edge.node)
          .filter((node: any) => !existingPostIds.has(node._id));

        return [...prevStories, ...newStories];
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
    <ErrorBoundary fallback={<h2>Failed to fetch stories.</h2>}>
      <Suspense fallback={<MainSpinner message="Fetching stories..." />}>
        <div className="w-full p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allStories && allStories.length > 0 ? (
              allStories.map((node) => {
                const timestamps = transformTimestamps(
                  node.createdAt,
                  node.updatedAt
                );
                return <GridCard key={node._id} story={node} {...timestamps} />;
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
          </div>
          {!hasNextPage && allStories.length > 0 && (
            <p className="text-center pt-4 text-gray-400 font-light">
              This is the end. Post more stories to make this list longer.
              &#58;&#41;
            </p>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default StoryLoader;
