import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/useTheme";
import {
  eventColorMap,
  eventMessageMap,
  NotificationEvents,
} from "@/utility/constants";
import {
  getRandomAvatarBgColor,
  getRelativeTime,
} from "@/utility/utility-functions";

import { BasicUserData, TimeStamps } from "../post/post";

export interface NotificationProps extends TimeStamps {
  _id: string;
  eventType: NotificationEvents;
  publisher: BasicUserData;
  redirectionURL?: string;
  unread: boolean;
}

const Notification = ({
  _id,
  eventType,
  publisher,
  unread,
  createdAt,
  redirectionURL,
}: NotificationProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const authorInitials: string = publisher.firstName[0] + publisher.lastName[0];

  const backgroundColor = `bg-${eventColorMap.get(eventType)}`;

  return (
    <div
      key={_id}
      className={`flex gap-4 p-4 ${backgroundColor} bg-opacity-5 hover:bg-opacity-10`}
    >
      <Avatar className="h-10 w-10 border-2">
        <AvatarImage src={publisher.pfpPath} alt={authorInitials} />
        <AvatarFallback
          className={`w-full h-full rounded-lg ${getRandomAvatarBgColor(theme)}`}
        >
          {authorInitials}
        </AvatarFallback>
      </Avatar>

      <div className="flex grow justify-between">
        <p
          className={`grow hover:cursor-pointer ${unread && "font-semibold"}`}
          onClick={() => {
            if (redirectionURL) {
              navigate(redirectionURL);
            } else {
              navigate(`/${publisher.userName}`);
            }
          }}
        >
          {publisher.firstName} {publisher.lastName}{" "}
          {eventMessageMap.get(eventType)}
        </p>
        <span className="text-sm text-muted-foreground">
          {getRelativeTime(createdAt)}
        </span>
      </div>
    </div>
  );
};

export default Notification;
