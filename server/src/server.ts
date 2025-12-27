import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import * as dotenv from "dotenv";
import express, { Response } from "express";
import helmet from "helmet";
import http from "http";
import mongoose, { Types } from "mongoose";
import path from "path";

import { resolvers, typeDefs } from "./graphql/schema.js";
import { HttpResponse } from "./graphql/utility-types.js";
import { authMiddleware } from "./middleware/check-auth.js";
import cloudinaryRoutes from "./routes/cloudinary.js";
import notificationRoutes from "./routes/notifications.js";
import {
  sendHeartbeat,
  SSE_PING_INTERVAL,
  SseClientsMap,
} from "./utils/sse.js";
import logger from "./utils/winston.js";

declare module "express-serve-static-core" {
  interface Request {
    isAuthenticated: boolean;
    userId: Types.ObjectId;
    userName: string;
    fullName: string;
    email: string;
    pfp: string;
    setupComplete: boolean;
  }
}

export interface AppContext {
  loggedInUserId: Types.ObjectId;
  res: Response;
  userSetupComplete: boolean;
}

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV === "production" ? "prod" : "dev"}`,
  ),
});

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER_URI}/${process.env.MONGODB_DBNAME}?retryWrites=true`;

cloudinary.config({
  cloud_name: process.env.CLOUDIANRY_CLOUD_NAME,
  api_key: process.env.CLOUDIANRY_API_KEY,
  api_secret: process.env.CLOUDIANRY_API_SECRET,
});

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer<AppContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  formatError(formattedError) {
    logger.error(formattedError);
    const errorResponse: HttpResponse = {
      success: false,
      code: formattedError.extensions?.code || 500,
      message: formattedError.message || "Something went wrong.",
    };
    if (
      formattedError.extensions?.code === ApolloServerErrorCode.BAD_USER_INPUT
    ) {
      errorResponse.code = 400;
      errorResponse.message = "Invalid value passed for a field.";
    }
    if (formattedError.extensions?.code === ApolloServerErrorCode.BAD_REQUEST) {
      errorResponse.code = 400;
      errorResponse.message = "An unexpected error occured before parsing.";
    }
    if (
      formattedError.extensions?.code ===
      ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED
    ) {
      errorResponse.code = 400;
      errorResponse.message =
        "Query doesn't match the schema. Try double-checking it.";
    }
    if (
      formattedError.extensions?.code ===
      ApolloServerErrorCode.GRAPHQL_PARSE_FAILED
    ) {
      errorResponse.code = 400;
      errorResponse.message =
        "Operation could not be completed due to incorrect syntax.";
    }
    if (
      formattedError.extensions?.code ===
      ApolloServerErrorCode.INTERNAL_SERVER_ERROR
    ) {
      errorResponse.code = 500;
    }
    return errorResponse;
  },
});

await server.start();

export const sseClients: SseClientsMap = new Map();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_APP_URI || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(authMiddleware);
app.use(cloudinaryRoutes);
app.use(notificationRoutes);

app.use(
  "/api",
  cors<cors.CorsRequest>({
    origin: process.env.CLIENT_APP_URI || "http://localhost:3000",
    credentials: true,
  }),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      return {
        userSetupComplete: req.setupComplete,
        loggedInUserId: req.userId,
        res,
      };
    },
  }),
);

const pingIntervalId = setInterval(
  sendHeartbeat.bind(null, sseClients),
  SSE_PING_INTERVAL,
);

process.on("SIGTERM", () => {
  clearInterval(pingIntervalId);
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("Connected to the database.");
    httpServer.listen({ port: process.env.PORT || 4000 });
  })
  .then(() => {
    logger.info(`Server is up and running on port ${process.env.PORT}.`);
  })
  .catch((err) => {
    logger.error("Error establishing the connection.", err);
  });
