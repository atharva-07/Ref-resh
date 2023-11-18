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
  id: string;
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
  followers?: string[]; // Types.Array<Types.ObjectId>;
  following?: string[]; // Types.Array<Types.ObjectId>;
  followingRequests?: string[]; // Types.Array<Types.ObjectId>;
  blockedAccounts?: string[]; // Types.Array<Types.ObjectId>;
  posts?: string[]; // Types.Array<Types.ObjectId>;
  savedPosts?: string[]; // Types .Array<Types.ObjectId>;
  activeStories?: string[]; // Types.Array<Types.ObjectId>;
  authType: AuthType;
  lastLogin?: Date;
}
