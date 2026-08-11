import mongoose, { Document, Schema } from "mongoose";

export interface IStoreConnection extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  platform: "woocommerce";
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  status: "active" | "inactive" | "error";
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storeConnectionSchema = new Schema<IStoreConnection>(
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
    platform: {
      type: String,
      enum: ["woocommerce"],
      default: "woocommerce"
    },
    storeUrl: {
      type: String,
      required: true
    },
    consumerKey: {
      type: String,
      required: true
    },
    consumerSecret: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "inactive"
    },
    lastSyncAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const StoreConnection = mongoose.model<IStoreConnection>(
  "StoreConnection",
  storeConnectionSchema
);
