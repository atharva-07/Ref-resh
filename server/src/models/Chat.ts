import { model, Schema, Types } from "mongoose";

export interface ChatType {
  chatName?: string;
  members: Types.Array<Types.ObjectId>;
  lastMessage?: Types.ObjectId;
  lastSeen?: Map<
    string,
    {
      messageId: Types.ObjectId;
      timestamp: Date;
    }
  >;
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
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false,
      // validate: {
      //   validator: function (obj: any) {
      //     if (obj === undefined || obj === null) return true; // Object is optional
      //     // If object exists, check all required fields
      //     return (
      //       obj.id !== undefined &&
      //       obj.content !== undefined &&
      //       obj.sender !== undefined
      //     );
      //   },
      //   message:
      //     "When lastMessage is provided, all [id, content and sender] are required",
      // },
    },
    lastSeen: {
      type: Schema.Types.Map,
      of: new Schema({
        messageId: { type: Schema.Types.ObjectId, required: true },
        timestamp: { type: Date, default: Date.now },
      }),
      default: () =>
        new Map<
          string,
          {
            messageId: Types.ObjectId;
            timestamp: Date;
          }
        >(),
    },
  },
  { timestamps: true }
);

const Chat = model<ChatType>("Chat", chatSchema);

export default Chat;
