import { Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { FraudCheckLog } from "../models/FraudCheckLog";
import { StoreOrder } from "../models/StoreOrder";
import { CourierConnection } from "../models/CourierConnection";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";
import { checkPhoneFraud } from "../services/fraudCheck.service";
import { computeOrderRisk } from "../services/riskScoring.service";

const checkPhoneSchema = z.object({
  phone: z.string().min(11).max(11),
  courierConnectionId: z.string()
});

export async function checkPhone(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = checkPhoneSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const { phone, courierConnectionId } = parsed.data;

    const courierConnection = await CourierConnection.findOne({
      _id: courierConnectionId,
      workspaceId: req.workspaceId
    });

    if (!courierConnection) {
      res.status(404).json({ message: "Courier connection not found" });
      return;
    }

    if (courierConnection.status !== "active") {
      res.status(400).json({ message: "Courier connection is not active" });
      return;
    }

    // External courier API check
    const result = await checkPhoneFraud(
      phone,
      courierConnection.name,
      courierConnection.apiEndpoint,
      courierConnection.apiKey,
      courierConnection.apiSecret
    );

    // Also compute internal risk from order history
    const internalRisk = await computeOrderRisk(
      req.workspaceId as unknown as mongoose.Types.ObjectId,
      phone,
      "",
      0
    );

    // Use the higher risk level from external vs internal
    const riskOrder = { low: 0, medium: 1, high: 2 };
    const externalRisk = riskOrder[result.riskLevel as keyof typeof riskOrder] || 0;
    const internal = riskOrder[internalRisk.riskLevel as keyof typeof riskOrder] || 0;
    const finalRiskLevel = externalRisk >= internal
      ? result.riskLevel
      : internalRisk.riskLevel;

    const log = await FraudCheckLog.findOneAndUpdate(
      { workspaceId: req.workspaceId, phone },
      {
        $set: {
          riskLevel: finalRiskLevel,
          totalOrders: result.totalOrders,
          successRate: result.successRate,
          checkedBy: req.user?._id
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      phone,
      riskLevel: finalRiskLevel,
      totalOrders: result.totalOrders,
      successRate: result.successRate,
      provider: result.provider,
      internalRisk: internalRisk.riskLevel,
      internalScore: internalRisk.riskScore,
      lastChecked: log.createdAt
    });
  } catch (error) {
    console.error("Fraud check error:", error);
    res.status(500).json({ message: "Failed to perform fraud check" });
  }
}

/**
 * Score a single store order for risk and optionally auto-hold it.
 */
export async function scoreOrder(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const { orderId } = req.params;

    const order = await StoreOrder.findOne({
      _id: orderId,
      workspaceId: req.workspaceId
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const risk = await computeOrderRisk(
      req.workspaceId as unknown as mongoose.Types.ObjectId,
      order.customerPhone,
      order.shippingCity,
      order.total
    );

    order.riskLevel = risk.riskLevel;
    order.riskScore = risk.riskScore;
    order.riskFactors = risk.factors;

    // Auto-hold if high risk and auto-hold is enabled
    const autoHoldEnabled = req.query.autoHold === "true";
    if (risk.riskLevel === "high" && autoHoldEnabled && order.status === "pending") {
      order.heldAt = new Date();
      order.status = "processing" as any;
    }

    await order.save();

    res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      riskLevel: risk.riskLevel,
      riskScore: risk.riskScore,
      factors: risk.factors,
      held: !!order.heldAt
    });
  } catch (error) {
    console.error("Score order error:", error);
    res.status(500).json({ message: "Failed to score order" });
  }
}

/**
 * Bulk score all pending/unchecked orders in the workspace.
 */
export async function bulkScoreOrders(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const autoHold = req.body.autoHold === true;

    const orders = await StoreOrder.find({
      workspaceId: req.workspaceId,
      status: { $in: ["pending", "processing"] }
    });

    const results = await Promise.all(
      orders.map(async (order) => {
        const risk = await computeOrderRisk(
          req.workspaceId as unknown as mongoose.Types.ObjectId,
          order.customerPhone,
          order.shippingCity,
          order.total
        );

        order.riskLevel = risk.riskLevel;
        order.riskScore = risk.riskScore;
        order.riskFactors = risk.factors;

        if (risk.riskLevel === "high" && autoHold && !order.heldAt && order.status === "pending") {
          order.heldAt = new Date();
          order.status = "processing" as any;
        }

        await order.save();

        return {
          orderId: order._id,
          orderNumber: order.orderNumber,
          riskLevel: risk.riskLevel,
          riskScore: risk.riskScore,
          held: !!order.heldAt
        };
      })
    );

    const summary = {
      total: results.length,
      low: results.filter((r) => r.riskLevel === "low").length,
      medium: results.filter((r) => r.riskLevel === "medium").length,
      high: results.filter((r) => r.riskLevel === "high").length,
      held: results.filter((r) => r.held).length
    };

    res.json({ summary, results });
  } catch (error) {
    console.error("Bulk score error:", error);
    res.status(500).json({ message: "Failed to bulk score orders" });
  }
}

/**
 * Release a held order back to pending.
 */
export async function releaseHeldOrder(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const { orderId } = req.params;

    const order = await StoreOrder.findOne({
      _id: orderId,
      workspaceId: req.workspaceId,
      heldAt: { $exists: true, $ne: null }
    });

    if (!order) {
      res.status(404).json({ message: "Held order not found" });
      return;
    }

    order.releasedAt = new Date();
    order.status = "pending";
    await order.save();

    res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      message: "Order released from hold"
    });
  } catch (error) {
    console.error("Release order error:", error);
    res.status(500).json({ message: "Failed to release order" });
  }
}

/**
 * Get all held orders in the workspace.
 */
export async function getHeldOrders(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const orders = await StoreOrder.find({
      workspaceId: req.workspaceId,
      heldAt: { $exists: true, $ne: null },
      releasedAt: { $exists: false }
    })
      .populate("storeConnectionId", "name")
      .sort({ heldAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error("Get held orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function listFraudChecks(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const { riskLevel } = req.query;

    const filter: Record<string, unknown> = {
      workspaceId: req.workspaceId
    };

    if (riskLevel) {
      filter.riskLevel = riskLevel;
    }

    const logs = await FraudCheckLog.find(filter)
      .populate("checkedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getFraudCheckStats(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const stats = await FraudCheckLog.aggregate([
      { $match: { workspaceId: req.workspaceId } },
      {
        $group: {
          _id: "$riskLevel",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      low: 0,
      medium: 0,
      high: 0
    };

    stats.forEach((stat) => {
      if (stat._id in result) {
        result[stat._id as keyof typeof result] = stat.count;
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
