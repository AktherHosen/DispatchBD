import { Response } from "express";
import { z } from "zod";
import { Plan, Subscription } from "../models/Subscription";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";

export async function listPlans(
  _req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json({ plans });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getSubscription(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const subscription = await Subscription.findOne({
      workspaceId: req.workspaceId
    }).populate("planId");

    if (!subscription) {
      // Return free plan as default
      const freePlan = await Plan.findOne({ tier: "free" });
      res.json({
        subscription: null,
        plan: freePlan
      });
      return;
    }

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

const upgradeSchema = z.object({
  planId: z.string()
});

export async function upgradePlan(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = upgradeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const plan = await Plan.findById(parsed.data.planId);
    if (!plan) {
      res.status(404).json({ message: "Plan not found" });
      return;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Update or create subscription
    const subscription = await Subscription.findOneAndUpdate(
      { workspaceId: req.workspaceId },
      {
        $set: {
          planId: plan._id,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd
        }
      },
      { upsert: true, new: true }
    );

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function cancelSubscription(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { workspaceId: req.workspaceId, status: "active" },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!subscription) {
      res.status(404).json({ message: "No active subscription found" });
      return;
    }

    res.json({ message: "Subscription cancelled", subscription });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
