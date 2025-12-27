import {
  CaseReducer,
  createAsyncThunk,
  createSelector,
  PayloadAction,
} from "@reduxjs/toolkit";

import { GET_CHATS } from "@/gql-calls/queries";
import { client } from "@/middlewares/auth";

import { createAppSlice } from "./createAppSlice";
import { RootState } from "./store";

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
  firstName: string;
  lastName: string;
  userName: string;
  pfpPath: string;
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
  activeUsers?: string[];
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  lastMessages: {},
  activeUsers: [],
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
> = () => {};

const setSeen: CaseReducer<
  ChatState,
  PayloadAction<{
    chatId: string;
    userId: string;
    messageId: string;
    timestamp: string;
  }>
> = () => {};

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
    const user = chat.chatMembers?.find((user) => user._id === userId);
    if (user) {
      user.lastSeen = {
        messageId,
        timestamp,
      };
    }
  }
};

const resetUnreadCount: CaseReducer<
  ChatState,
  PayloadAction<{ chatId: string }>
> = (state, action) => {
  const { chatId } = action.payload;
  const chat = state.chats.find((chat) => chat.chatId === chatId);
  if (chat) {
    chat.unreadCount = 0;
  }
};

const joinChatRooms: CaseReducer<ChatState, PayloadAction<Chat[]>> = (
  state,
  action,
) => {
  const chats = action.payload;
  chats.forEach((chat) => {
    if (!state.chats.some((c) => c.chatId === chat._id)) {
      const lastSeen = chat.lastSeen;
      let chatMembers = chat.members;
      if (lastSeen && lastSeen.length > 0) {
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
  }
  // TODO: Uncommenting this seems to solve our issue with joinChatRooms and setConversationMessages on refreshing /:chatId
  // else {
  //   state.chats.push({
  //     chatId,
  //     chatName,
  //     unreadCount: 0,
  //     chatMessages: messages,
  //   });
  // }
};

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
      unreadCount: 0,
      chatMessages: [],
    });
  }
};

const setActiveUsers: CaseReducer<ChatState, PayloadAction<string[]>> = (
  state,
  action,
) => {
  state.activeUsers = action.payload;
};

const setError: CaseReducer<ChatState, PayloadAction<string | null>> = (
  state,
  action,
) => {
  state.error = action.payload;
};

const selectChats = (state: RootState) => state.chat.chats;

export const getAllUsersLastSeenInChat = createSelector(
  [selectChats, (_state: any, chatId: string) => chatId],
  (chats, chatId) => {
    const chatData = chats.find((c) => c.chatId === chatId);
    const usersLastSeen = chatData?.chatMembers?.map((member) => {
      return { ...member.lastSeen, user: { ...member } };
    });
    return usersLastSeen;
  },
);

export const getUsersLastSeenInChat = createSelector(
  [
    selectChats,
    (_state: any, params: { chatId: string; userId: string }) => params,
  ],
  (chats, { chatId, userId }) => {
    const chatData = chats.find((c) => c.chatId === chatId);
    const user = chatData?.chatMembers?.find((member) => member._id === userId);
    return user?.lastSeen || null;
  },
);

export const chatSlice = createAppSlice({
  name: "chat",
  initialState: initialState,
  reducers: {
    addNewChat,
    messageReceived,
    messageSent,
    setSeen,
    setLastSeen,
    resetUnreadCount,
    joinChatRooms,
    setConversationMessages,
    setActiveUsers,
    setError,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserConversations.fulfilled, (_, __) => {});
    // TODO: Handle other async thunk states (pending, rejected) if needed
  },
  selectors: {
    getLastMessages: (chat) => {
      return chat.lastMessages;
    },
    // getAllUsersLastSeenInChat: (chat, chatId: string) => {
    //   const chatData = chat.chats.find((c) => c.chatId === chatId);
    //   const usersLastSeen = chatData?.chatMembers?.map((member) => {
    //     return { ...member.lastSeen, user: { ...member } };
    //   });
    //   return usersLastSeen;
    // },
    // getUsersLastSeenInChat: (
    //   chat,
    //   { chatId, userId }: { chatId: string; userId: string }
    // ) => {
    //   const chatData = chat.chats.find((c) => c.chatId === chatId);
    //   const user = chatData?.chatMembers?.find(
    //     (member) => member._id === userId
    //   );
    //   return user?.lastSeen || null;
    // },
    getUnreadChatCount: (chat) => {
      return chat.chats.filter((chat) => chat.unreadCount > 0).length;
    },
    getActiveUsers: (chat) => {
      return chat.activeUsers || [];
    },
  },
});

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  getLastMessages,
  // getAllUsersLastSeenInChat,
  // getUsersLastSeenInChat,
  getUnreadChatCount,
  getActiveUsers,
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

      if (data) {
        const fetchedChats = data.fetchChats;
        dispatch(chatActions.joinChatRooms(fetchedChats));
      }
    } catch (error) {
      console.error("Error fetching user conversations through Thunk: ", error);
      return rejectWithValue("Failed to fetch conversations.");
    }
  },
);
