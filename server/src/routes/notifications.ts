import { NextFunction, Request, Response, Router } from "express";

import { checkAuthorization } from "../graphql/utility-functions";
import { sseClients } from "../server";
import logger from "../utils/winston";

const router = Router();

router.get(
  "/api/notifications/stream",
  (req: Request, res: Response, next: NextFunction) => {
    checkAuthorization(req.userId);
    try {
      const userId = req.userId.toString();
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const connectionId = Date.now();

      const newConnection: { connectionId: number; res: Response } = {
        connectionId,
        res,
      };

      if (!sseClients.has(userId)) {
        sseClients.set(userId, new Set());
      }

      sseClients.get(userId)?.add(newConnection);
      logger.info(
        `User (${userId}) now has ${
          sseClients.get(userId)?.size
        } active connections.`,
      );

      res.write(
        `data: ${JSON.stringify({
          message: "Connected to notifications.",
        })}\n\n`,
      );

      req.on("close", () => {
        if (sseClients.has(userId)) {
          sseClients.get(userId)?.forEach((conn) => {
            if (conn.connectionId === connectionId) {
              sseClients.get(userId)?.delete(conn);
            }
          });

          if (sseClients.get(userId)?.size === 0) {
            sseClients.delete(userId);
          }
        }
        logger.info("SSE Client Disconnected.");
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
