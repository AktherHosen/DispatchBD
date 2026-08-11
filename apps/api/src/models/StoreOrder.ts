import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface IStoreOrder extends Document {
  workspaceId: mongoose.Types.ObjectId;
  storeConnectionId: mongoose.Types.ObjectId;
 wooCommerceId: number;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  total: number;
  currency: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeOrderSchema = new Schema<IStoreOrder>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    storeConnectionId: {
      type: Schema.Types.ObjectId,
      ref: "StoreConnection",
      required: true,
      index: true
    },
    wooCommerceId: {
      type: Number,
      required: true
    },
    orderNumber: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending"
    },
    customerName: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      default: ""
    },
    shippingAddress: {
      type: String,
      required: true
    },
    shippingCity: {
      type: String,
      default: ""
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],
    subtotal: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "BDT"
    },
    note: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

storeOrderSchema.index({ workspaceId: 1, storeConnectionId: 1 });
storeOrderSchema.index({ workspaceId: 1, status: 1 });

export const StoreOrder = mongoose.model<IStoreOrder>(
  "StoreOrder",
  storeOrderSchema
);
