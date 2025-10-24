import { readFileSync } from "fs";
import jwt from "jsonwebtoken";
import path from "path";

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/g;

const privateKey: string = readFileSync(
  path.join(path.resolve(), "private.key"),
  "utf-8"
);

const publicKey: string = readFileSync(
  path.join(path.resolve(), "public.key"),
  "utf-8"
);

export const signJwt = (
  object: object,
  options?: jwt.SignOptions | undefined
) => {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
};

export const verifyJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    console.error(e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
};

export const createAccessToken = (userId: string, userName: string) => {
  const accessToken = signJwt(
    {
      sub: userId,
      aud: userName,
      setupComplete: userName.match(UUID_REGEX) ? false : true,
    },
    {
      expiresIn: "15m",
    }
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
    }
  );

  return refreshToken;
};
