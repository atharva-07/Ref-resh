import { Request } from "express";
import { GraphQLResolveInfo } from "graphql";
import { HydratedDocument, Types } from "mongoose";

import { AppContext } from "../server";

export interface HttpResponse {
  success: boolean;
  code: number | string | unknown;
  message: string;
  data?: object | number | string | boolean;
}

export interface AuthUserInfo extends Request {
  isAuthenticated: boolean;
  userId: Types.ObjectId;
  userName: string;
  fullName: string;
  email: string;
  pfp: string;
  setupComplete: boolean;
}

export interface ResolverFn<Parent, Args, ReturnType> {
  (
    parent: Parent,
    args: Args,
    contextValue: AppContext | null,
    info: GraphQLResolveInfo
  ): Promise<HydratedDocument<ReturnType>>;
}
