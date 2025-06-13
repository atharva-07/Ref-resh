import { model, Schema, Types } from "mongoose";

export enum NotificationEvents {
  LIKED_POST = "LP",
  LIKED_COMMENT = "LC",
  COMMENTED_ON_POST = "COP",
  REPLIED_TO_COMMENT = "RTC",
  FOLLOW_REQUEST_RECEIVED = "FRR",
  FOLLOW_REQUEST_ACCEPTED = "FRA",
}

export interface NotificationType {
  eventType: NotificationEvents;
  publisher: Types.ObjectId;
  subscriber: Types.ObjectId;
  redirectionURL: string;
}

const notificationSchema: Schema = new Schema<NotificationType>(
  {
    eventType: {
      type: Schema.Types.String,
      enum: NotificationEvents,
      required: true,
    },
    publisher: { type: Schema.Types.ObjectId, required: true },
    subscriber: { type: Schema.Types.ObjectId, required: true },
    redirectionURL: { type: Schema.Types.String, required: true },
  },
  {
    timestamps: true,
  }
);

const Notification = model<NotificationType>(
  "Notification",
  notificationSchema
);

export default Notification;
