import mongoose, { Document, Schema } from "mongoose";

export type PlanTier = "free" | "pro" | "enterprise";

export interface IPlan extends Document {
  name: string;
  tier: PlanTier;
  price: number;
  limits: {
    stores: number;
    ordersPerMonth: number;
    fraudChecksPerMonth: number;
    moderators: number;
    apiAccess: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    tier: { type: String, enum: ["free", "pro", "enterprise"], required: true },
    price: { type: Number, required: true },
    limits: {
      stores: { type: Number, required: true },
      ordersPerMonth: { type: Number, required: true },
      fraudChecksPerMonth: { type: Number, required: true },
      moderators: { type: Number, required: true },
      apiAccess: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export const Plan = mongoose.model<IPlan>("Plan", planSchema);

export interface ISubscription extends Document {
  workspaceId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: "active" | "cancelled" | "expired";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      unique: true
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active"
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
