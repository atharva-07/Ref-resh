import * as dotenv from "dotenv";
import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import bodyParser from "body-parser";
import { typeDefs, resolvers } from "./graphql/schema";
import mongoose, { Types } from "mongoose";
import { HttpResponse } from "./graphql/utility-types";
import { authMiddleware } from "./middleware/check-auth";

declare module "express-serve-static-core" {
  interface Request {
    isAuthenticated: boolean;
    userId: Types.ObjectId;
    userName: string;
    fullName: string;
    email: string;
    pfp: string;
  }
}

export interface AppContext {
  loggedInUserId: Types.ObjectId;
}

dotenv.config();

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
  formatError(formattedError, error) {
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

app.use(authMiddleware);

app.use(
  "/api",
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      return {
        loggedInUserId: req.userId,
      };
    },
  })
);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Database Connected.");
    httpServer.listen({ port: process.env.DEV_PORT || 4000 });
  })
  .then(() => {
    console.log(`Server is up and running at port ${process.env.DEV_PORT}`);
  })
  .catch((err) => {
    console.log("Error establishing the connection.", err);
  });
