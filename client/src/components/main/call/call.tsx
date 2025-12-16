import {
  ArrowDownLeft,
  ArrowUpRight,
  PhoneCall,
  PhoneMissed,
} from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getISOStringFromTimestamp } from "@/utility/utility-functions";

import { BasicUserData, TimeStamps } from "../post/post";

export interface CallProps extends TimeStamps {
  _id: string;
  chatId: string;
  chatName: string;
  initiator: BasicUserData;
  acceptedAt?: { user: BasicUserData; timestamp: string }[];
  disconnectedAt?: { user: BasicUserData; timestamp: string }[];
}

const Call = ({
  _id,
  chatId,
  chatName,
  initiator,
  acceptedAt,
  disconnectedAt,
  createdAt,
  hero = false,
}: CallProps & { hero?: boolean }) => {
  const { user } = useAppSelector((state) => state.auth);
  const userIsInitiator = user?.userId === initiator._id;
  const userAcceptedAt = acceptedAt?.find(
    (val) => val.user._id === user?.userId
  )?.timestamp;
  const userDisconnectedAt = disconnectedAt?.find(
    (val) => val.user._id === user?.userId
  )?.timestamp;

  let elapsedTime: moment.Duration | null = null;

  const startTime = userIsInitiator
    ? createdAt
    : userAcceptedAt && getISOStringFromTimestamp(userAcceptedAt);
  const endTime = userDisconnectedAt;

  if (startTime && endTime) {
    elapsedTime = moment.duration(
      moment(getISOStringFromTimestamp(endTime)).diff(moment(startTime))
    );
  }

  const callReceivedAt = moment(createdAt).format("llll");
  const callDuration = elapsedTime
    ? `${elapsedTime.hours() > 0 ? elapsedTime.hours() + "h" : ""} ${elapsedTime.minutes() > 0 ? elapsedTime.minutes() + "m" : ""} ${elapsedTime.seconds() > 0 ? elapsedTime.seconds() + "s" : ""}`
    : "Missed";

  return !hero ? (
    <HoverCard key={_id}>
      <HoverCardTrigger asChild>
        <div className="flex items-center p-3 m-1 border [&>*]:text-xs hover:cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={initiator.pfpPath}
              alt={`${initiator.firstName} ${initiator.lastName}`}
            />
            <AvatarFallback>
              {initiator.firstName[0] + initiator.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex justify-between flex-1 ml-3">
            <div className="flex flex-col">
              <span>{`Rung by ${userIsInitiator ? "you" : initiator.firstName}.`}</span>
              <span className="text-muted-foreground">{callReceivedAt}</span>
            </div>
            <div className="flex flex-col justify-center text-muted-foreground">
              <span
                style={{
                  color: !elapsedTime ? "red" : "inherit",
                }}
              >
                {callDuration}
              </span>
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-4">
          <PhoneCall size={24} />
          <div className="space-y-1">
            <h4 className="text-sm">{`${initiator.firstName} ${initiator.lastName} called.`}</h4>
            <p className="text-muted-foreground text-xs">
              {`Joined by: ${acceptedAt?.map((val) => val.user.firstName).join(", ")}.`}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ) : (
    <div
      key={_id}
      className="flex my-3 p-2 gap-4 [&>*]:text-sm border border-x-0"
    >
      <div className="flex gap-4 items-center grow">
        {elapsedTime ? (
          userIsInitiator ? (
            <ArrowUpRight size={20} color="green" />
          ) : (
            <ArrowDownLeft size={20} color="green" />
          )
        ) : (
          <PhoneMissed size={18} color="red" />
        )}
        <div>
          <div>
            Call in chat: &nbsp;
            <Link to={`/conversations/${chatId}`} className="hover:underline">
              {chatName}
            </Link>
          </div>
          <div className="text-muted-foreground">
            <span>{callReceivedAt}</span>
            &nbsp;&middot;&nbsp;
            <span style={{ color: !elapsedTime ? "red" : "inherit" }}>
              {callDuration}
            </span>
          </div>
        </div>
      </div>
      <div className="min-w-40">
        <div className="flex">
          <span>Caller: &nbsp;&nbsp;</span>
          {userIsInitiator ? (
            "You"
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar
                  key={initiator._id}
                  className="h-6 w-6 rounded-full hover:cursor-default"
                >
                  <AvatarImage
                    src={initiator?.pfpPath}
                    alt={`${initiator?.firstName} ${initiator.lastName}`}
                  />
                  <AvatarFallback>
                    {initiator.firstName[0] + initiator.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{initiator.firstName + " " + initiator.lastName}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex overflow-hidden">
          Joined by: &nbsp;&nbsp;&nbsp;
          {acceptedAt?.map(({ user }) => (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar
                  key={user._id}
                  className="h-6 w-6 rounded-full hover:cursor-default"
                >
                  <AvatarImage
                    src={user?.pfpPath}
                    alt={`${user?.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback>
                    {user.firstName[0] + user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.firstName + " " + user.lastName}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Call;
