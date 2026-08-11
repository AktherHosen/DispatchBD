import mongoose, { Document, Schema } from "mongoose";

export interface INotificationSettings extends Document {
  workspaceId: mongoose.Types.ObjectId;
  telegram: {
    enabled: boolean;
    botToken?: string;
    chatId?: string;
    linkingCode?: string;
    linkedAt?: Date;
    notifyStatuses: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSettingsSchema = new Schema<INotificationSettings>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      unique: true
    },
    telegram: {
      enabled: { type: Boolean, default: false },
      botToken: { type: String },
      chatId: { type: String },
      linkingCode: { type: String },
      linkedAt: { type: Date },
      notifyStatuses: {
        type: [String],
        default: ["picked", "out_for_delivery", "delivered", "returned", "failed"]
      }
    }
  },
  {
    timestamps: true
  }
);

export const NotificationSettings = mongoose.model<INotificationSettings>(
  "NotificationSettings",
  notificationSettingsSchema
);
