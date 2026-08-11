import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type RiskLevel = "low" | "medium" | "high" | "unchecked";

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
  internalNotes: Array<{ text: string; author: string; createdAt: Date }>;
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: {
    phoneReturnCount: number;
    zoneRtoRate: number;
    orderValueDeviation: number;
  };
  shippingCost: number;
  heldAt?: Date;
  releasedAt?: Date;
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
    },
    internalNotes: [
      {
        text: { type: String, required: true },
        author: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "unchecked"],
      default: "unchecked"
    },
    riskScore: {
      type: Number,
      default: 0
    },
    riskFactors: {
      phoneReturnCount: { type: Number, default: 0 },
      zoneRtoRate: { type: Number, default: 0 },
      orderValueDeviation: { type: Number, default: 0 }
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    heldAt: {
      type: Date
    },
    releasedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

storeOrderSchema.index({ workspaceId: 1, storeConnectionId: 1 });
storeOrderSchema.index({ workspaceId: 1, status: 1 });
storeOrderSchema.index({ workspaceId: 1, riskLevel: 1 });
storeOrderSchema.index({ workspaceId: 1, heldAt: 1 }, { sparse: true });

export const StoreOrder = mongoose.model<IStoreOrder>(
  "StoreOrder",
  storeOrderSchema
);
