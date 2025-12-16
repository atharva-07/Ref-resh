// src/hooks/useCallWarning.ts

import { useEffect } from "react";

import { useAppSelector } from "./useAppSelector";

// Type definition for the required event handler
type BeforeUnloadEventHandler = (
  event: BeforeUnloadEvent
) => string | undefined;

export function useCallWarning() {
  // 1. Get the current call status from Redux
  const callStatus = useAppSelector(
    (state) => state.call.activeCall?.callStatus
  );

  useEffect(() => {
    // We only care about statuses where the user is actively communicating
    const isActiveCall =
      callStatus === "connecting" || callStatus === "connected";

    // 2. Define the event handler function
    const handleBeforeUnload: BeforeUnloadEventHandler = (event) => {
      if (isActiveCall) {
        // Standard browser behavior: setting returnValue triggers the confirmation dialog.
        // NOTE: Modern browsers DO NOT let you customize the message shown to the user.
        // They will display a generic message like "Changes you made may not be saved."
        const message =
          "You are currently in an active call. Reloading or navigating away will disconnect the call.";

        event.returnValue = message;
        return message;
      }
      // If not in a call, return undefined to allow navigation
      return undefined;
    };

    // 3. Attach the listener if the call is active, or detach/noop if idle
    if (isActiveCall) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    // 4. Cleanup function: runs when the component unmounts or dependencies change
    return () => {
      // Ensure the listener is always removed to prevent memory leaks or stale checks
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [callStatus]); // Re-run effect whenever the call status changes
}
