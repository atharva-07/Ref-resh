import { readFileSync } from "fs";
import jwt from "jsonwebtoken";
import path from "path";

import logger from "./winston.js";

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/g;

let privateKey: string;
if (process.env.NODE_ENV === "production") {
  privateKey = process.env.PRIVATE_KEY || "";

  if (!privateKey) {
    throw new Error("ERROR: PRIVATE_KEY is not defined in the environment.");
  }
} else {
  privateKey = readFileSync(path.join(path.resolve(), "private.key"), "utf-8");
}

let publicKey: string;
if (process.env.NODE_ENV === "production") {
  publicKey = process.env.PUBLIC_KEY || "";

  if (!publicKey) {
    throw new Error("ERROR: PUBLIC_KEY is not defined in the environment.");
  }
} else {
  publicKey = readFileSync(path.join(path.resolve(), "public.key"), "utf-8");
}

export function signJwt(object: object, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    logger.error("JWT verification failed: ", e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}

export const createAccessToken = (userId: string, userName: string) => {
  const accessToken = signJwt(
    {
      sub: userId,
      aud: userName,
      setupComplete: userName.match(UUID_REGEX) ? false : true,
    },
    {
      expiresIn: "15m",
    },
  );

  return accessToken;
};

export const createRefreshToken = (userId: string, userName: string) => {
  const refreshToken = signJwt(
    {
      sub: userId,
      aud: userName,
    },
    {
      expiresIn: "7d",
    },
  );

  return refreshToken;
};
