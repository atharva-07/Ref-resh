import { useSuspenseQuery } from "@apollo/client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useInView } from "react-intersection-observer";

import { cn } from "@/components/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LOAD_STORIES } from "@/gql-calls/queries";
import { STORIES_PAGE_SIZE } from "@/utility/constants";
import {
  getISOStringFromTimestamp,
  getRelativeTime,
} from "@/utility/utility-functions";

import MainSpinner from "../main-spinner";
import { BasicUserData } from "../post/post";
import { StoryProps } from "./story";
import { StoryViewer } from "./story-viewer";

export interface LoadStoriesDocument {
  totalActiveStories: number;
  stories: {
    cursor: string;
    node: Omit<StoryProps, "author">;
  }[];
  author: BasicUserData;
}

const Stories = () => {
  return (
    <ErrorBoundary fallback={<h2>Failed to fetch stories.</h2>}>
      <Suspense fallback={<MainSpinner message="Fetching stories..." />}>
        <main className="container mx-auto">
          <div className="max-w-md">
            <StoriesList />
          </div>
        </main>
      </Suspense>
    </ErrorBoundary>
  );
};

const StoriesList = () => {
  const [allUsers, setAllUsers] = useState<LoadStoriesDocument[]>([]);
  const [totalDocumentsLoaded, setTotalDocumentsLoaded] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [ref, inView] = useInView();
  // const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchMore } = useSuspenseQuery(LOAD_STORIES, {
    variables: { page: 0, pageSize: STORIES_PAGE_SIZE },
    // notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.loadStories && data.loadStories.length > 0) {
      setAllUsers(data.loadStories);
      setTotalDocumentsLoaded(data.loadStories.length);
      // setHasNextPage(data.loadStories.length > 0);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && totalDocumentsLoaded > 0) {
      const nextPage = Math.ceil(totalDocumentsLoaded / STORIES_PAGE_SIZE);
      fetchMore({
        variables: { page: nextPage, pageSize: STORIES_PAGE_SIZE },
        updateQuery: (prev, { fetchMoreResult }) => {
          const newStoriesCount = fetchMoreResult.loadStories.length;
          if (!fetchMoreResult || newStoriesCount === 0) {
            setHasNextPage(false);
            return prev;
          }
          return {
            loadStories: [...prev.loadStories, ...fetchMoreResult.loadStories],
          };
        },
      });
    }
  }, [totalDocumentsLoaded, fetchMore, inView, hasNextPage]);

  const handleUpdateUsers = useCallback(
    (updatedUsers: LoadStoriesDocument[]) => {
      setAllUsers(updatedUsers);
      setTotalDocumentsLoaded(updatedUsers.length);
    },
    []
  );

  // User (story) that the logged-in user clicked on.
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set());

  const handleAllSeen = (authorId: string) => {
    setSeenStories((prev) => new Set(prev).add(authorId));
  };

  return (
    <>
      <ScrollArea className="bg-background h-80 w-full rounded-md border p-3">
        <div className="space-y-2">
          <h4 className="mb-4 text-sm leading-none font-medium">Stories</h4>
          {allUsers.length > 0 ? (
            allUsers.map(({ author, stories }) => {
              // We are initially only loading 2 stories
              const seenAll =
                stories.length === 1
                  ? stories.at(0) && stories.at(0)?.node.seen
                  : stories.at(0)?.node.seen && stories.at(1)?.node.seen;

              const latestStory = stories.at(0);

              return (
                <div
                  key={author._id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-lg p-1 transition-colors"
                  onClick={() => setSelectedUserId(author._id)}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "rounded-full p-0.5 transition-transform duration-300",
                        !seenAll && !seenStories.has(author._id)
                          ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                          : "bg-primary/30"
                      )}
                    >
                      <Avatar className="h-12 w-12 border-2 border-background">
                        <AvatarImage
                          src={author.pfpPath}
                          alt={author.userName}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {author.firstName.charAt(0).toUpperCase() +
                            author.lastName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs truncate">{author.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(
                        getISOStringFromTimestamp(latestStory!.node.createdAt)
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center">
              <p>Wow, so empty. O_O</p>
              <span className="text-muted-foreground text-sm">
                No active stories to show.
              </span>
            </div>
          )}
          {hasNextPage && <div ref={ref} className="h-1" />}
        </div>
      </ScrollArea>

      {selectedUserId && (
        <StoryViewer
          userId={selectedUserId}
          allUsers={allUsers}
          onUpdateUsers={handleUpdateUsers}
          // Seen all stories of one user through StoryHero.
          onAllSeen={handleAllSeen}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
};

export default Stories;
