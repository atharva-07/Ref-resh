import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { BasicUserData } from "../post/post";

interface StoryPreviewProps {
  user: BasicUserData;
  previewImage?: string; // For text stories, there will be no preview image.
  onClick?: () => void;
  className?: string;
}

const StoryPreview = ({
  user,
  previewImage,
  onClick,
  className,
}: StoryPreviewProps) => (
  <div
    onClick={onClick}
    aria-label={`Open stories by ${user.userName}`}
    className={cn(
      "relative h-80 w-48 rounded-xl overflow-hidden ring-1 ring-border transition-all",
      "bg-muted",
      className
    )}
  >
    {previewImage ? (
      <img
        src={previewImage}
        alt={`${user.userName} preview`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    ) : (
      <div className="h-full w-full bg-muted" />
    )}
    <div className="absolute inset-0 bg-background/60" aria-hidden="true" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-left">
      <Avatar className="h-10 w-10 m-auto mb-3">
        <AvatarImage
          src={user.pfpPath}
          alt={`${user.firstName} ${user.lastName}`}
        />
        <AvatarFallback>{user.firstName[0] + user.lastName[0]}</AvatarFallback>
      </Avatar>
      <div className="text-sm font-medium drop-shadow">{user.userName}</div>
    </div>
  </div>
);

export default StoryPreview;
