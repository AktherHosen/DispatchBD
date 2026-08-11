import mongoose, { Document, Schema } from "mongoose";

export interface IFraudCheckLog extends Document {
  workspaceId: mongoose.Types.ObjectId;
  phone: string;
  riskLevel: "low" | "medium" | "high";
  totalOrders: number;
  successRate: number;
  checkedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const fraudCheckLogSchema = new Schema<IFraudCheckLog>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    phone: {
      type: String,
      required: true,
      index: true
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    checkedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const FraudCheckLog = mongoose.model<IFraudCheckLog>(
  "FraudCheckLog",
  fraudCheckLogSchema
);
