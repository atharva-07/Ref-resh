import { Schema, Types, model } from "mongoose";

interface ChatType {
  members: Types.Array<Types.ObjectId>;
}

const chatSchema: Schema = new Schema<ChatType>(
  {
    members: {
      type: [Schema.Types.ObjectId],
      required: true,
    },
  },
  { timestamps: true }
);

const Chat = model<ChatType>("Chat", chatSchema);

export default Chat;
