import { model, Schema, Types } from "mongoose";

export interface StoryType {
  image?: string;
  caption?: string;
  author: Types.ObjectId;
  seenBy?: Types.Array<Types.ObjectId>;
}

const storySchema: Schema = new Schema<StoryType>(
  {
    image: Schema.Types.String,
    caption: { type: Schema.Types.String, maxlength: 200 },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seenBy: { type: [Schema.Types.ObjectId], ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Story = model<StoryType>("Story", storySchema);

export default Story;
