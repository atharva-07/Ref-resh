import { useEffect } from "react";

import { BasicUserData, TimeStamps } from "../post/post";

export interface StoryProps extends TimeStamps {
  _id: string;
  image?: string;
  caption?: string;
  seen?: boolean;
  author: BasicUserData;
  className?: string;
}

import { useMutation } from "@apollo/client";

import { SET_STORY_SEEN } from "@/gql-calls/mutation";
import { cn } from "@/lib/utils";

const Story = ({
  story,
  onPrevClick,
  onNextClick,
  onPauseToggle,
  className,
}: {
  story: StoryProps;
  onPrevClick: () => void;
  onNextClick: () => void;
  onPauseToggle: () => void;
  className?: string;
}) => {
  const [setStorySeen, { data: mutationData }] = useMutation(SET_STORY_SEEN, {
    variables: {
      storyId: story._id,
    },
  });

  useEffect(() => {
    return () => {
      setStorySeen();
    };
  }, [setStorySeen, story]);

  return (
    <div className={cn("relative h-full w-full rounded-sm", className)}>
      {story.image ? (
        <img
          src={story.image}
          alt={story.caption || "story image"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center  bg-background text-foreground p-4">
          <h3>{story.caption}</h3>
        </div>
      )}
      {story.image && story.caption ? (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/70">
          <p className="text-sm leading-relaxed">{story.caption}</p>
        </div>
      ) : null}

      <button
        className="absolute inset-y-0 left-0 w-1/3 cursor-pointer"
        aria-label="Previous story"
        onClick={onPrevClick}
      />
      <button
        className="absolute inset-y-0 left-1/3 w-1/3 cursor-pointer"
        aria-label="Pause or resume story"
        onClick={onPauseToggle}
      />
      <button
        className="absolute inset-y-0 right-0 w-1/3 cursor-pointer"
        aria-label="Next story"
        onClick={onNextClick}
      />
    </div>
  );
};
export default Story;
