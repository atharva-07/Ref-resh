import { Middleware } from "@reduxjs/toolkit";

import { sseSingleton } from "@/context/sse-singleton";

import { fetchUnreadNotifications } from "../notifications-slice";
import { RootState } from "../store";

export const sseActions = {
  connect: "sse/connect",
  disconnect: "sse/disconnect",
};

const createSseMiddleware = (): Middleware<object, RootState> => {
  const sseMiddleware: Middleware<object, RootState> =
    (store) => (next) => (action: any) => {
      const result = next(action);

      switch (action.type) {
        case sseActions.connect: {
          sseSingleton.connect(store.dispatch, action.payload.userId);
          console.log("SSE connected.");
          store.dispatch(fetchUnreadNotifications() as any);
          break;
        }

        case sseActions.disconnect:
          sseSingleton.disconnect();
          break;

        default:
          break;
      }

      return result;
    };

  return sseMiddleware;
};

export default createSseMiddleware;
