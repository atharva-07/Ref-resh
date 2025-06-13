import { CookieOptions } from "express";

export const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000, // 15 mins
  httpOnly: true,
  domain: "localhost",
  path: "/",
  sameSite: "lax",
  secure: false,
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  // httpOnly: false, // TODO: FIXME (Should be HttpOnly)
  maxAge: 6.048e8, // 7 days,
};
