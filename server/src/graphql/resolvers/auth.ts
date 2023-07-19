import { readFileSync } from "fs";
import { GraphQLError } from "graphql";
import validator from "validator";
import { HttpResponse } from "../utility-types";
import User, { UserType, Gender, AuthType } from "../../models/User";
import { Document } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";

const privateKey: string = readFileSync(
  path.join(path.resolve(), "private.key"),
  "utf-8"
);

export const authQueries = {
  credentialsLogin: async (_: any, { loginData }: any) => {
    const errors: { message: string }[] = [];
    if (!validator.isEmail(loginData.email)) {
      errors.push({ message: "Entered Email Address is invalid." });
    }
    if (errors.length > 0) {
      console.log(errors);
      throw new GraphQLError("Provided user input is invalid.", {
        extensions: {
          code: 422,
        },
      });
    }
    const user = await User.findOne({ email: loginData.email });
    if (!user) {
      throw new GraphQLError("Invalid Email or Password", {
        extensions: {
          code: 401,
        },
      });
    }
    const isEqual = await bcrypt.compare(
      loginData.password,
      <string>user.password
    );
    if (!isEqual) {
      throw new GraphQLError("Invalid Email or Password", {
        extensions: {
          code: 401,
        },
      });
    }
    const token = jwt.sign(
      {
        sub: user.id, // userId
        aud: user.userName, // userName
      },
      privateKey,
      { algorithm: "RS256", expiresIn: "15m" }
    );
    const response: HttpResponse = {
      success: true,
      code: 200,
      message: "User logged-in successfully.",
      data: {
        access_token: token,
        refresh_token: "REFRESH_TOKEN_PLACEHOLDER",
        exp: 15,
      },
    };
    return response.data;
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
    if (errors.length > 0) {
      console.log(errors);
      throw new GraphQLError("Provided user input is invalid.", {
        extensions: {
          code: 422,
        },
      });
    }
    const existingUser = await User.findOne({ email: signupData.email });
    if (existingUser) {
      throw new GraphQLError(
        "This email address is already registered with us.",
        {
          extensions: {
            code: 409,
          },
        }
      );
    } else {
      let generatedUsername: string = " ";
      let uniqueUsernameGenerated: boolean = false;
      do {
        generatedUsername = `${(<string>signupData.firstName)
          .substring(0, 5)
          .toLowerCase()}.${(<string>signupData.lastName)
          .substring(0, 5)
          .toLowerCase()}_${Math.floor(Math.random() * 1000)}`;
        const existingUsername = await User.findOne({
          userName: generatedUsername,
        });
        if (existingUsername === null) uniqueUsernameGenerated = true;
      } while (!uniqueUsernameGenerated);
      const hashedPassword = await bcrypt.hash(signupData.password, 10);
      const newUser = new User<UserType>({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        userName: generatedUsername,
        email: validator.normalizeEmail(signupData.email, {
          gmail_remove_dots: false,
        }) as string,
        password: hashedPassword,
        gender: Gender.MALE,
        dob: new Date(signupData.dob),
        authType: AuthType.EMAIL,
        privateAccount: false,
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
          password: "Unretrievable",
        },
      };
      return response.data;
    }
  },
};
