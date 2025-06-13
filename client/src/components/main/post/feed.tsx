import { useSuspenseQuery } from "@apollo/client";
import { Divide, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { GET_FEED } from "@/gql-calls/queries";
import { FEED_PAGE_SIZE } from "@/utility/constants";
import { transformTimestamps } from "@/utility/utility-functions";

import Post, { PostProps } from "./post";

const Feed = () => {
  const [allPosts, setAllPosts] = useState<PostProps[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [ref, inView] = useInView();

  const { data, fetchMore } = useSuspenseQuery(GET_FEED, {
    variables: {
      pageSize: FEED_PAGE_SIZE,
      after: null,
    },
    fetchPolicy: "cache-and-network", // Or "network-only" if you always want fresh data
  });

  useEffect(() => {
    if (data?.loadFeed?.edges) {
      setAllPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map((p) => p._id));
        const newPosts = data.loadFeed.edges
          .map((edge) => edge.node)
          .filter((node) => !existingPostIds.has(node._id));

        return [...prevPosts, ...newPosts];
      });
      setHasNextPage(data.loadFeed.pageInfo.hasNextPage);
      setEndCursor(data.loadFeed.pageInfo.endCursor);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !loadingMore) {
      setLoadingMore(true);

      fetchMore({
        variables: {
          pageSize: FEED_PAGE_SIZE,
          after: endCursor,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult || !fetchMoreResult.loadFeed) {
            return prevResult;
          }

          const newEdges = fetchMoreResult.loadFeed.edges || [];
          const newPageInfo = fetchMoreResult.loadFeed.pageInfo;

          return {
            loadFeed: {
              ...prevResult.loadFeed,
              edges: [...prevResult.loadFeed.edges, ...newEdges],
              pageInfo: newPageInfo,
            },
          };
        },
      })
        .then(({ data: fetchMoreResult }) => {
          if (fetchMoreResult?.loadFeed?.edges) {
            setAllPosts((prevPosts) => {
              const existingPostIds = new Set(prevPosts.map((p) => p._id));
              const fetchedNodes = fetchMoreResult.loadFeed.edges.map(
                (edge) => edge.node
              );
              const uniqueNewPosts = fetchedNodes.filter(
                (node) => !existingPostIds.has(node._id)
              );

              return [...prevPosts, ...uniqueNewPosts];
            });
            setHasNextPage(fetchMoreResult.loadFeed.pageInfo.hasNextPage);
            setEndCursor(fetchMoreResult.loadFeed.pageInfo.endCursor);
          }
        })
        .finally(() => setLoadingMore(false));
    }
  }, [inView, hasNextPage, endCursor, fetchMore, loadingMore]);

  return (
    <div>
      {allPosts.length > 0 ? (
        allPosts.map((node) => {
          const timestamps = transformTimestamps(
            node.createdAt,
            node.updatedAt
          );
          return <Post key={node._id} {...node} {...timestamps} />;
        })
      ) : (
        <div className="m-4 text-center">
          <h1>Wow, so empty. O_O</h1>
          <p>Follow a bunch of your buddies to see what they are posting.</p>
        </div>
      )}

      {hasNextPage && (
        <div
          ref={ref}
          style={{
            height: "1px",
            backgroundColor: loadingMore ? "red" : "lightgray",
          }}
        ></div>
      )}

      {loadingMore && <Loader2 />}

      {!hasNextPage && allPosts.length > 0 && (
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            opacity: "0.3",
            fontWeight: "lighter",
          }}
        >
          You're all caught up. Time to touch some grass.
        </p>
      )}
    </div>
  );
};

export default Feed;
