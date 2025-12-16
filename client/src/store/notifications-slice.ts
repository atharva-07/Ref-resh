import {
  CaseReducer,
  createAction,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";

import { NotificationProps } from "@/components/main/notification/notification";
import { GET_NOTIFICATIONS } from "@/gql-calls/queries";
import { client } from "@/middlewares/auth";
import { NOTIFICATIONS_PAGE_SIZE } from "@/utility/constants";

import { createAppSlice } from "./createAppSlice";

type Notification = Omit<NotificationProps, "redirectionURL" | "unread">;

interface NotificationState {
  unreadNotifications: Notification[];
  isConnected: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  unreadNotifications: [],
  isConnected: false,
  error: null,
};

const loadIntitialUnreadNotifications: CaseReducer<
  NotificationState,
  PayloadAction<Notification[]>
> = (state, action) => {
  state.unreadNotifications = action.payload;
};

const readNotifications: CaseReducer<NotificationState> = (state) => {
  state.unreadNotifications = [];
};

export const notificationSlice = createAppSlice({
  name: "notification",
  initialState: initialState,
  reducers: {
    loadIntitialUnreadNotifications,
    readNotifications,
  },
  extraReducers: (builder) => {
    builder
      .addCase("sse/connection_success", (state) => {
        state.isConnected = true;
      })
      .addCase("sse/connection_closed", (state) => {
        state.isConnected = false;
      })
      .addCase(
        createAction<Notification>("sse/notification_received"),
        (state, action) => {
          if (action.payload.eventType) {
            state.unreadNotifications.unshift(action.payload);
          }
        }
      )
      .addCase("sse/connection_error", (state) => {
        state.error = "Error establisng SSE Connection.";
      });
  },
  selectors: {
    getUnreadNotificationsCount: (state) => state.unreadNotifications.length,
  },
});

export const { getUnreadNotificationsCount } = notificationSlice.selectors;
export const notificationActions = notificationSlice.actions;

export const fetchUnreadNotifications = createAsyncThunk(
  "notification/fetchUnreadNotifications",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await client.query({
        query: GET_NOTIFICATIONS,
        variables: {
          pageSize: NOTIFICATIONS_PAGE_SIZE,
        },
        fetchPolicy: "network-only",
      });

      const fetchedNotifications = data.fetchNotifications;
      const unreadNotifications = fetchedNotifications.edges.filter(
        (notif) => notif.node.unread === true
      );
      const transformedUnreadNotifications = unreadNotifications.map(
        ({ node }) => {
          const { redirectionURL, unread, ...notif } = node;
          return notif;
        }
      );
      dispatch(
        notificationActions.loadIntitialUnreadNotifications(
          transformedUnreadNotifications
        )
      );
    } catch (error) {
      console.error(
        "Error fetching unread notification through Thunk: ",
        error
      );
      return rejectWithValue("Failed to fetch unread notifications.");
    }
  }
);
