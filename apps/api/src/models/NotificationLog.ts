import mongoose, { Document, Schema } from "mongoose";

export type NotificationChannel = "telegram";

export interface INotificationLog extends Document {
  workspaceId: mongoose.Types.ObjectId;
  courierOrderId: mongoose.Types.ObjectId;
  channel: NotificationChannel;
  recipientType: "workspace_owner" | "workspace_chat";
  recipient: string;
  status: "sent" | "failed";
  payload: string;
  error?: string;
  sentAt: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    courierOrderId: {
      type: Schema.Types.ObjectId,
      ref: "CourierOrder",
      required: true,
      index: true
    },
    channel: {
      type: String,
      enum: ["telegram"],
      required: true
    },
    recipientType: {
      type: String,
      enum: ["workspace_owner", "workspace_chat"],
      required: true
    },
    recipient: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true
    },
    payload: {
      type: String,
      required: true
    },
    error: {
      type: String
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

notificationLogSchema.index({ workspaceId: 1, sentAt: -1 });

export const NotificationLog = mongoose.model<INotificationLog>(
  "NotificationLog",
  notificationLogSchema
);
