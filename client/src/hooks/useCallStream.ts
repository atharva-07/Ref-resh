import { useEffect, useState } from "react";

import { mediaStreamStore } from "@/services/stream-store";

export function useCallStreams() {
  const [streams, setStreams] = useState(mediaStreamStore.getStreams());

  useEffect(() => {
    const handleStoreChange = () => {
      setStreams(mediaStreamStore.getStreams());
    };

    const unsubscribe = mediaStreamStore.subscribe(handleStoreChange);

    return () => {
      unsubscribe();
    };
  }, []);

  return streams;
}
