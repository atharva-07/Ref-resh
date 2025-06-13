import { model, Schema, Types } from "mongoose";

export interface MessageType {
  chatId: Types.ObjectId;
  content: string;
  sender: Types.ObjectId;
}

const messageSchema: Schema = new Schema<MessageType>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    content: {
      type: Schema.Types.String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Message = model<MessageType>("Message", messageSchema);

export default Message;
