import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useRef, useState } from "react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GET_USER_STORIES } from "@/gql-calls/queries";
import { cn } from "@/lib/utils";
import { STORIES_PAGE_SIZE } from "@/utility/constants";
import {
  getISOStringFromTimestamp,
  getRelativeTime,
} from "@/utility/utility-functions";

import { BasicUserData } from "../post/post";
import Story, { StoryProps } from "./story";

type HeroProps = {
  user: BasicUserData;
  totalActiveStories: number;
  onExhausted?: () => void;
  onPrevExhausted?: () => void;
  className?: string;
  autoPlay?: boolean;
  secondsPerStory?: number;
};

export function StoryHero({
  user,
  totalActiveStories,
  onExhausted,
  onPrevExhausted,
  className,
  autoPlay = true,
  secondsPerStory = 10,
}: HeroProps) {
  const shouldPaginate = totalActiveStories > 5;

  const { data, fetchMore, refetch } = useQuery(GET_USER_STORIES, {
    variables: { userId: user._id, pageSize: STORIES_PAGE_SIZE },
    skip: shouldPaginate,
    // notifyOnNetworkStatusChange: true,
  });

  const initialPage = data?.fetchUserStories;
  const [items, setItems] = useState<StoryProps[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  useEffect(() => {
    // reset when user changes
    setCurrent(0);
    setProgress(0);
    if (shouldPaginate) {
      refetch({
        userId: user._id,
        pageSize: STORIES_PAGE_SIZE,
        after: null,
      }).then((res) => {
        const page = res.data?.fetchUserStories;
        setItems(page?.edges.map((edge) => edge.node) ?? []);
        setHasNextPage(page?.pageInfo?.hasNextPage ?? false);
        setEndCursor(page?.pageInfo.endCursor ?? null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // sync initial load
  useEffect(() => {
    if (initialPage) {
      setItems(initialPage.edges.map((edge) => edge.node));
      setHasNextPage(initialPage.pageInfo?.hasNextPage ?? false);
      setEndCursor(initialPage.pageInfo.endCursor ?? null);
    }
  }, [initialPage]);

  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const loadingMoreRef = useRef(false);
  const loadNextPage = useCallback(async () => {
    if (
      (!shouldPaginate && !hasNextPage && !endCursor) ||
      loadingMoreRef.current
    )
      return false;
    loadingMoreRef.current = true;
    const res = await fetchMore({
      variables: {
        userId: user._id,
        pageSize: STORIES_PAGE_SIZE,
        after: endCursor,
      },
    });
    const page = res.data?.fetchUserStories;
    if (page) {
      setItems((prev) => [...prev, ...page.edges.map((edge) => edge.node)]);
      setHasNextPage(page.pageInfo?.hasNextPage ?? false);
      setEndCursor(page.pageInfo.endCursor ?? null);
    }
    loadingMoreRef.current = false;
    return !!page;
  }, [fetchMore, user._id, endCursor, shouldPaginate, hasNextPage]);

  // Preload when near end
  useEffect(() => {
    if (shouldPaginate && items.length - current <= 2 && hasNextPage) {
      loadNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, items.length, hasNextPage, loadNextPage]);

  // Autoplay timer
  useEffect(() => {
    if (!autoPlay || items.length === 0 || isPaused) return;
    setProgress(0);

    const totalMs = secondsPerStory * 1000;
    const stepMs = 100;
    const steps = totalMs / stepMs;
    let i = 0;

    const id = setInterval(() => {
      i += 1;
      setProgress(Math.min(100, (i / steps) * 100));
      if (i >= steps) {
        clearInterval(id);
        goNext();
      }
    }, stepMs);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, items.length, autoPlay, secondsPerStory, isPaused]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent((i) => Math.max(0, i - 1));
    } else {
      onPrevExhausted?.();
    }
  }, [current, onPrevExhausted]);

  const goNext = useCallback(async () => {
    if (current < items.length - 1) {
      setCurrent((i) => Math.min(items.length - 1, i + 1));
      return;
    }
    // end of loaded items
    if (shouldPaginate && hasNextPage) {
      const got = await loadNextPage();
      if (got) {
        // move to next once new page is appended
        setTimeout(() => setCurrent((i) => i + 1), 50);
        return;
      }
    }
    // no more pages
    onExhausted?.();
  }, [
    current,
    items.length,
    shouldPaginate,
    hasNextPage,
    onExhausted,
    loadNextPage,
  ]);

  // Keyboard handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const active = items[current];

  return (
    <div
      className={cn(
        "flex flex-col h-[80vh] w-[25vw] min-w-[320px] max-w-[620px] rounded-xl overflow-hidden ring-1 ring-border bg-card",
        className
      )}
      aria-label={`${user.userName}'s stories`}
    >
      <div className="p-3 flex gap-1">
        {new Array(totalActiveStories).fill({}).map((_, index) => (
          <div
            key={index}
            className="h-1 flex-1 bg-primary rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-secondary transition-[width] duration-100 linear"
              style={{
                width:
                  index === current
                    ? `${progress}%`
                    : index < current
                      ? "100%"
                      : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Media */}
      {active ? (
        <>
          <div className="flex items-center p-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.pfpPath}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback>
                {user.firstName[0] + user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex justify-between flex-1 ml-3">
              <div>
                <p className="text-sm font-medium leading-none">
                  {user.firstName + " " + user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{user.userName}
                </p>
              </div>
              <span className="text-muted-foreground text-sm">
                {getRelativeTime(getISOStringFromTimestamp(active?.createdAt))}
              </span>
            </div>
          </div>
          <Story
            story={active}
            onPrevClick={goPrev}
            onNextClick={goNext}
            onPauseToggle={() => setIsPaused(!isPaused)}
          />
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Loading....
        </div>
      )}
    </div>
  );
}
