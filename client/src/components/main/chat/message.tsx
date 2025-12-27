import { useMutation } from "@apollo/client";
import moment from "moment";
import { useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UPDATE_LAST_SEEN } from "@/gql-calls/mutation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";
import { chatActions, getUsersLastSeenInChat, User } from "@/store/chat-slice";

import { BasicUserData, TimeStamps } from "../post/post";

export interface MessageProps extends TimeStamps {
  _id: string;
  content: string;
  sender: User;
  own: boolean;
  isLastMessage: boolean;
  chatId: string;
  lastSeenByAvatars: BasicUserData[];
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

          if (data?.updateLastSeen) {
            dispatch(
              chatActions.setSeen({
                chatId,
                userId: user!.userId,
                messageId: data.updateLastSeen.messageId,
                timestamp: data.updateLastSeen.timestamp,
              })
            );
            dispatch(chatActions.resetUnreadCount({ chatId }));
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
    <div ref={isLastMessage ? ref : null} className="flex gap-2 ml-4 mr-5 my-4">
      {!own && (
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage
            src={sender.pfpPath}
            alt={sender.firstName}
          ></AvatarImage>
          <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
        </Avatar>
      )}
      <TooltipProvider>
        <Tooltip delayDuration={800}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
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
      </TooltipProvider>
      {lastSeenByAvatars && lastSeenByAvatars.length > 0 && (
        <div className="flex items-end">
          {lastSeenByAvatars.map((user) => (
            <Avatar key={user._id} className="h-4 w-4 rounded-full text-[10px]">
              <AvatarImage
                src={user.pfpPath}
                alt={user.firstName[0] + user.lastName[0]}
              ></AvatarImage>
              <AvatarFallback className="rounded-lg">
                {user.firstName[0] + user.lastName[0]}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
    </div>
  );
};

export default Message;
