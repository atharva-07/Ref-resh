import { Schema, Types, model } from "mongoose";

export interface CommentType {
  content: string;
  edited?: boolean;
  commenter: Types.ObjectId;
  post: Types.ObjectId;
  likes?: Types.Array<Types.ObjectId>;
  parentComment?: Types.ObjectId;
}

const commmentSchema: Schema = new Schema<CommentType>(
  {
    content: {
      type: Schema.Types.String,
      required: true,
      maxlength: 500,
    },
    edited: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    commenter: {
      type: Schema.Types.ObjectId,
      required: true,
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
      required: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = model<CommentType>("Comment", commmentSchema);

export default Comment;
