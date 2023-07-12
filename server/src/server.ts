import * as dotenv from "dotenv";
import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { typeDefs, resolvers } from "./graphql/schema";
import mongoose from "mongoose";

interface MyContext {
  token?: string;
}

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER_URI}/${process.env.MONGODB_DBNAME}?retryWrites=true`;

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/",
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
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
