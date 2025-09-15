import { useMutation } from "@apollo/client";
import moment from "moment";
import { useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UPDATE_LAST_SEEN } from "@/gql-calls/mutation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";
import { chatActions, getUsersLastSeenInChat, User } from "@/store/chat-slice";
import { ISO_STRING_FORMAT } from "@/utility/utility-functions";

import { TimeStamps } from "../post/post";

export interface MessageProps extends TimeStamps {
  _id: string;
  content: string;
  sender: User;
  own: boolean;
  isLastMessage: boolean;
  chatId: string;
  lastSeenByAvatars: string[];
}

const Message = ({
  _id,
  content,
  sender,
  own,
  createdAt,
  isLastMessage,
  chatId,
  lastSeenByAvatars,
}: MessageProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const userLastSeen = useAppSelector((state) =>
    getUsersLastSeenInChat(state, { chatId, userId: user!.userId })
  );
  const dispatch = useAppDispatch();

  const userInitials = sender.firstName[0] + sender.lastName[0];

  const { ref, inView } = useInView({
    triggerOnce: true,
    // rootMargin: "200px 0px",
  });

  const [updateLastSeen] = useMutation(UPDATE_LAST_SEEN);

  useEffect(() => {
    let alreadySeen = false;
    if (userLastSeen) {
      alreadySeen = +userLastSeen.timestamp >= new Date(createdAt).getTime();
    }
    if (isLastMessage && inView && !own && !alreadySeen) {
      const handleMessageSeen = async () => {
        try {
          const { data } = await updateLastSeen({
            variables: {
              chatId,
              messageId: _id,
            },
          });

          if (data.updateLastSeen) {
            console.log(data);
            dispatch(
              chatActions.setSeen({
                chatId,
                userId: user!.userId,
                messageId: data.updateLastSeen.messageId,
                timestamp: data.updateLastSeen.timestamp,
              })
            );
          }
        } catch (error) {
          console.error("Error updating last seen:", error);
        }
      };

      handleMessageSeen();
    }
  }, [
    dispatch,
    own,
    user,
    isLastMessage,
    inView,
    _id,
    chatId,
    updateLastSeen,
    userLastSeen,
    createdAt,
  ]);

  return (
    <div ref={isLastMessage ? ref : null} className="flex gap-2 mx-2 mr-5 my-4">
      {!own && (
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage
            src={sender.pfpPath}
            alt={sender.firstName}
          ></AvatarImage>
          <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
        </Avatar>
      )}
      <Tooltip delayDuration={800}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
              own ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={cn(
            own
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <p>{moment(createdAt).format("LT")}</p>
        </TooltipContent>
      </Tooltip>
      {lastSeenByAvatars && lastSeenByAvatars.length > 0 && (
        <div className="flex items-end">
          {lastSeenByAvatars.map((avatar, index) => (
            <img
              key={index}
              src={avatar}
              alt="Last seen by"
              className="w-4 h-4 rounded-full"
            />
          ))}
        </div>
      )}
      {/* <div
        className={`max-w-sm p-2 rounded-xl mx-2 my-1 border child:mt-1 ${
          own ? "ml-auto bg-secondary" : "mr-auto bg-primary"
        }`}
      >
        <p className="text-sm">{content}</p>
        <p className="text-right text-xs opacity-40">
          {moment(createdAt).format("LT")}
        </p>
      </div> */}
    </div>
  );
};

export default Message;
