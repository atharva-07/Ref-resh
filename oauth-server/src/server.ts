import bodyParser from "body-parser";
// import { RedisStore } from "connect-redis";
import cors from "cors";
import * as dotenv from "dotenv";
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import session from "express-session";
import http from "http";
import mongoose, { Types } from "mongoose";

// import { createClient } from "redis";
import facebookRoutes from "./routes/facebook";
import googleRoutes from "./routes/google";
import { handleAccessTokenRefresh, verifyActiveSession } from "./utils/common";
import logger from "./utils/winston";

dotenv.config();

declare module "express-session" {
  interface SessionData {
    state: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    userId: Types.ObjectId;
    username: string;
    fullName: string;
    pfpPath: string;
  }
}

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER_URI}/${process.env.MONGODB_DBNAME}?retryWrites=true`;

const app = express();
const httpServer = http.createServer(app);

// const redisClient = createClient();
// await redisClient.connect();

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(
  session({
    // store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

app.use(googleRoutes);

app.use(facebookRoutes);

app.use("/api/auth/me", verifyActiveSession);

app.post("/api/refresh-token", handleAccessTokenRefresh);

app.use(
  (error: ErrorRequestHandler, _: Request, res: Response, __: NextFunction) => {
    logger.error(`Caught in Global Error Handler: ${error}`);
    res.status(500).send("Internal Server Error.");
  },
);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("Connected to the database.");
    httpServer.listen({ port: process.env.DEV_PORT || 8000 });
  })
  .then(() => {
    logger.info(`Server is up and running on port ${process.env.DEV_PORT}.`);
  })
  .catch((err) => {
    logger.error(`Error establishing the database connection. Error: ${err}`);
  });
