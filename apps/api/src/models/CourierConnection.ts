import mongoose, { Document, Schema } from "mongoose";

export interface ICourierConnection extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  apiEndpoint: string;
  apiKey: string;
  apiSecret: string;
  status: "active" | "inactive" | "error";
  createdAt: Date;
  updatedAt: Date;
}

const courierConnectionSchema = new Schema<ICourierConnection>(
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
    apiEndpoint: {
      type: String,
      required: true
    },
    apiKey: {
      type: String,
      required: true
    },
    apiSecret: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "inactive"
    }
  },
  {
    timestamps: true
  }
);

export const CourierConnection = mongoose.model<ICourierConnection>(
  "CourierConnection",
  courierConnectionSchema
);
