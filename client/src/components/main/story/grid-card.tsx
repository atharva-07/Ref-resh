import moment from "moment";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getISOStringFromTimestamp } from "@/utility/utility-functions";

import { StoryProps } from "./story";

interface StoryThumbnailProps {
  story: StoryProps;
  onClick?: () => void;
  className?: string;
}

const GridCard = ({ story, className }: StoryThumbnailProps) => {
  const isTextOnly = !story.image && story.caption;

  return (
    <Card className="group z-0 relative overflow-hidden hover:border-primary/40 transition-colors">
      <div className="absolute top-3 left-3 z-10 rounded-lg p-2 text-center shadow-lg bg-primary text-primary-foreground">
        <div className="text-sm font-bold">
          {moment(getISOStringFromTimestamp(story.createdAt)).date()}
        </div>
        <div className="text-xs font-medium">
          {moment(getISOStringFromTimestamp(story.createdAt)).format("MMM")}
        </div>
      </div>

      {isTextOnly ? (
        <div className="relative w-full aspect-square p-6 flex flex-col justify-center overflow-hidden">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {story.caption}
          </div>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <AspectRatio ratio={2 / 3}>
                <img
                  src={story.image}
                  alt="Story image"
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
          </TooltipTrigger>
          {story.caption && <TooltipContent>{story.caption}</TooltipContent>}
        </Tooltip>
      )}
    </Card>
  );

  // return (
  //   <div className={cn("relative h-60 transition-all", "bg-muted", className)}>
  //     {story.image ? (
  //       <Tooltip>
  //         <TooltipTrigger asChild>
  //           <div>
  //             <span className="absolute top-2 left-2 bg-primary text-primary-foreground">
  //               {getDateInShortForm(getISOStringFromTimestamp(story.createdAt))}
  //             </span>

  //             <img
  //               src={story.image}
  //               alt="Story Preview"
  //               className="h-full w-full object-cover"
  //               loading="lazy"
  //             />
  //           </div>
  //         </TooltipTrigger>
  //         <TooltipContent>
  //           {story.caption ? story.caption : null}
  //         </TooltipContent>
  //       </Tooltip>
  //     ) : (
  //       <p>{story.caption}</p>
  //     )}
  //   </div>
  // );
};

export default GridCard;
