import { NextFunction, Request, Response } from "express";

import User from "../src/models/User";
import { getAccessTokenFromCookie } from "../src/utils/common";
import { verifyJwt } from "../src/utils/jwt";
import logger from "../src/utils/winston";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Get token from HTTP-only cookie
  const token = getAccessTokenFromCookie(req);

  if (!token) {
    logger.error("Invalid Access Token.");
    const errors: { success: boolean; code: number; message: string }[] = [];
    const error = { success: false, code: 401, message: "Unauthorized" };
    errors.push(error);
    return res.status(401).send({ errors });
  }

  try {
    const { valid, expired, decoded } = verifyJwt(token);
    if (!valid || expired || !decoded) {
      return res.status(401).send({ error: "Invalid token" });
    }
    const user = await User.findById(decoded.sub); // userId
    req.userId = user?.id;
    req.fullName = `${user?.firstName} ${user?.lastName}`;
    req.username = user?.userName as string;
    req.pfpPath = user?.pfpPath as string;
    logger.debug("Valid Access Token.");
    next();
  } catch (err) {
    logger.error("Access Token was invalid.");
    return res.status(401).send({ error: "Invalid token" });
  }
};
