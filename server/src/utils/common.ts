import { CookieOptions } from "express";

const isProd = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000, // 15 mins
  path: "/",
  httpOnly: true,
  secure: isProd ? true : false,
  sameSite: isProd ? "none" : "lax",
  domain: isProd ? `.${process.env.DOMAIN_NAME}` : "localhost",
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 6.048e8, // 7 days,
};
