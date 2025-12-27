import { Response } from "express";

import { BasicUserData } from "../graphql/resolvers/posts.js";
import { NotificationEvents } from "../models/Notification.js";
import logger from "./winston.js";

export const SSE_PING_INTERVAL = 30_000;

export interface SseClient {
  connectionId: number;
  res: Response;
}

export type SseClientsMap = Map<string, Set<SseClient>>;

export const sendHeartbeat = (sseClients: SseClientsMap) => {
  const HEARTBEAT_MESSAGE = ":keepalive\n\n";

  sseClients.forEach((connectionSet, key) => {
    connectionSet.forEach((connection) => {
      try {
        connection.res.write(HEARTBEAT_MESSAGE);
      } catch (error) {
        logger.warn(
          `Error sending ping to connection ${connection.connectionId}. Closing stream.`,
        );

        connectionSet.delete(connection);

        if (connectionSet.size === 0) {
          sseClients.delete(key);
        }
      }
    });
  });
};

export const findClientsByUserId = (
  sseClients: SseClientsMap,
  targetUserId: string,
) => {
  return sseClients.get(targetUserId) || new Set();
};

export const sendNotification = (
  _id: string,
  eventType: NotificationEvents,
  publisher: BasicUserData,
  subscriberId: string,
  sseClients: SseClientsMap,
) => {
  try {
    const targetClients = findClientsByUserId(sseClients, subscriberId);
    const payload = {
      _id,
      eventType,
      publisher,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };
    targetClients.forEach((client) => {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    });
  } catch (error) {
    logger.error("Could not send notification: ", error);
  }
};
