import { CaseReducer } from "@reduxjs/toolkit";

import { createAppSlice } from "./createAppSlice";

interface Notification {
  type: string;
  data: {
    message: string;
    fromUser: {
      id: string;
      fullname: string;
      username: string;
      avatar: string;
    };
  };
}

const initialState: Notification[] = [];

// const startSSE: CaseReducer<Notification[], Notification> = (state, action) => {}

// const stopSSE: CaseReducer<Notification[], Notification> = (state) => {
//   state
// }

const notificationSlice = createAppSlice({
  name: "notifications",
  initialState: initialState,
  reducers: {
    // startSSE,
    // stopSSE,
  },
  selectors: {},
});

export const todoCringe = notificationSlice.selectors;
export const notificationActions = notificationSlice.actions;
