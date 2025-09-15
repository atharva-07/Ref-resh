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
import { GraphQLError } from "graphql";
import http from "http";
import mongoose, { Types } from "mongoose";

import { resolvers, typeDefs } from "./graphql/schema";
import { HttpResponse } from "./graphql/utility-types";
import { authMiddleware } from "./middleware/check-auth";
import imageUploadMiddleware from "./middleware/image-upload";
import {
  CL_BANNER_FOLDER,
  CL_PFP_FOLDER,
  CL_POST_FOLDER,
  uploadMultipleFiles,
  uploadSingleFile,
} from "./utils/cloudinary";

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
  res: Response;
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
    console.error("GraphQL Error:", formattedError, error);
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

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(authMiddleware);

app.post(
  "/api/upload/post",
  imageUploadMiddleware.array("images", 4),
  async (req, res, next) => {
    try {
      if (!req.isAuthenticated) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: 401,
          },
        });
      }

      const imageFiles = req.files as Express.Multer.File[];

      let imagesUrls = null;
      if (imageFiles) {
        imagesUrls = await uploadMultipleFiles(imageFiles, CL_POST_FOLDER);
      }

      const result = {
        imagesUrls,
      };

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

app.post(
  "/api/upload/profile",
  imageUploadMiddleware.fields([
    { name: "pfpPath", maxCount: 1 },
    { name: "bannerPath", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      if (!req.isAuthenticated) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: 401,
          },
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const profilePictureFile = files?.pfpPath ? files.pfpPath[0] : null;
      const bannerPictureFile = files?.bannerPath ? files.bannerPath[0] : null;

      let pfpUrl = null;
      let bannerUrl = null;

      if (profilePictureFile) {
        pfpUrl = await uploadSingleFile(profilePictureFile, CL_PFP_FOLDER);
      }

      if (bannerPictureFile) {
        bannerUrl = await uploadSingleFile(bannerPictureFile, CL_BANNER_FOLDER);
      }

      const result = {
        pfpUrl,
        bannerUrl,
      };

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

app.use(
  "/api",
  cors<cors.CorsRequest>({
    origin: "http://localhost:3000",
    credentials: true,
  }),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      return {
        loggedInUserId: req.userId,
        res,
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
    console.log(`Server is up and running on port ${process.env.DEV_PORT}`);
  })
  .catch((err) => {
    console.log("Error establishing the connection.", err);
  });
