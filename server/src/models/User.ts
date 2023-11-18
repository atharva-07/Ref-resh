import { Schema, Types, model } from "mongoose";

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum AuthType {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  META = "META",
}

export interface UserType {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password?: string;
  gender: Gender;
  dob: Date;
  privateAccount: boolean;
  joinedDate: Date;
  pfpPath?: string;
  bannerPath?: string;
  bio?: string;
  followers?: Types.Array<Types.ObjectId>;
  following?: Types.Array<Types.ObjectId>;
  followingRequests?: Types.Array<Types.ObjectId>;
  blockedAccounts?: Types.Array<Types.ObjectId>;
  posts?: Types.Array<Types.ObjectId>;
  savedPosts?: Types.Array<Types.ObjectId>;
  activeStories?: Types.Array<Types.ObjectId>;
  authType: AuthType;
  lastLogin?: Date;
}

const userSchema: Schema = new Schema<UserType>(
  {
    firstName: { type: Schema.Types.String, require: true, maxlength: 26 },
    lastName: { type: Schema.Types.String, require: true, maxlength: 26 },
    userName: {
      type: Schema.Types.String,
      require: true,
      minlength: 6,
      maxlength: 30,
      lowercase: true,
      /*
        Minimum 6 and maximum 30 characters
        can have lowercase characters, numbers, underscore [_] and dot [.] only
        can only start with lowercase characters or underscore
      */
      match: RegExp("^[a-z_][a-z0-9_.]{6,30}$"),
    },
    email: {
      type: Schema.Types.String,
      require: true,
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
    gender: { type: Schema.Types.String, enum: Gender, require: true },
    dob: { type: Schema.Types.Date, required: true },
    privateAccount: {
      type: Schema.Types.Boolean,
      default: false,
      require: true,
    },
    joinedDate: { type: Schema.Types.Date, default: new Date(), require: true },
    pfpPath: {
      type: Schema.Types.String,
      default: "",
    },
    bannerPath: {
      type: Schema.Types.String,
      default: "",
    },
    bio: { type: Schema.Types.String, maxlength: 50 },
    followers: { type: [Schema.Types.ObjectId], ref: "User" },
    following: { type: [Schema.Types.ObjectId], ref: "User" },
    followingRequests: { type: [Schema.Types.ObjectId], ref: "User" },
    blockedAccounts: [Schema.Types.ObjectId],
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    activeStories: [{ type: Schema.Types.ObjectId, ref: "Story" }],
    authType: { type: Schema.Types.String, enum: AuthType, require: true },
    lastLogin: Schema.Types.Date,
  },
  {
    timestamps: true,
  }
);

const User = model<UserType>("User", userSchema);

export default User;
