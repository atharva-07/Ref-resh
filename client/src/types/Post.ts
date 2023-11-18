export interface PostType {
  content: string;
  images?: string[];
  likes?: string[]; // Types.Array<Types.ObjectId>;
  commentsCount?: number;
  edited?: boolean;
  author: string[]; // Types.ObjectId;
}
