import { CaseReducer, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { LEAVE_CALL } from "@/gql-calls/mutation";
import { GET_CALLS_HISTORY_BY_CHAT } from "@/gql-calls/queries";
import { client } from "@/middlewares/auth";

import { User } from "./chat-slice";
import { createAppSlice } from "./createAppSlice";
import { RootState } from "./store";

export type CallStatus =
  | "idle"
  | "ringing"
  | "connecting"
  | "connected"
  | "ended";

export type Participant = Omit<User, "lastSeen">;

export interface UserPeerData {
  user: Participant;
  peerId: string;
}

export interface CallSession {
  chatId: string;
  callId: string;
  callerId: string;
  participants: UserPeerData[];
  isInitiator: boolean;
  callStatus: CallStatus;
  localStreamReady: boolean;
  remoteStreamReady: boolean;
}

interface CallState {
  activeCall: CallSession | null;
  error: string | null;
}

const initialState: CallState = {
  activeCall: null,
  error: null,
};

const checkCallActive = (state: CallState): CallSession | undefined => {
  if (!state.activeCall) {
    state.error = "No active call session to perform this action.";
    return undefined;
  }
  return state.activeCall;
};

const callInitiate: CaseReducer<
  CallState,
  PayloadAction<{
    chatId: string;
    callId: string;
    caller: Participant;
    peerId: string;
  }>
> = (state, action) => {
  const { chatId, callId, caller, peerId } = action.payload;

  if (state.activeCall) return;

  state.activeCall = {
    chatId,
    callId,
    callerId: caller._id,
    participants: [{ user: caller, peerId: peerId }],
    isInitiator: true,
    callStatus: "ringing",
    localStreamReady: false,
    remoteStreamReady: false,
  };
  state.error = null;
};

const callJoin: CaseReducer<
  CallState,
  PayloadAction<{ chatId: string; user: Participant; peerId: string }>
> = (state) => {
  const call = checkCallActive(state);
  if (call) {
    call.callStatus = "connecting";
  }
};

const callHangup: CaseReducer<
  CallState,
  PayloadAction<{ chatId: string; userId: string }>
> = (state) => {
  const call = checkCallActive(state);

  if (call) {
    call.callStatus = "ended";
  }
};

const incomingCall: CaseReducer<
  CallState,
  PayloadAction<{
    chatId: string;
    callId: string;
    caller: Participant;
    peerId: string;
  }>
> = (state, action) => {
  const { chatId, callId, caller, peerId } = action.payload;

  if (state.activeCall) return;

  state.activeCall = {
    chatId,
    callId,
    callerId: caller._id,
    participants: [{ user: caller, peerId: peerId }],
    isInitiator: false,
    callStatus: "ringing",
    localStreamReady: false,
    remoteStreamReady: false,
  };
  state.error = null;
};

const userJoined: CaseReducer<
  CallState,
  PayloadAction<{ chatId: string; user: Participant; peerId: string }>
> = (state, action) => {
  const call = checkCallActive(state);
  if (call && call.chatId === action.payload.chatId) {
    const { user, peerId } = action.payload;

    // Add the new participant if they don't already exist
    if (!call.participants.some((p) => p.user._id === user._id)) {
      call.participants.push({ user, peerId });
    }
  }
};

const userLeft: CaseReducer<
  CallState,
  PayloadAction<{ chatId: string; userId: string }>
> = (state, action) => {
  const call = checkCallActive(state);

  if (call && call.chatId === action.payload.chatId) {
    call.participants = call.participants.filter(
      (p) => p.user._id !== action.payload.userId
    );
  }
};

const callEnded: CaseReducer<CallState, PayloadAction<{ chatId: string }>> = (
  state,
  action
) => {
  if (state.activeCall?.chatId === action.payload.chatId) {
    state.activeCall = null;
    state.error = null;
  }
};

const callAccepted: CaseReducer<CallState, PayloadAction<void>> = (state) => {
  const call = checkCallActive(state);
  if (call) {
    call.callStatus = "connecting"; // Trigger local media acquisition and PeerJS join
  }
};

const callConnected: CaseReducer<CallState, PayloadAction<void>> = (state) => {
  const call = checkCallActive(state);
  if (call) {
    call.callStatus = "connected";
  }
};

export const callSlice = createAppSlice({
  name: "call",
  initialState: initialState,
  reducers: {
    callInitiate,
    callJoin,
    callHangup,
    incomingCall,
    userJoined,
    userLeft,
    callEnded,
    callAccepted,
    callConnected,

    setStreamReady: (
      state,
      action: PayloadAction<{ type: "local" | "remote"; ready: boolean }>
    ) => {
      const call = checkCallActive(state);
      if (call) {
        if (action.payload.type === "local")
          call.localStreamReady = action.payload.ready;
        if (action.payload.type === "remote")
          call.remoteStreamReady = action.payload.ready;

        if (call.localStreamReady && call.participants.length > 1) {
          call.callStatus = "connected";
        }
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setActiveCallNull: (state) => {
      state.activeCall = null;
    },
  },
  selectors: {
    getActiveCall: (call) => call.activeCall,
  },
});

export const callActions = callSlice.actions;
export default callSlice.reducer;

// For the last user who cannot manually click on handup button because the call ended.
export const terminateCall = createAsyncThunk(
  "call/terminate",
  async (
    payload: { chatId: string; lastUserId: string },
    { dispatch, rejectWithValue, getState }
  ) => {
    const { chatId, lastUserId } = payload;
    try {
      await client.mutate({
        mutation: LEAVE_CALL,
        variables: {
          callId: (getState() as RootState).call.activeCall?.callId,
          userId: lastUserId,
        },
        refetchQueries: [
          {
            query: GET_CALLS_HISTORY_BY_CHAT,
            variables: {
              chatId,
              pageSize: 1,
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error terminating call through Thunk: ", error);
      return rejectWithValue("Failed to terminate call for last user.");
    } finally {
      dispatch(callActions.callEnded({ chatId }));
    }
  }
);
