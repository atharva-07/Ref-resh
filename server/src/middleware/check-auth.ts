import { NextFunction, Response } from "express";
import { readFileSync } from "fs";
import jwt from "jsonwebtoken";
import path from "path";

import { AuthUserInfo } from "../graphql/utility-types";
import User from "../models/User";

const publickKey: string = readFileSync(
  path.join(path.resolve(), "public.key"),
  "utf-8"
);

export const authMiddleware = async (
  req: AuthUserInfo,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuthenticated = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, publickKey);
  } catch (err) {
    req.isAuthenticated = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuthenticated = false;
    return next();
  }
  const user = await User.findById(decodedToken.sub); // userId
  if (!user) {
    req.isAuthenticated = false;
    return next();
  }
  req.isAuthenticated = true;
  req.userId = user.id;
  req.userName = user.userName;
  req.fullName = `${user.firstName} ${user.lastName}`;
  req.email = user.email;
  req.pfp = user.pfpPath || "";
  next();
};
