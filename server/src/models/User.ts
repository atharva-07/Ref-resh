import { Schema, Types, model } from "mongoose";

enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

enum AuthType {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  META = "META",
}

interface UserType {
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
  authType?: AuthType;
  lastLogin?: Date;
}

const userSchema: Schema = new Schema<UserType>(
  {
    firstName: { type: Schema.Types.String, require: true, maxlength: 26 },
    lastName: { type: Schema.Types.String, require: true, maxlength: 26 },
    userName: { type: Schema.Types.String, require: true, maxlength: 20 },
    email: { type: Schema.Types.String, require: true, match: RegExp("") },
    password: {
      type: Schema.Types.String,
      minlength: 8,
      maxlength: 20,
      match: RegExp(""),
    },
    gender: { type: Schema.Types.String, enum: Gender, require: true },
    dob: { type: Schema.Types.Date, required: true },
    privateAccount: { type: Schema.Types.Boolean, require: true },
    joinedDate: { type: Schema.Types.Date, default: new Date(), require: true },
    pfpPath: Schema.Types.String,
    bannerPath: Schema.Types.String,
    bio: { type: Schema.Types.String, maxlength: 50 },
    followers: [Schema.Types.ObjectId],
    following: [Schema.Types.ObjectId],
    followingRequests: [Schema.Types.ObjectId],
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
