import { useQuery } from "@apollo/client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { LOAD_STORIES } from "@/gql-calls/queries";
import { cn } from "@/lib/utils";
import { STORIES_PAGE_SIZE } from "@/utility/constants";

import { LoadStoriesDocument } from "./stories";
import { StoryHero } from "./story-hero";
import StoryPreview from "./story-preview";

interface StoryViewerProps {
  allUsers: LoadStoriesDocument[];
  userId: string;
  onUpdateUsers: (users: LoadStoriesDocument[]) => void;
  onAllSeen: (userId: string) => void;
  onClose: () => void;
  className?: string;
}

export function StoryViewer({
  allUsers,
  userId,
  onUpdateUsers,
  onAllSeen,
  onClose,
  className,
}: StoryViewerProps) {
  const [localIndex, setLocalIndex] = useState(0);
  const [totalDocumentsLoaded, setTotalDocumentsLoaded] = useState<number>(
    allUsers.length
  );

  useEffect(() => {
    const index = allUsers.findIndex((u) => u.author._id === userId);
    if (index !== -1) {
      setLocalIndex(index);
    }
  }, [userId, allUsers]);

  const { fetchMore } = useQuery(LOAD_STORIES, {
    variables: { page: 0, pageSize: STORIES_PAGE_SIZE },
    skip: !open,
    // notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (localIndex >= totalDocumentsLoaded - 2 && totalDocumentsLoaded > 0) {
      const nextPage = totalDocumentsLoaded / STORIES_PAGE_SIZE;
      fetchMore({
        variables: { page: nextPage, pageSize: STORIES_PAGE_SIZE },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          const updated = [...prev.loadStories, ...fetchMoreResult.loadStories];
          onUpdateUsers(updated);
          setTotalDocumentsLoaded(updated.length);
          return {
            loadStories: updated,
          };
        },
      });
    }
  }, [localIndex, totalDocumentsLoaded, fetchMore, onUpdateUsers]);

  const currentUser = allUsers[localIndex];
  const prevUserObj = localIndex > 0 ? allUsers[localIndex - 1] : undefined;
  const nextUserObj =
    localIndex < allUsers.length - 1 ? allUsers[localIndex + 1] : undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextUser();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevUser();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, localIndex, allUsers.length]);

  function nextUser() {
    if (localIndex < allUsers.length - 1) {
      setLocalIndex((i) => i + 1);
    }
    onAllSeen(currentUser.author._id);
  }

  function prevUser() {
    if (localIndex > 0) {
      setLocalIndex((i) => i - 1);
    }
  }

  const onHeroExhausted = () => nextUser();
  const onHeroPrevExhausted = () => prevUser();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story viewer"
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        "flex items-center justify-center",
        className
      )}
    >
      <button
        aria-label="Close stories"
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full p-2 text-primary/80 hover:text-primary"
      >
        <X className="size-6" />
      </button>

      <div className="flex items-center gap-6">
        <div className="hidden md:block">
          {prevUserObj ? (
            <StoryPreview
              user={prevUserObj.author}
              previewImage={prevUserObj.stories[0]?.node.image}
              onClick={prevUser}
            />
          ) : (
            <div className="h-80 w-48 rounded-xl bg-secondary/20 ring-1 ring-primary/10" />
          )}
        </div>

        {currentUser ? (
          <StoryHero
            key={currentUser.author._id}
            user={currentUser.author}
            totalActiveStories={currentUser.totalActiveStories}
            onExhausted={onHeroExhausted}
            onPrevExhausted={onHeroPrevExhausted}
          />
        ) : (
          <div className="h-[80vh] w-[38vw] min-w-[320px] max-w-[620px] rounded-xl ring-1" />
        )}

        <div className="hidden md:block">
          {nextUserObj ? (
            <StoryPreview
              user={nextUserObj!.author}
              previewImage={nextUserObj?.stories[0]?.node.image}
              onClick={nextUser}
            />
          ) : (
            <div className="h-80 w-48 rounded-xl bg-secondary/20 ring-1 ring-primary/10" />
          )}
        </div>
      </div>
    </div>
  );
}
