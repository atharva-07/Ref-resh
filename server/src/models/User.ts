import { model, Schema, Types } from "mongoose";

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum AuthType {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
}

interface PasswordReset {
  token?: string;
  expiresAt?: Date;
}

export interface UserType {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password?: string;
  gender?: Gender;
  dob?: Date;
  privateAccount?: boolean;
  joinedDate: Date;
  pfpPath?: string;
  bannerPath?: string;
  bio?: string;
  followers?: Types.Array<Types.ObjectId>;
  following?: Types.Array<Types.ObjectId>;
  followingRequests?: Types.Array<Types.ObjectId>;
  blockedAccounts?: Types.Array<Types.ObjectId>;
  posts?: Types.Array<Types.ObjectId>;
  activeStories?: Types.Array<Types.ObjectId>;
  authType: AuthType;
  refreshToken?: string;
  lastLoginAt?: Date;
  readNotificationsAt?: Date;
  passwordReset?: PasswordReset;
}

const passwordResetSchema = new Schema<PasswordReset>(
  {
    token: Schema.Types.String,
    expiresAt: Schema.Types.Date,
  },
  { _id: false }
);

const userSchema: Schema = new Schema<UserType>(
  {
    firstName: { type: Schema.Types.String, required: true, maxlength: 26 },
    lastName: { type: Schema.Types.String, required: true, maxlength: 26 },
    userName: {
      type: Schema.Types.String,
      required: true,
      minlength: 6,
      maxlength: 18,
      lowercase: true,
      /*
        Minimum 6 and maximum 18 characters
        can have lowercase characters, numbers, underscore [_] and dot [.] only
        can only start with lowercase characters or underscore
      */
      // match: RegExp("^[a-z_][a-z0-9_.]{5,17}$"),
    },
    email: {
      type: Schema.Types.String,
      required: true,
      /*
        Using Regular Expressions for email validation is generally conisdered a bad idea.
        Just for simplicity's sake, a simple expression is being used.
        This is bound to fail with weird cases 
      */
      // match: RegExp("[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}"),
    },
    password: {
      type: Schema.Types.String,
      minlength: 8,
      maxlength: 72,
      /*
        Will be used in frontend.
        Minimum 8 and maximum 20 characters
        at least one uppercase letter, one lowercase letter, one number and one special character
      */
      // match:
      //   /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/gm,
    },
    gender: { type: Schema.Types.String, enum: Gender },
    dob: Schema.Types.Date,
    privateAccount: {
      type: Schema.Types.Boolean,
      default: false,
    },
    joinedDate: {
      type: Schema.Types.Date,
      default: new Date(),
      required: true,
    },
    pfpPath: {
      type: Schema.Types.String,
      default: "",
    },
    bannerPath: {
      type: Schema.Types.String,
      default: "",
    },
    bio: { type: Schema.Types.String, maxlength: 80 },
    followers: { type: [Schema.Types.ObjectId], ref: "User" },
    following: { type: [Schema.Types.ObjectId], ref: "User" },
    followingRequests: { type: [Schema.Types.ObjectId], ref: "User" },
    blockedAccounts: { type: [Schema.Types.ObjectId], ref: "User" },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    activeStories: [{ type: Schema.Types.ObjectId, ref: "Story" }],
    authType: { type: Schema.Types.String, enum: AuthType, required: true },
    refreshToken: Schema.Types.String,
    lastLoginAt: Schema.Types.Date,
    readNotificationsAt: Schema.Types.Date,
    passwordReset: passwordResetSchema,
  },
  {
    timestamps: true,
  }
);

const User = model<UserType>("User", userSchema);

export default User;

// 18/11/23: Default Image Path constants were removed.
