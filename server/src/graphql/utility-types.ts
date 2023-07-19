import { Request } from "express";
import { Types } from "mongoose";

export interface HttpResponse {
  success: boolean;
  code: number | string | unknown;
  message: string;
  data?: object;
}

export interface AuthUserInfo extends Request {
  isAuthenticated: boolean;
  userId: Types.ObjectId;
  userName: string;
  fullName: string;
  email: string;
  pfp: string;
}
