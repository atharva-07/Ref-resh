import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/hooks/useAppSelector";

const ChatHeader = ({ chatId }: { chatId: string }) => {
  const { user } = useAppSelector((state) => state.auth);
  const chat = useAppSelector((state) =>
    state.chat.chats.find((chat) => chat.chatId === chatId)
  );
  const lastMessage = useAppSelector(
    (state) => state.chat.lastMessages[chat!.chatId]
  );

  const chatMembers =
    chat && chat.chatMembers?.filter((m) => m._id !== user?.userId);
  const groupChat: boolean = (chatMembers?.length ?? 0) > 1;
  const recipient = groupChat
    ? chat && chat.chatName
    : chatMembers && chatMembers.length > 0
      ? chatMembers[0].firstName + " " + chatMembers[0].lastName
      : "Unknown Recipient";
  const chatAvatar = groupChat
    ? lastMessage?.sender.pfpPath
    : chatMembers![0].pfpPath;

  return (
    <div className="p-4 border flex-shrink-0">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatAvatar} alt={chat?.chatName} />
          <AvatarFallback>
            {chat?.chatName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3>{chat?.chatName}</h3>
          {/* <p className="text-sm text-muted-foreground">Online</p> */}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
