import { CookieOptions, NextFunction, Request, Response } from "express";
import { HydratedDocument } from "mongoose";

import User, { UserType } from "../models/User";
import {
  createAccessToken,
  createRefreshToken,
  signJwt,
  verifyJwt,
} from "./jwt";

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000, // 15 mins
  httpOnly: true,
  domain: "localhost",
  path: "/",
  sameSite: "lax",
  secure: false,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  // httpOnly: false, // TODO: FIXME (Should be HttpOnly)
  maxAge: 6.048e8, // 7 days
};

const getRefreshTokenFromCookie = (req: Request) => {
  const refreshToken = (req.headers["cookie"] as string)
    ?.split("; ")
    .find((row: any) => row.startsWith("refreshToken="))
    ?.split("=")[1];

  return refreshToken;
};

export const getAccessTokenFromCookie = (req: Request) => {
  const accessToken = (req.headers["cookie"] as string)
    ?.split("; ")
    .find((row: any) => row.startsWith("accessToken="))
    ?.split("=")[1];

  return accessToken;
};

export const handleTokenCreationAndRedirection = async (
  user: HydratedDocument<UserType>,
  res: Response
) => {
  const { id, userName } = user;

  const accessToken = createAccessToken(id, userName);
  const refreshToken = createRefreshToken(id, userName);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save();

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.redirect(process.env.CLIENT_APP_URI as string);
};

export const handleAccessTokenRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //const refreshToken = req.body.refreshToken;
  const refreshToken = getRefreshTokenFromCookie(req);

  if (!refreshToken) {
    return res.status(401).send("Invalid Refresh Token.");
  }

  try {
    const { valid, decoded } = verifyJwt(refreshToken);
    if (!valid || !decoded) {
      return res.status(401).send("Invalid Refresh Token.");
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).send("Invalid Refresh Token.");
    }

    if (refreshToken !== user.refreshToken) {
      return res.status(401).send("Invalid Refresh Token.");
    }

    const accessToken = createAccessToken(user.id, user.userName);

    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    res.status(200).send({ accessToken });
  } catch (error) {
    next(error);
  }
};

// export const verifyActiveSession = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   return res.status(200).send({
//     userId: req.userId,
//     fullName: req.fullName,
//     username: req.username,
//     pfpPath: req.pfpPath,
//   });
// };

// TODO: (FIXME) Insanely spaghetti code. Refactor this.
export const verifyActiveSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = getRefreshTokenFromCookie(req);

    if (!refreshToken) {
      return res.status(401).send("Invalid Refresh Token.");
    }

    let user: HydratedDocument<UserType> | null = null;

    const { valid: isRefreshTokenValid, decoded: decodedRefreshToken } =
      verifyJwt(refreshToken);
    if (!isRefreshTokenValid || !decodedRefreshToken) {
      return res.status(401).send("Invalid Refresh Token.");
    } else {
      user = await User.findById(decodedRefreshToken.sub); // userId

      if (!user) {
        return res.status(401).send("Invalid Refresh Token.");
      }

      if (refreshToken !== user.refreshToken) {
        return res.status(401).send("Invalid Refresh Token.");
      }
    }

    // Valid refresh token is present. So, set a new access token and return user data for redux state
    const accessToken = getAccessTokenFromCookie(req);
    if (accessToken) {
      const { valid, decoded } = verifyJwt(accessToken);
      if (!valid || !decoded) {
        const newAccessToken = createAccessToken(user.id, user.userName);
        res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
        return res.status(200).send({
          userId: user.id,
          fullName: `${user.firstName} ${user.lastName}`,
          username: user.userName,
          pfpPath: user.pfpPath || "",
        });
      } else {
        return res.status(200).send({
          userId: user.id,
          fullName: `${user.firstName} ${user.lastName}`,
          username: user.userName,
          pfpPath: user.pfpPath || "",
        });
      }
    } else {
      const accessToken = createAccessToken(user.id, user.userName);

      res.cookie("accessToken", accessToken, accessTokenCookieOptions);

      res.status(200).send({
        userId: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        username: user.userName,
        pfpPath: user.pfpPath || "",
      });
    }
  } catch (error) {
    next(error);
  }
};
