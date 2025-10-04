import { Dispatch } from "@reduxjs/toolkit";
import { toast } from "sonner";

import { eventMessageMap } from "@/utility/constants";

const backendUrl =
  import.meta.env.VITE_NODE_SERVER_URI || "http://localhost:4000/api";

class SSEService {
  eventSource: EventSource | null;
  dispatch: Dispatch | null;
  url: string;

  constructor() {
    this.eventSource = null;
    this.dispatch = null;
    this.url = `${backendUrl}/notifications/stream`;
  }

  connect(dispatch: Dispatch, userId: string) {
    if (this.eventSource) {
      console.warn("SSE connection already exists for userId: ", userId);
      return;
    }

    this.dispatch = dispatch;

    this.eventSource = new EventSource(this.url, {
      withCredentials: true,
    });

    this.eventSource.onmessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        const { publisher } = payload;
        toast.info("You have a new notification.", {
          description: `${publisher.firstName} ${publisher.lastName} ${eventMessageMap.get(payload.eventType)}`,
        });
        this.dispatch!({ type: "sse/notification_received", payload });
      } catch (error) {
        console.error("Error parsing SSE message: ", error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error(
        "SSE Error occurred. Connection attempting to reconnect...",
        error
      );
      this.dispatch!({ type: "sse/connection_error", payload: error });
    };

    this.eventSource.onopen = () => {
      console.log("SSE connection opened successfully.");
      this.dispatch!({ type: "sse/connection_success" });
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.dispatch!({ type: "sse/connection_closed" });
      console.log("SSE connection closed.");
    }
  }
}

export const sseSingleton = new SSEService();
