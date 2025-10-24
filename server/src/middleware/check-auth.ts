import { NextFunction, Response } from "express";

import { AuthUserInfo } from "../graphql/utility-types";
import User from "../models/User";
import { verifyJwt } from "../utils/jwt";

export const authMiddleware = async (
  req: AuthUserInfo,
  _: Response,
  next: NextFunction
) => {
  const cookie = req.get("cookie") || "";

  const accessToken = cookie
    .split("; ")
    .find((row) => row.startsWith("accessToken="))
    ?.split("=")[1];

  if (!accessToken) {
    req.isAuthenticated = false;
    return next();
  }

  const { valid, decoded } = verifyJwt(accessToken);
  if (!valid || !decoded || typeof decoded === "string") {
    req.isAuthenticated = false;
    return next();
  }
  const setupComplete = decoded.setupComplete;
  const user = await User.findById(decoded.sub); // userId
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
  req.setupComplete = setupComplete;
  next();
};
