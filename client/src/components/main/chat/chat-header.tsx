import { useMutation } from "@apollo/client";
import { Clock, Info, Phone } from "lucide-react";
import { Suspense } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CREATE_CALL } from "@/gql-calls/mutation";
import { GET_CALLS_HISTORY_BY_CHAT } from "@/gql-calls/queries";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { callActions } from "@/store/call-slice";
import { getActiveUsers } from "@/store/chat-slice";
import { CALLS_PAGE_SIZE } from "@/utility/constants";

import CallLoader from "../call/call-loader";

const ChatHeader = ({ chatId }: { chatId: string }) => {
  const dispatch = useAppDispatch();
  const [createCall, { loading, error }] = useMutation(CREATE_CALL);

  const { user } = useAppSelector((state) => state.auth);
  const chat = useAppSelector((state) =>
    state.chat.chats.find((chat) => chat.chatId === chatId)
  );

  const lastMessage = useAppSelector((state) =>
    chat ? state.chat.lastMessages[chat.chatId] : null
  );

  const activeUsers = useAppSelector(getActiveUsers);
  const activeMembers =
    chat &&
    chat.chatMembers
      ?.filter((m) => activeUsers.includes(m._id) && m._id !== user?.userId)
      .map((m) => m.firstName);

  const chatMembers = chat
    ? chat.chatMembers?.filter((m) => m._id !== user?.userId)
    : [];

  const groupChat: boolean = (chatMembers?.length ?? 0) > 1;

  const recipient = chat && chat.chatName;

  const chatAvatar =
    groupChat && lastMessage
      ? lastMessage.sender.pfpPath
      : chat?.chatName
          .split(" ")
          .map((n) => n[0])
          .join("");

  const chatAvatarFallback = groupChat
    ? lastMessage
      ? lastMessage.sender.firstName[0] + lastMessage.sender.lastName[0]
      : chat?.chatName
          .split(" ")
          .map((n) => n[0])
          .join("")
    : chat?.chatName
        .split(" ")
        .map((n) => n[0])
        .join("");

  const handleInitiate = async () => {
    try {
      const { data } = await createCall({
        variables: {
          chatId,
        },
      });
      if (data) {
        dispatch(
          callActions.callInitiate({
            chatId,
            callId: data.createCall._id,
            caller: {
              _id: user!.userId,
              firstName: user!.fullName.split(" ")[0],
              lastName: user!.fullName.split(" ")[1],
              userName: user!.username,
              pfpPath: user!.pfpPath,
            },
            peerId: user!.userId,
          })
        );
      }
    } catch (error) {
      const genericErrorMessage = "Could not initiate call.";
      callActions.setError(genericErrorMessage);
      toast.error(genericErrorMessage, {
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="flex justify-between p-4 border flex-shrink-0">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatAvatar} alt={recipient} />
          <AvatarFallback>{chatAvatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3>{recipient}</h3>
          {activeMembers && activeMembers?.length > 0 && (
            <span className="text-xs text-green-500">
              {`${activeMembers.join(", ")} ${activeMembers.length === 1 ? "is" : "are"} active now.`}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleInitiate}>
          <Phone />
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost">
              <Clock />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Call History</SheetTitle>
              <SheetDescription>
                This is the list of all the calls made in this chat.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="px-4">
              <Suspense>
                <CallLoader
                  query={GET_CALLS_HISTORY_BY_CHAT}
                  variables={{
                    chatId,
                  }}
                  pageSize={CALLS_PAGE_SIZE}
                  fallbackHeading={"No calls."}
                  fallbackContent={"There are no calls made in this chat yet."}
                />
              </Suspense>
            </ScrollArea>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        {chat && chat.chatMembers && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <Info />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{recipient}</DialogTitle>
                <DialogDescription>Chat particiapants</DialogDescription>
              </DialogHeader>
              {chat.chatMembers.length > 0 &&
                chat.chatMembers.map((user) => (
                  <div key={user._id} className="flex items-center px-2 my-1">
                    <Avatar>
                      <AvatarImage
                        src={user?.pfpPath}
                        alt={`${user?.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback>
                        {user.firstName[0] + user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-2 flex justify-between w-full">
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {user.firstName + " " + user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{user.userName}
                        </p>
                      </div>
                      <div>
                        {activeUsers.includes(user._id) && (
                          <span className="text-xs text-green-500 font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
