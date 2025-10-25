import { useMutation, useQuery } from "@apollo/client";
import { Check } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CREATE_NEW_CHAT } from "@/gql-calls/mutation";
import {
  GET_USER_FOLLOWERS,
  PaginatedData,
  SEARCH_USER_FOLLOWERS,
} from "@/gql-calls/queries";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { chatActions } from "@/store/chat-slice";
import { USERS_PAGE_SIZE } from "@/utility/constants";

import { BasicUserData } from "../post/post";
import SearchList, { Query } from "../search-list";

const NewChatButton = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [selectedRecipients, setSelectedRecipients] = useState<
    {
      _id: string;
      firstName: string;
      lastName: string;
      userName: string;
      pfpPath: string;
    }[]
  >([]);

  const fetchFollowers: Query<{
    fetchUserFollowers: PaginatedData<BasicUserData>;
  }> = {
    query: GET_USER_FOLLOWERS,
    variables: {
      userId: user!.userId,
    },
  };

  const searchFollowers: Query<{ searchUserFollowers: BasicUserData[] }> = {
    query: SEARCH_USER_FOLLOWERS,
    variables: {
      userId: user!.userId,
    },
  };

  const [createNewChat, { error: newChatError, loading: newChatLoading }] =
    useMutation(CREATE_NEW_CHAT);

  const handleSelectRecipient = (selectedRecipient: {
    _id: string;
    firstName: string;
    lastName: string;
    userName: string;
    pfpPath: string;
  }) => {
    const exists = selectedRecipients.find(
      (recipient) => recipient._id === selectedRecipient._id
    );
    setSelectedRecipients((prev) => {
      return exists
        ? selectedRecipients.filter(
            (recipient) => recipient._id !== selectedRecipient._id
          )
        : [...prev, selectedRecipient];
    });
  };

  const handleCreateNewChat = async () => {
    // If it's a group chat, set ChatName as 'People, People & People'
    const firstNames = selectedRecipients.map(
      (recipient) => recipient.firstName
    );
    firstNames.push(user?.fullName.split(" ")[0] as string);
    firstNames.sort((a, b) => a.localeCompare(b));
    const firstNamesString = firstNames.join();
    const defaultChatName = firstNamesString.replace(/,/g, ", ");

    const chatMembers = selectedRecipients.map((recipents) => recipents._id);
    chatMembers.push(user?.userId as string);

    try {
      const { data } = await createNewChat({
        variables: {
          chatMembers: chatMembers,
          chatName: defaultChatName,
        },
      });

      dispatch(
        chatActions.addNewChat({
          chatId: data.createNewChat._id,
          chatName: data.createNewChat.chatName,
          chatMembers: data.createNewChat.members,
        })
      );
      dispatch(chatActions.joinChatRooms([data.createNewChat]));
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
    setSelectedRecipients((_) => []);
  };

  return (
    <SearchList
      searchQuery={searchFollowers}
      fetchQuery={fetchFollowers}
      renderHeader={() => (
        <DialogHeader className="px-4 pb-5 pt-5">
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>
            Please select the people you want to chat with.
          </DialogDescription>
        </DialogHeader>
      )}
      renderFooter={() => (
        <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
          {selectedRecipients.length > 0 ? (
            <div className="flex -space-x-2 overflow-hidden">
              {selectedRecipients.map((user) => (
                <Avatar key={user._id} className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.pfpPath}
                    alt={`${user?.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback>
                    {user.firstName[0] + user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select user(s) to add to the new chat.
            </p>
          )}
          <Button
            disabled={selectedRecipients.length === 0}
            onClick={handleCreateNewChat}
          >
            Continue
          </Button>
        </DialogFooter>
      )}
      renderCommanItem={(user: BasicUserData) => (
        <CommandItem
          key={user._id}
          className="flex items-center px-2"
          onSelect={() =>
            handleSelectRecipient({
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              userName: user.userName,
              pfpPath: user.pfpPath,
            })
          }
        >
          <Avatar>
            <AvatarImage
              src={user?.pfpPath}
              alt={`${user?.firstName} ${user.lastName}`}
            />
            <AvatarFallback>
              {user.firstName[0] + user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-medium leading-none">
              {user.firstName + " " + user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">@{user.userName}</p>
          </div>
          {selectedRecipients.find((rec) => rec._id === user._id) ? (
            <Check className="ml-auto flex h-5 w-5 text-primary" />
          ) : null}
        </CommandItem>
      )}
      overwriteCommandItem={true}
    >
      <Button
        className="w-full bg-background border-t p-3 hover:cursor-pointer hover:bg-accent"
        variant="outline"
      >
        Start New Chat
      </Button>
    </SearchList>
  );
};

export default NewChatButton;
