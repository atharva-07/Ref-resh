// src/hooks/useCallStreams.ts

import { useEffect, useState } from "react";

import { mediaStreamStore } from "@/services/stream-store";

/**
 * Custom hook to get and subscribe to real-time updates of call media streams.
 * Returns a Map<userId, MediaStream>.
 */
export function useCallStreams() {
  // 1. Initialize state with the current streams
  const [streams, setStreams] = useState(mediaStreamStore.getStreams());

  useEffect(() => {
    // 2. Define the subscription handler
    const handleStoreChange = () => {
      setStreams(mediaStreamStore.getStreams());
    };

    // 3. Subscribe to the external store and get the cleanup function
    const unsubscribe = mediaStreamStore.subscribe(handleStoreChange);

    // 4. Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return streams;
}
