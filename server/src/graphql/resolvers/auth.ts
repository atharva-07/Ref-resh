import bcrypt from "bcrypt";
import { Document } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";

import User, { AuthType, UserType } from "../../models/User";
import { AppContext } from "../../server";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../utils/common";
import { createAccessToken, createRefreshToken } from "../../utils/jwt";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";

export const authQueries = {
  credentialsLogin: async (_: any, { loginData }: any, ctx: AppContext) => {
    const errors: { message: string }[] = [];
    if (!validator.isEmail(loginData.email))
      errors.push({ message: "Entered Email Address is invalid." });
    if (errors.length > 0)
      throw newGqlError(
        `Provided user input is invalid. ${errors[0].message}`,
        422
      );
    try {
      const user = await User.findOne({ email: loginData.email });
      if (!user) throw newGqlError(`Invalid Email or Password.`, 401);

      // TODO: Should we allow the login or not? Also, check if the responseCode is correct.
      // Leaving it for now as it's not very straight-forward to implement.
      if (user.authType !== AuthType.EMAIL) {
        throw newGqlError(
          `This email address is registered with a different login method. Please login with ${user.authType}.`,
          403
        );
      }

      const isEqual = await bcrypt.compare(
        loginData.password,
        <string>user.password
      );
      if (!isEqual) throw newGqlError("Invalid Email or Password.", 401);

      const accessToken = createAccessToken(user.id, user.userName);
      const refreshToken = createRefreshToken(user.id, user.userName);

      user.refreshToken = refreshToken;
      user.lastLoginAt = new Date();
      await user.save();

      ctx.res.cookie("accessToken", accessToken, accessTokenCookieOptions);
      ctx.res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User logged-in successfully.",
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          userId: user.id,
          fullName: user.firstName + " " + user.lastName,
          username: user.userName,
          pfpPath: user.pfpPath,
        },
      };

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const authMutations = {
  signup: async (_: any, { signupData }: any) => {
    const errors: { message: string }[] = [];
    if (
      validator.isEmpty(signupData.firstName) ||
      validator.isEmpty(signupData.lastName) ||
      validator.isEmpty(signupData.email) ||
      validator.isEmpty(signupData.password)
    ) {
      errors.push({
        message: "First Name, Last Name, Email and Password cannot be empty.",
      });
    }
    if (
      !validator.isAlpha(signupData.firstName) ||
      !validator.isAlpha(signupData.lastName) ||
      !validator.isLength(signupData.firstName, { max: 26 }) ||
      !validator.isLength(signupData.lastName, { max: 26 })
    ) {
      errors.push({
        message:
          "First Name and Last Name can only be alphabetical and maximum 26 characters long.",
      });
    }
    if (!validator.isEmail(signupData.email)) {
      errors.push({ message: "Entered email is invalid." });
    }
    if (
      !validator.matches(
        signupData.password,
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/gm
      )
    ) {
      errors.push({
        message:
          "Password should be minimum 8 and maximum 20 characters. Have at least one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }
    if (
      !validator.isDate(signupData.dob, {
        format: "YYYY/MM/DD",
        strictMode: true,
      })
    ) {
      errors.push({
        message: "Entered Date of Birth is not in correct format.",
      });
    }
    if (errors.length > 0)
      throw newGqlError(
        `Provided user input is invalid. ${errors[0].message}`,
        422
      );
    try {
      const existingUser = await User.findOne({ email: signupData.email });
      if (existingUser) {
        throw newGqlError(
          "This email address is already registered with us.",
          409
        );
      } else {
        const dateOfBirth = new Date(signupData.dob);
        dateOfBirth.setDate(dateOfBirth.getDate() + 1);
        const hashedPassword = await bcrypt.hash(signupData.password, 10);

        const newUser = new User<UserType>({
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          userName: uuidv4(),
          email: validator.normalizeEmail(signupData.email, {
            gmail_remove_dots: false,
          }) as string,
          password: hashedPassword,
          gender: signupData.gender,
          dob: dateOfBirth,
          authType: AuthType.EMAIL,
          joinedDate: new Date(),
        });
        const result: Document = await newUser.save();
        const response: HttpResponse = {
          success: true,
          code: 201,
          message: "User successfully created.",
          data: {
            _id: result.id,
            ...result._doc,
            password: null,
          },
        };
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },
  logout: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findById(ctx.loggedInUserId);
      user!.refreshToken = undefined;
      await user!.save();
      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "User logged-out successfully.",
        data: user!.id,
      };
      ctx.res.clearCookie("accessToken");
      ctx.res.clearCookie("refreshToken");
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
