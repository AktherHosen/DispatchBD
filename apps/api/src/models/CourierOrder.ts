import mongoose, { Document, Schema } from "mongoose";

export type CourierOrderStatus =
  | "pending"
  | "picked"
  | "in_transit"
  | "delivered"
  | "returned"
  | "cancelled";

export interface ICourierOrder extends Document {
  workspaceId: mongoose.Types.ObjectId;
  courierConnectionId: mongoose.Types.ObjectId;
  storeOrderId: mongoose.Types.ObjectId;
  consignmentId: string;
  status: CourierOrderStatus;
  amount: number;
  codAmount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courierOrderSchema = new Schema<ICourierOrder>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    courierConnectionId: {
      type: Schema.Types.ObjectId,
      ref: "CourierConnection",
      required: true
    },
    storeOrderId: {
      type: Schema.Types.ObjectId,
      ref: "StoreOrder",
      required: true
    },
    consignmentId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "picked", "in_transit", "delivered", "returned", "cancelled"],
      default: "pending"
    },
    amount: {
      type: Number,
      required: true
    },
    codAmount: {
      type: Number,
      default: 0
    },
    note: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const CourierOrder = mongoose.model<ICourierOrder>(
  "CourierOrder",
  courierOrderSchema
);
