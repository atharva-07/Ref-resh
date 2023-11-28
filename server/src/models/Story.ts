import { model, Schema, Types } from "mongoose";

interface StoryType {
  image: string;
  caption?: string;
  author: Types.ObjectId;
}

const storySchema: Schema = new Schema<StoryType>(
  {
    image: {
      type: Schema.Types.String,
      required: true,
    },
    caption: Schema.Types.String,
    author: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Story = model<StoryType>("Story", storySchema);

export default Story;
