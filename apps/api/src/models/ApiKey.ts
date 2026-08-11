import mongoose, { Document, Schema } from "mongoose";

export interface IApiKey extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  key: string;
  secret: string;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    key: {
      type: String,
      required: true,
      unique: true
    },
    secret: {
      type: String,
      required: true
    },
    lastUsedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const ApiKey = mongoose.model<IApiKey>("ApiKey", apiKeySchema);
