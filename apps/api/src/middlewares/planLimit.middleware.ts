import { Response, NextFunction } from "express";
import { Subscription } from "../models/Subscription";
import { Plan } from "../models/Subscription";
import { StoreConnection } from "../models/StoreConnection";
import { StoreOrder } from "../models/StoreOrder";
import { WorkspaceAuthRequest } from "./workspace.middleware";

export async function checkPlanLimits(
  req: WorkspaceAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const subscription = await Subscription.findOne({
      workspaceId: req.workspaceId,
      status: "active"
    }).populate("planId");

    if (!subscription) {
      // No subscription = free plan limits
      const plan = await Plan.findOne({ tier: "free" });
      if (!plan) {
        res.status(500).json({ message: "Free plan not found" });
        return;
      }
      (req as any).planLimits = plan.limits;
      (req as any).subscription = null;
      next();
      return;
    }

    const plan = await Plan.findById(subscription.planId);
    if (!plan) {
      res.status(500).json({ message: "Plan not found" });
      return;
    }

    (req as any).planLimits = plan.limits;
    (req as any).subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function enforceStoreLimit(
  req: WorkspaceAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const limits = (req as any).planLimits;
  if (!limits) {
    next();
    return;
  }

  const storeCount = await StoreConnection.countDocuments({
    workspaceId: req.workspaceId
  });

  if (storeCount >= limits.stores) {
    res.status(403).json({
      message: `Store limit reached. Your ${limits.stores === 999 ? "current" : ""} plan allows ${limits.stores} store(s). Upgrade to add more.`,
      limit: limits.stores,
      current: storeCount
    });
    return;
  }

  next();
}

export async function enforceOrderLimit(
  req: WorkspaceAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const limits = (req as any).planLimits;
  if (!limits || limits.ordersPerMonth === 999999) {
    next();
    return;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const orderCount = await StoreOrder.countDocuments({
    workspaceId: req.workspaceId,
    createdAt: { $gte: startOfMonth }
  });

  if (orderCount >= limits.ordersPerMonth) {
    res.status(403).json({
      message: `Monthly order limit reached. Your plan allows ${limits.ordersPerMonth} orders/month. Upgrade for more.`,
      limit: limits.ordersPerMonth,
      current: orderCount
    });
    return;
  }

  next();
}
