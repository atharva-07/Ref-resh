import { model, Schema, Types } from "mongoose";

export interface CommentType {
  content: string;
  edited?: boolean;
  author: Types.ObjectId;
  post: Types.ObjectId;
  likes?: Types.Array<Types.ObjectId>;
  parentComment?: Types.ObjectId;
}

const commmentSchema: Schema = new Schema<CommentType>(
  {
    content: {
      type: Schema.Types.String,
      required: true,
      maxlength: 400,
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
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Comment",
    },
  },
  {
    timestamps: true,
  }
);

const Comment = model<CommentType>("Comment", commmentSchema);

export default Comment;
