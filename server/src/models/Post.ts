import { Schema, Types, model } from "mongoose";

interface PostType {
  content: string;
  images?: string[];
  likes?: Types.Array<Types.ObjectId>;
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
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Post = model<PostType>("Post", postSchema);

export default Post;
