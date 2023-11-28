import { model, Schema, Types } from "mongoose";

interface MessageType {
  chatId: Types.ObjectId;
  message: string;
  sender: Types.ObjectId;
}

const messageSchema: Schema = new Schema<MessageType>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: Schema.Types.String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = model<MessageType>("Message", messageSchema);

export default Message;
