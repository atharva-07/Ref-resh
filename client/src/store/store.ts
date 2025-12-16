import { combineSlices, configureStore } from "@reduxjs/toolkit";

import { authSlice } from "./auth-slice";
import { callSlice } from "./call-slice";
import { chatSlice } from "./chat-slice";
import createSocketMiddleware from "./middlewares/socket-middleware";
import createSseMiddleware from "./middlewares/sse-middleware";
import { notificationSlice } from "./notifications-slice";

const rootReducer = combineSlices(
  authSlice,
  chatSlice,
  notificationSlice,
  callSlice
);

export type RootState = ReturnType<typeof rootReducer>;

const socketMiddleware = createSocketMiddleware();
const sseMiddleware = createSseMiddleware();

export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["socket/connect", "socket/disconnect"],
          ignoredPaths: [],
        },
      }).concat(socketMiddleware, sseMiddleware);
    },
    preloadedState,
  });
  return store;
};

const store = makeStore();

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];

export default store;

import { peerJSService } from "../services/peer-service";
// By importing and initializing it here, the service starts listening
// to the Redux store as soon as the application loads.
peerJSService.initialize();
