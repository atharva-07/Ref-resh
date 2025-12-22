import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { JwtPayload } from "jsonwebtoken";
import { Document, ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";

import User, { AuthType, Gender, UserType } from "../../models/User";
import { AppContext } from "../../server";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../utils/common";
import {
  createAccessToken,
  createRefreshToken,
  signJwt,
  verifyJwt,
} from "../../utils/jwt";
import { sendEmail } from "../../utils/mail";
import logger from "../../utils/winston";
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
        422,
      );
    try {
      const user = await User.findOne({ email: loginData.email });
      if (!user) throw newGqlError(`Invalid Email or Password.`, 401);

      // TODO: Should we allow the login or not? Also, check if the responseCode is correct.
      // Leaving it for now as it's not very straight-forward to implement.
      if (user.authType !== AuthType.EMAIL) {
        throw newGqlError(
          `This email address is registered with a different login method. Please login with ${user.authType}.`,
          403,
        );
      }

      const isEqual = await bcrypt.compare(
        loginData.password,
        <string>user.password,
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
        message: `User (${user.id}) logged-in successfully.`,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          userId: user.id,
          fullName: user.firstName + " " + user.lastName,
          username: user.userName,
          pfpPath: user.pfpPath,
        },
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  forgotPassword: async (_: any, { email, userId }: any, ctx: AppContext) => {
    if (!email && userId) checkAuthorization(ctx.loggedInUserId);
    try {
      if ((email && userId) || (!email && !userId))
        throw newGqlError("Please provide either Email or UserId.", 422);

      let user: (Document & UserType) | null = null;
      if (email && !userId) {
        if (!validator.isEmail(email))
          throw newGqlError("Entered Email Address is invalid.", 422);

        user = await User.findOne(
          { email: email },
          {
            userName: 1,
            email: 1,
          },
        );
      } else if (!email && userId) {
        user = await User.findById(new ObjectId(userId), {
          userName: 1,
          email: 1,
        });
      }

      if (!user) throw newGqlError("User not found.", 404);

      if (user.authType !== AuthType.EMAIL) {
        throw newGqlError(
          `Password reset is not available for ${user.authType} accounts.`,
          403,
        );
      }

      let nonce: string;
      if (user) {
        randomBytes(64, async (err, buffer) => {
          if (err) {
            throw newGqlError(
              "Could not process your request. Please try again.",
              500,
            );
          }
          nonce = buffer.toString("hex");
          user.passwordReset = {
            token: nonce,
            expiresAt: new Date(Date.now() + 900000), // 15 minutes
          };
          await user.save();

          const token = signJwt(
            {
              sub: user.id,
              aud: user.userName,
              jti: nonce,
              purpose: "password-reset",
            },
            {
              expiresIn: "15m",
            },
          );

          const passwordResetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

          await sendEmail(
            user.email,
            "Password Reset Request",
            `
            <h1>Password Reset Instructions</h1>
            <p>Click this <a href=${passwordResetLink}>link</a> to reset your password.
            <p>Please note that this link is only valid for 15 minutes.</p>
            `,
          );
        });
      }

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: user
          ? `Password reset email sent to the user (${user.email}).`
          : `Password reset email not sent as the user does not exist.`,
        data: true,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  me: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const user = await User.findById(new ObjectId(ctx.loggedInUserId))
        .select(
          "_id firstName lastName userName pfpPath bannerPath bio gender dob",
        )
        .lean();

      if (!user) throw newGqlError("User not found.", 404);

      const response: HttpResponse = {
        code: 200,
        success: true,
        message: `User (${user._id}) 'me' status loaded.`,
        data: {
          user: user,
          setupComplete: ctx.userSetupComplete,
        },
      };

      logger.info(response.message);

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
      validator.isEmpty(signupData.password) ||
      validator.isEmpty(signupData.confirmPassword)
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
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/gm,
      ) ||
      !validator.matches(
        signupData.confirmPassword,
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/gm,
      )
    ) {
      errors.push({
        message:
          "Password should be minimum 8 and maximum 20 characters. Have at least one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }
    if (signupData.password !== signupData.confirmPassword) {
      errors.push({
        message: "Password and Confirm Password do not match.",
      });
    }
    if (!Object.values(Gender).includes(signupData.gender as Gender)) {
      errors.push({
        message: "Gender not specified.",
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
        422,
      );
    try {
      const existingUser = await User.findOne({ email: signupData.email });
      if (existingUser) {
        throw newGqlError(
          "This email address is already registered with us.",
          409,
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
          message: `User (${result.id}) successfully created.`,
          data: result.id,
        };

        logger.info(response.message);

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
      if (!user) throw newGqlError("User not found.", 404);
      user.refreshToken = undefined;
      await user!.save();

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: `User (${user.id}) logged-out successfully.`,
        data: user.id,
      };

      ctx.res.clearCookie("accessToken");
      ctx.res.clearCookie("refreshToken");

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  changePassword: async (_: any, { passwordResetData }: any) => {
    const errors: { message: string }[] = [];
    if (
      validator.isEmpty(passwordResetData.password) ||
      validator.isEmpty(passwordResetData.confirmPassword)
    ) {
      errors.push({
        message: "Password cannot be empty.",
      });
    }
    if (
      !validator.matches(
        passwordResetData.password,
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/gm,
      ) ||
      !validator.matches(
        passwordResetData.confirmPassword,
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/gm,
      )
    ) {
      errors.push({
        message:
          "Password should be minimum 8 and maximum 20 characters. Have at least one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }
    if (passwordResetData.password !== passwordResetData.confirmPassword) {
      errors.push({
        message: "Password and Confirm Password do not match.",
      });
    }
    if (errors.length > 0)
      throw newGqlError(
        `Provided user input is invalid. ${errors[0].message}`,
        422,
      );
    try {
      const { valid, expired, decoded } = verifyJwt(
        passwordResetData.token,
      ) as JwtPayload;

      if (
        !valid ||
        expired ||
        !decoded ||
        decoded.purpose !== "password-reset"
      ) {
        throw newGqlError(
          "The password reset link is invalid or expired.",
          401,
        );
      }

      const user = await User.findById(decoded.sub);

      if (!user) throw newGqlError("User not found.", 404);

      if (user.authType !== AuthType.EMAIL) {
        throw newGqlError(
          `Password reset is not available for ${user.authType} accounts.`,
          403,
        );
      }

      if (user.passwordReset?.token !== decoded.jti) {
        throw newGqlError(
          "The password reset link is invalid or expired.",
          401,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      if (user.passwordReset?.expiresAt! < new Date()) {
        user.passwordReset = undefined;
        await user.save();
        throw newGqlError("The password reset link is expired.", 401);
      }

      const hashedPassword = await bcrypt.hash(passwordResetData.password, 10);
      user.password = hashedPassword;
      user.passwordReset = undefined;
      await user.save();

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: `Password changed successfully for user (${user.id}).`,
        data: user.id,
      };

      logger.info(response.message);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
