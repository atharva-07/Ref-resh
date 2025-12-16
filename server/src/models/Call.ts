import { model, Schema, Types } from "mongoose";

export interface CallType {
  chatId: Types.ObjectId;
  initiator: Types.ObjectId;
  acceptedAt?: Map<
    string,
    {
      timestamp: Date;
    }
  >;
  disconnectedAt?: Map<
    string,
    {
      timestamp: Date;
    }
  >;
}

const callSchema: Schema = new Schema<CallType>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Chat",
    },
    initiator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    acceptedAt: {
      type: Schema.Types.Map,
      of: new Schema({
        timestamp: { type: Date, default: Date.now },
      }),
      ref: "User",
      default: () =>
        new Map<
          string,
          {
            timestamp: Date;
          }
        >(),
    },
    disconnectedAt: {
      type: Schema.Types.Map,
      of: new Schema({
        timestamp: { type: Date, default: Date.now },
      }),
      ref: "User",
      default: () =>
        new Map<
          string,
          {
            timestamp: Date;
          }
        >(),
    },
  },
  { timestamps: true }
);

const Call = model<CallType>("Call", callSchema);

export default Call;
