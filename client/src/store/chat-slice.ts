import { CaseReducer, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { GET_CHATS } from "@/gql-calls/queries";
import { client } from "@/middlewares/auth";

import { createAppSlice } from "./createAppSlice";

interface Chat {
  _id: string;
  chatName: string;
  members: User[];
  unreadCount: number;
  lastMessage?: Message;
  lastSeen: {
    userId: string;
    messageId: string;
    timestamp: string;
  }[];
}

export interface User {
  _id: string;
  pfpPath: string;
  firstName: string;
  lastName: string;
  userName: string;
  lastSeen?: {
    messageId: string;
    timestamp: string;
  };
}

export interface Message {
  _id: string;
  content: string;
  sender: User;
  createdAt: string;
  updatedAt: string;
}

export type SocketMessage = Message & {
  chat: { _id: string; chatName: string };
};

interface ChatState {
  chats: {
    chatId: string;
    chatName: string;
    unreadCount: number;
    chatMembers?: User[];
    chatMessages: Message[];
  }[];
  lastMessages: Record<string, Message | null>;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  lastMessages: {},
  error: null,
};

const messageReceived: CaseReducer<
  ChatState,
  PayloadAction<{
    message: SocketMessage;
    currentUserId: string;
  }>
> = (state, action) => {
  const { message, currentUserId } = action.payload;
  const { _id: chatId, chatName } = message.chat;
  const chat = state.chats.find((chat) => chat.chatId === chatId);
  const { chat: _chat, ...newMessage } = message; // Remove chat info from the message

  if (chat) {
    chat.chatMessages.push(newMessage);
    if (newMessage.sender._id !== currentUserId) {
      chat.unreadCount++;
    }
  } else {
    state.chats.push({
      chatId,
      chatName,
      unreadCount: 1,
      chatMessages: [newMessage],
    });
  }
  state.lastMessages[chatId] = newMessage;
};

const messageSent: CaseReducer<
  ChatState,
  PayloadAction<{ message: SocketMessage }>
> = (state, action) => {
  // This is not required.
};

const setSeen: CaseReducer<
  ChatState,
  PayloadAction<{
    chatId: string;
    userId: string;
    messageId: string;
    timestamp: string;
  }>
> = (state, action) => {
  // This is not required.
};

const setLastSeen: CaseReducer<
  ChatState,
  PayloadAction<{
    chatId: string;
    userId: string;
    messageId: string;
    timestamp: string;
  }>
> = (state, action) => {
  const { chatId, messageId, userId, timestamp } = action.payload;
  const chat = state.chats.find((chat) => chat.chatId === chatId);
  if (chat) {
    chat.unreadCount = 0;
    const user = chat.chatMembers?.find((user) => user._id === userId);
    if (user) {
      user.lastSeen = {
        messageId,
        timestamp,
      };
    }
  }
};

const joinChatRooms: CaseReducer<ChatState, PayloadAction<Chat[]>> = (
  state,
  action
) => {
  const chats = action.payload;
  chats.forEach((chat) => {
    if (!state.chats.some((c) => c.chatId === chat._id)) {
      const lastSeen = chat.lastSeen;
      let chatMembers = chat.members;
      if (lastSeen && lastSeen.length >= 1) {
        chatMembers = chatMembers.map((member) => {
          const seenData = lastSeen.find((seen) => seen.userId === member._id);
          if (seenData) {
            return {
              ...member,
              lastSeen: {
                messageId: seenData.messageId,
                timestamp: seenData.timestamp,
              },
            };
          }
          return member;
        });
      }
      state.chats.push({
        chatId: chat._id,
        chatName: chat.chatName,
        chatMembers: chatMembers,
        unreadCount: chat.unreadCount,
        chatMessages: [],
      });
      state.lastMessages[chat._id] = chat.lastMessage || null;
    }
  });
};

const setConversationMessages: CaseReducer<
  ChatState,
  PayloadAction<{ chatId: string; chatName: string; messages: Message[] }>
> = (state, action) => {
  const { chatId, chatName, messages } = action.payload;
  const chat = state.chats.find((chat) => chat.chatId === chatId);

  if (chat) {
    chat.chatMessages.unshift(...[...messages]);
  } else {
    state.chats.push({
      chatId,
      chatName,
      unreadCount: 0,
      chatMessages: messages,
    });
  }
};

// Calling this when a user creates a new chat
const addNewChat: CaseReducer<
  ChatState,
  PayloadAction<{ chatId: string; chatName: string; chatMembers: User[] }>
> = (state, action) => {
  const { chatId, chatName, chatMembers } = action.payload;
  if (!state.chats.some((chat) => chat.chatId === chatId)) {
    state.chats.push({
      chatId,
      chatName,
      chatMembers,
      unreadCount: 1,
      chatMessages: [],
    });
  }
};

const setError: CaseReducer<ChatState, PayloadAction<string | null>> = (
  state,
  action
) => {
  state.error = action.payload;
};

export const chatSlice = createAppSlice({
  name: "chat",
  initialState: initialState,
  reducers: {
    addNewChat,
    messageReceived,
    messageSent,
    setSeen,
    setLastSeen,
    joinChatRooms,
    setConversationMessages,
    setError,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserConversations.fulfilled, (state, action) => {});
    // TODO: Handle other async thunk states (pending, rejected) if needed
  },
  selectors: {
    getLastMessages: (chat) => {
      return chat.lastMessages;
    },
    getAllUsersLastSeenInChat: (chat, chatId: string) => {
      const chatData = chat.chats.find((c) => c.chatId === chatId);
      const usersLastSeen = chatData?.chatMembers?.map((member) => {
        return { ...member.lastSeen, user: { ...member } };
      });
      return usersLastSeen;
    },
    getUsersLastSeenInChat: (
      chat,
      { chatId, userId }: { chatId: string; userId: string }
    ) => {
      const chatData = chat.chats.find((c) => c.chatId === chatId);
      const user = chatData?.chatMembers?.find(
        (member) => member._id === userId
      );
      return user?.lastSeen || null;
    },
    getUnreadChatCount: (chat) => {
      return chat.chats.filter((chat) => chat.unreadCount > 0).length;
    },
  },
});

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  getLastMessages,
  getAllUsersLastSeenInChat,
  getUsersLastSeenInChat,
  getUnreadChatCount,
} = chatSlice.selectors;
export const chatActions = chatSlice.actions;

export const fetchUserConversations = createAsyncThunk(
  "chat/fetchUserConversations",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await client.query({
        query: GET_CHATS,
        fetchPolicy: "network-only",
      });

      const fetchedChats = data.fetchChats;
      dispatch(chatActions.joinChatRooms(fetchedChats));
    } catch (error) {
      console.error("Error fetching user conversations through Thunk: ", error);
      return rejectWithValue("Failed to fetch conversations.");
    }
  }
);
