import { useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

import { GET_CHAT_MESSAGES } from "@/gql-calls/queries";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useSocket } from "@/hooks/useSocket";
import {
  chatActions,
  getAllUsersLastSeenInChat,
  getLastMessages,
} from "@/store/chat-slice";
import { MESSAGES_PAGE_SIZE } from "@/utility/constants";

export const useChatMessages = (chatId: string) => {
  const { user } = useAppSelector((state) => state.auth);
  const { chats } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();
  const chat = chats.find((c) => c.chatId === chatId);

  const lastMessages = useAppSelector(getLastMessages);
  const lastMessageId = lastMessages[chatId]?._id;
  const allMessages = useMemo(() => (chat ? chat.chatMessages : []), [chat]);
  const usersLastSeen = useAppSelector((state) =>
    getAllUsersLastSeenInChat(state, chatId)
  );

  const socket = useSocket();

  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [participantTypingStatus, setParticipantTypingStatus] = useState<
    Map<string, boolean>
  >(new Map());
  const [chatRecipient, setChatRecipient] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // New state to track initial load

  const { data, loading, fetchMore } = useQuery(GET_CHAT_MESSAGES, {
    variables: {
      chatId,
      pageSize: MESSAGES_PAGE_SIZE,
      after: null,
    },
    skip: !chatId,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    // Reset initial load status when chatId changes
    setLoadingMore(false);
    setHasNextPage(false);
    setEndCursor(null);
    setChatRecipient(data?.fetchChatMessages?.chatName || null);
    setIsInitialLoad(true); // Reset to true for new chat
  }, [chatId, data]);

  useEffect(() => {
    if (data?.fetchChatMessages.edges) {
      const existingMessagesIds = new Set(chat?.chatMessages.map((p) => p._id));
      const chatName = data.fetchChatMessages.chatName as string;
      const messages = data.fetchChatMessages.edges
        .map((edge) => edge.node)
        .filter((node) => !existingMessagesIds.has(node._id))
        .reverse();

      dispatch(
        chatActions.setConversationMessages({
          chatId,
          chatName,
          messages,
        })
      );
      setHasNextPage(data.fetchChatMessages.pageInfo.hasNextPage);
      setEndCursor(data.fetchChatMessages.pageInfo.endCursor);

      // Only set initial load to false if we have successfully fetched messages
      if (!loading) {
        setIsInitialLoad(false);
      }
    }
  }, [data, chatId, dispatch, chat?.chatMessages, loading]);

  const [ref, inView] = useInView({
    rootMargin: "0px 0px 40px 0px",
    threshold: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !loadingMore) {
      setLoadingMore(true);
      fetchMore({
        variables: {
          pageSize: MESSAGES_PAGE_SIZE,
          after: endCursor,
        },
        // TODO: This is commented out because it was causing duplication with the message bubble's key.
        // TODO: Don't need this for useQuery, but if you use useSuspenseQuery, you might need it.
        // updateQuery: (prevResult, { fetchMoreResult }) => {
        //   if (!fetchMoreResult || !fetchMoreResult.fetchChatMessages) {
        //     return prevResult;
        //   }

        //   const newEdges = fetchMoreResult.fetchChatMessages.edges || [];
        //   const newPageInfo = fetchMoreResult.fetchChatMessages.pageInfo;

        //   return {
        //     fetchChatMessages: {
        //       ...prevResult!.fetchChatMessages,
        //       edges: [...prevResult!.fetchChatMessages.edges, ...newEdges],
        //       pageInfo: newPageInfo,
        //     },
        //   };
        // },
      })
        .then(({ data: fetchMoreResult }) => {
          if (fetchMoreResult?.fetchChatMessages?.edges) {
            const existingMessagesIds = new Set(
              chat?.chatMessages.map((p) => p._id)
            );
            const chatName = fetchMoreResult.fetchChatMessages
              .chatName as string;
            const messages = fetchMoreResult.fetchChatMessages.edges
              .map((edge) => edge.node)
              .filter((node) => !existingMessagesIds.has(node._id))
              .reverse();

            dispatch(
              chatActions.setConversationMessages({
                chatId,
                chatName,
                messages,
              })
            );
            setHasNextPage(
              fetchMoreResult.fetchChatMessages.pageInfo.hasNextPage
            );
            setEndCursor(fetchMoreResult.fetchChatMessages.pageInfo.endCursor);
          }
        })
        .finally(() => setLoadingMore(false));
    }
  }, [
    inView,
    hasNextPage,
    endCursor,
    fetchMore,
    loadingMore,
    chatId,
    dispatch,
    chat?.chatMessages,
  ]);

  useEffect(() => {
    if (!socket) return;
    // ... (socket listeners remain the same)
    socket.on("setTyping", ({ username, chatId: socketChatId }) => {
      if (chatId === socketChatId) {
        setParticipantTypingStatus((prevStatus) => {
          const newStatus = new Map(prevStatus);
          newStatus.set(username, true);
          return newStatus;
        });
      }
    });

    socket.on("clearTyping", ({ username, chatId: socketChatId }) => {
      if (chatId === socketChatId) {
        setParticipantTypingStatus((prevStatus) => {
          const newStatus = new Map(prevStatus);
          newStatus.set(username, false);
          return newStatus;
        });
      }
    });

    return () => {
      socket.off("setTyping");
      socket.off("clearTyping");
    };
  }, [socket, chatId]);

  const getTypingStatusMessage = () => {
    const typingUsers = Array.from(participantTypingStatus.entries())
      .filter(([username, isTyping]) => isTyping && username !== user?.username)
      .map(([username]) => username);

    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length > 1) {
      return `${typingUsers.join(", ")} are typing...`;
    }
    return null;
  };

  const typingMessage = getTypingStatusMessage();

  return {
    allMessages,
    lastMessageId,
    usersLastSeen,
    loading,
    loadingMore,
    hasNextPage,
    chatRecipient,
    typingMessage,
    ref,
    user,
    isInitialLoad,
  };
};
