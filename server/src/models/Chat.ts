import { model, Schema, Types } from "mongoose";

export interface ChatType {
  chatName?: string;
  members: Types.Array<Types.ObjectId>;
  lastMessage?: {
    content: string;
    sender: Types.ObjectId;
    createdAt: Date;
  };
}

const chatSchema: Schema = new Schema<ChatType>(
  {
    chatName: {
      type: Schema.Types.String,
    },
    members: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: "User",
    },
    lastMessage: {
      content: { type: Schema.Types.String, required: true },
      sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

const Chat = model<ChatType>("Chat", chatSchema);

export default Chat;
