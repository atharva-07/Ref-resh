import { useState } from "react";

import { cn } from "@/components/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRelativeTime } from "@/utility/utility-functions";

import { BasicUserData } from "../post/post";

interface Story {
  id: number;
  user: BasicUserData;
  timestamp: Date;
  seen: boolean;
}

interface StoriesListProps {
  stories: Story[];
  onStoryClick?: (story: Story) => void;
}

const stories: Story[] = [
  {
    id: 1,
    user: {
      _id: "1",
      firstName: "Atharva",
      lastName: "Wankhede",
      userName: "atharva07",
      pfpPath:
        "https://lh3.googleusercontent.com/a/ACg8ocI5J7Q8jC2roTeVvCNwG5ELTJCTMN-6Bfepy4YlB_5J16_gJofG=s96-c",
    },
    timestamp: new Date(),
    seen: false,
  },
  {
    id: 2,
    user: {
      _id: "2",
      firstName: "Anvay",
      lastName: "Wankhede",
      userName: "anvay16",
      pfpPath:
        "https://i1.sndcdn.com/avatars-000110603786-34qmtv-t1080x1080.jpg",
    },
    timestamp: new Date(),
    seen: false,
  },
  {
    id: 3,
    user: {
      _id: "3",
      firstName: "Milind",
      lastName: "Wankhede",
      userName: "milind06",
      pfpPath:
        "https://i.pinimg.com/736x/07/c9/af/07c9afbcd2f8fa2cdd4e519173ff110e.jpg",
    },
    timestamp: new Date(),
    seen: false,
  },
  {
    id: 4,
    user: {
      _id: "4",
      firstName: "Tejaswini",
      lastName: "Wankhede",
      userName: "tejaswini16",
      pfpPath:
        "https://i.pinimg.com/736x/05/0b/d8/050bd86765d43bd6bd5ffdbfe2135f1e.jpg",
    },
    timestamp: new Date(),
    seen: false,
  },
];

const handleStoryClick = (story: any) => {
  console.log("Story clicked:", story.username);
};

const Stories = () => {
  return (
    <main className="container mx-auto">
      <div className="max-w-md">
        <StoriesList stories={stories} onStoryClick={handleStoryClick} />
      </div>
    </main>
  );
};

const StoriesList = ({ stories, onStoryClick }: StoriesListProps) => {
  const [clickedStories, setClickedStories] = useState<Set<number>>(new Set());

  const handleStoryClick = (story: Story) => {
    setClickedStories((prev) => new Set(prev).add(story.id));
    onStoryClick?.(story);
  };

  return (
    <ScrollArea className="bg-background h-80 w-full rounded-md border p-3">
      <div className="space-y-2">
        <h4 className="mb-4 text-sm leading-none font-medium">Stories</h4>
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-lg p-1 transition-colors"
            onClick={() => handleStoryClick(story)}
          >
            {/* Avatar with gradient outline */}
            <div className="relative">
              <div
                className={cn(
                  "rounded-full p-0.5 transition-transform duration-300",
                  !story.seen && !clickedStories.has(story.id)
                    ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                    : "bg-muted"
                )}
              >
                <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarImage
                    src={story.user.pfpPath}
                    alt={story.user.userName}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {story.user.firstName.charAt(0).toUpperCase() +
                      story.user.lastName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Username and timestamp */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs truncate">{story.user.userName}</span>
              <span className="text-xs text-muted-foreground">
                {getRelativeTime(story.timestamp.toISOString())}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default Stories;
