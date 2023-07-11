import { Schema, Types, model } from "mongoose";

interface CallType {
  caller: Types.ObjectId;
  receiver: Types.ObjectId;
  chat: Types.ObjectId;
  startTime: Date;
  endTime: Date;
}

const callSchema: Schema = new Schema<CallType>(
  {
    caller: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    startTime: {
      type: Schema.Types.Date,
      required: true,
    },
    endTime: {
      type: Schema.Types.Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Call = model<CallType>("Call", callSchema);

export default Call;
