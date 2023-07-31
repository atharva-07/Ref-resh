import { GraphQLError } from "graphql";
import { Types } from "mongoose";

export const checkAuthorization = (userId: Types.ObjectId) => {
  if (!userId) {
    throw new GraphQLError("Unauthorized", {
      extensions: {
        code: 401,
      },
    });
  }
};

export const newGqlError = (message: string, code: number): GraphQLError => {
  return new GraphQLError(message, {
    extensions: {
      code: code,
    },
  });
};
