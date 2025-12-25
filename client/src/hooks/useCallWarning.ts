import { useEffect } from "react";

import { useAppSelector } from "./useAppSelector";

type BeforeUnloadEventHandler = (
  event: BeforeUnloadEvent,
) => string | undefined;

export function useCallWarning() {
  const callStatus = useAppSelector(
    (state) => state.call.activeCall?.callStatus,
  );

  useEffect(() => {
    // We only care about statuses where the user is actively communicating
    const isActiveCall =
      callStatus === "connecting" || callStatus === "connected";

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

    if (isActiveCall) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [callStatus]);
}
