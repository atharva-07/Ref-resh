import { model, Schema, Types } from "mongoose";

import Comment from "./Comment";

export interface PostType {
  content: string;
  images?: string[];
  likes?: Types.Array<Types.ObjectId>;
  commentsCount?: number;
  bookmarks?: Types.Array<Types.ObjectId>;
  edited?: boolean;
  author: Types.ObjectId;
}

const postSchema: Schema = new Schema<PostType>(
  {
    content: {
      type: Schema.Types.String,
      required: true,
      maxlength: 500,
    },
    images: [Schema.Types.String],
    likes: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    commentsCount: { type: Schema.Types.Number, default: 0 },
    bookmarks: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    edited: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

postSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const postId = this._id;
      await Comment.deleteMany({ post: postId });
      next();
    } catch (error) {
      next(error as Error);
    }
  }
);

postSchema.pre("findOneAndDelete", async function (next) {
  try {
    const postId = this.getQuery()._id;
    await Comment.deleteMany({ post: postId });
    next();
  } catch (error) {
    next(error as Error);
  }
});

const Post = model<PostType>("Post", postSchema);

export default Post;
