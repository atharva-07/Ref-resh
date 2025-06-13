import { useMutation, useQuery } from "@apollo/client";
import { get } from "http";
import moment from "moment";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import ChatWindow from "@/components/main/chat/chat-window";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchBar from "@/components/ui/search-bar";
import { CREATE_NEW_CHAT } from "@/gql-calls/mutation";
import { GET_CHATS, GET_USER_FOLLOWERS } from "@/gql-calls/queries";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  getISOStringFromTimestamp,
  getRelativeTime,
  ISO_STRING_FORMAT,
} from "@/utility/utility-functions";

const Conversations = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedRecipients, setSelectedRecipients] = useState<
    { userId: string; firstName: string }[]
  >([]);

  const {
    data: chats,
    error: chatsError,
    loading: chatsLoading,
  } = useQuery(GET_CHATS, {
    fetchPolicy: "network-only", // TODO: Assess this
  });
  const {
    data: followers,
    error: flwError,
    loading: flwLoading,
  } = useQuery(GET_USER_FOLLOWERS, {
    variables: {
      userName: user?.username,
    },
    fetchPolicy: "network-only", // TODO: Assess this
  });

  const [createNewChat, { error: newChatError, loading: newChatLoading }] =
    useMutation(CREATE_NEW_CHAT);

  const handleSelectRecipient = (selectedRecipient: {
    userId: string;
    firstName: string;
  }) => {
    const exists = selectedRecipients.find(
      (recipient) => recipient.userId === selectedRecipient.userId
    );
    setSelectedRecipients((prev) => {
      return exists
        ? selectedRecipients.filter(
            (recipient) => recipient.userId !== selectedRecipient.userId
          )
        : [...prev, selectedRecipient];
    });
  };

  const handleCreateNewChat = () => {
    // If it's a group chat, set ChatName as 'People, People & People'
    const firstNames = selectedRecipients.map(
      (recipient) => recipient.firstName
    );
    firstNames.push(user?.fullName.split(" ")[0] as string);
    firstNames.sort((a, b) => a.localeCompare(b));
    const firstNamesString = firstNames.join();
    const defaultChatName = firstNamesString.replace(/,/g, ", ");

    const chatMembers = selectedRecipients.map((recipents) => recipents.userId);
    chatMembers.push(user?.userId as string);

    createNewChat({
      variables: {
        chatMembers: chatMembers,
        chatName: defaultChatName,
      },
    });

    setSelectedRecipients((prev) => []);
  };

  return (
    <div className="flex w-full gap-20 border">
      <div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Start New Chat</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Please select the person you want to chat with.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {followers && followers.fetchUserFollowers.length <= 0 && (
              <span className="text-destructive text-sm font-bold">
                You've got no followers yet. Please follow somebody to chat with
                them.
              </span>
            )}
            {followers && followers.fetchUserFollowers.length > 0 && (
              <ScrollArea className="h-72 rounded-md border">
                <div className="p-4">
                  <ol className="grid grid-cols-3 gap-4">
                    {followers.fetchUserFollowers.map(
                      (user: {
                        _id: string;
                        firstName: string;
                        lastName: string;
                        userName: string;
                        pfpPath: string;
                      }) => (
                        <li
                          key={user._id}
                          className={`
                            hover:cursor-pointer ${
                              selectedRecipients.find(
                                (recipient) => recipient.userId === user._id
                              )
                                ? "border border-primary"
                                : undefined
                            }`}
                          onClick={() =>
                            handleSelectRecipient({
                              userId: user._id,
                              firstName: user.firstName,
                            })
                          }
                        >
                          <div>
                            <Avatar className="h-8 w-8 rounded-lg">
                              <AvatarImage
                                src={user?.pfpPath}
                                alt={`${user?.firstName} ${user.lastName}`}
                              />
                              <AvatarFallback className="rounded-lg">
                                {user.firstName[0] + user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">
                              {user.firstName + " " + user.lastName}
                            </span>
                          </div>
                        </li>
                      )
                    )}
                  </ol>
                </div>
              </ScrollArea>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCreateNewChat}>
                Start Chatting.
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div>
          <span className="font-bold text-lg">Chats</span>
          {chats && chats.fetchChats.length <= 0 && (
            <p>So fucking empty. You gotta start talking to people gang.</p>
          )}
          <ol className="child:m-2 child:p-1">
            {chats &&
              chats.fetchChats.length > 0 &&
              chats.fetchChats.map(
                (chat: {
                  _id: string;
                  members: {
                    _id: string;
                    firstName: string;
                    lastName: string;
                    pfpPath: string;
                  }[];
                  chatName: string;
                  lastMessage: {
                    content: string;
                    sender: { firstName: string; lastName: string };
                    createdAt: string;
                  };
                }) => {
                  const chatMembers = chat.members.filter(
                    (m) => m._id !== user?.userId
                  );
                  const groupChat: boolean = chatMembers.length > 1;
                  const recipient = groupChat
                    ? chat.chatName
                    : chatMembers[0].firstName + " " + chatMembers[0].lastName;

                  return (
                    <li key={chat._id} className="border border-accent">
                      <NavLink to={chat._id}>
                        <div>
                          <p className="font-bold">{recipient}</p>
                          <p className="text-sm text-muted-foreground">
                            {chat.lastMessage.sender.firstName}:&nbsp;{" "}
                            {chat.lastMessage.content}
                            <span>
                              {getRelativeTime(
                                getISOStringFromTimestamp(
                                  chat.lastMessage.createdAt
                                )
                              )}
                            </span>
                          </p>
                        </div>
                      </NavLink>
                    </li>
                  );
                }
              )}
          </ol>
        </div>
        {/* <SearchBar /> */}
      </div>
      <div className="grow">
        <Outlet />
      </div>
    </div>
  );
};

export default Conversations;
