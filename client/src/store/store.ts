import { combineSlices, configureStore } from "@reduxjs/toolkit";

import { authSlice } from "./auth-slice";
import { chatSlice } from "./chat-slice";
import createSocketMiddleware from "./middlewares/socket-middleware";
import createSseMiddleware from "./middlewares/sse-middleware";
import { notificationSlice } from "./notifications-slice";

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
const rootReducer = combineSlices(authSlice, chatSlice, notificationSlice);

// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

const socketMiddleware = createSocketMiddleware();
const sseMiddleware = createSseMiddleware();

export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        serializableCheck: {
          // Ignore the socket middleware's actions
          ignoredActions: ["socket/connect", "socket/disconnect"],
          ignoredPaths: [],
        },
      }).concat(socketMiddleware, sseMiddleware);
    },
    preloadedState,
  });
  // configure listeners using the provided defaults
  // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
  // setupListeners(store.dispatch)
  return store;
};

const store = makeStore();

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];

export default store;
