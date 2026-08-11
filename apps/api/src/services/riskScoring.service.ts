import mongoose from "mongoose";
import { StoreOrder } from "../models/StoreOrder";
import { CourierOrder } from "../models/CourierOrder";

export interface RiskFactors {
  phoneReturnCount: number;
  zoneRtoRate: number;
  orderValueDeviation: number;
}

export interface RiskResult {
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  factors: RiskFactors;
}

/**
 * Count how many times this phone number has been returned/cancelled
 * across all orders in this workspace.
 */
async function getPhoneReturnCount(
  workspaceId: mongoose.Types.ObjectId,
  phone: string
): Promise<number> {
  const result = await StoreOrder.aggregate([
    {
      $match: {
        workspaceId,
        customerPhone: phone,
        status: { $in: ["returned", "cancelled"] }
      }
    },
    { $count: "count" }
  ]);
  return result[0]?.count || 0;
}

/**
 * Calculate the RTO rate for a delivery zone (shippingCity).
 * RTO = returned / (delivered + returned) for that zone.
 */
async function getZoneRtoRate(
  workspaceId: mongoose.Types.ObjectId,
  zone: string
): Promise<number> {
  if (!zone) return 0;

  const result = await CourierOrder.aggregate([
    {
      $lookup: {
        from: "storeorders",
        localField: "storeOrderId",
        foreignField: "_id",
        as: "storeOrder"
      }
    },
    { $unwind: "$storeOrder" },
    {
      $match: {
        workspaceId,
        "storeOrder.shippingCity": zone
      }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const delivered = result.find((r) => r._id === "delivered")?.count || 0;
  const returned = result.find((r) => r._id === "returned")?.count || 0;
  const total = delivered + returned;

  return total > 0 ? returned / total : 0;
}

/**
 * Calculate how much this order deviates from the customer's
 * average order value (based on phone number history).
 * Returns a multiplier: 1.0 = average, 2.0 = double the average, etc.
 */
async function getOrderValueDeviation(
  workspaceId: mongoose.Types.ObjectId,
  phone: string,
  orderTotal: number
): Promise<number> {
  const result = await StoreOrder.aggregate([
    {
      $match: {
        workspaceId,
        customerPhone: phone,
        status: { $in: ["delivered", "shipped", "processing", "pending"] }
      }
    },
    {
      $group: {
        _id: null,
        avgTotal: { $avg: "$total" }
      }
    }
  ]);

  const avgTotal = result[0]?.avgTotal || 0;
  if (avgTotal === 0) return 1;
  return orderTotal / avgTotal;
}

/**
 * Compute risk score from factors.
 *
 * Scoring formula:
 * - Phone return count: 0→0, 1→15, 2→30, 3→50, 4+→70
 * - Zone RTO rate: 0→0, 0.1→10, 0.2→20, 0.3→35, 0.5+→60
 * - Order value deviation: 1.0→0, 1.5→15, 2.0→30, 3.0+→50
 *
 * Combined score: weighted sum (phone 40%, zone 35%, value 25%)
 * Thresholds: <25 low, 25-55 medium, >55 high
 */
function computeRiskScore(factors: RiskFactors): RiskResult {
  // Phone return component (0-100)
  const phoneScore = Math.min(
    100,
    factors.phoneReturnCount === 0
      ? 0
      : factors.phoneReturnCount === 1
        ? 15
        : factors.phoneReturnCount === 2
          ? 30
          : factors.phoneReturnCount === 3
            ? 50
            : 70
  );

  // Zone RTO component (0-100)
  const zoneScore = Math.min(
    100,
    Math.round(factors.zoneRtoRate * 200)
  );

  // Order value deviation component (0-100)
  const valueScore = Math.min(
    100,
    factors.orderValueDeviation <= 1
      ? 0
      : factors.orderValueDeviation <= 1.5
        ? 15
        : factors.orderValueDeviation <= 2
          ? 30
          : factors.orderValueDeviation <= 3
            ? 50
            : 70
  );

  // Weighted combination
  const riskScore = Math.round(
    phoneScore * 0.4 + zoneScore * 0.35 + valueScore * 0.25
  );

  let riskLevel: "low" | "medium" | "high" = "low";
  if (riskScore > 55) {
    riskLevel = "high";
  } else if (riskScore > 25) {
    riskLevel = "medium";
  }

  return { riskScore, riskLevel, factors };
}

/**
 * Main entry point: compute risk for a store order.
 */
export async function computeOrderRisk(
  workspaceId: mongoose.Types.ObjectId,
  phone: string,
  shippingCity: string,
  orderTotal: number
): Promise<RiskResult> {
  const [phoneReturnCount, zoneRtoRate, orderValueDeviation] =
    await Promise.all([
      getPhoneReturnCount(workspaceId, phone),
      getZoneRtoRate(workspaceId, shippingCity),
      getOrderValueDeviation(workspaceId, phone, orderTotal)
    ]);

  return computeRiskScore({
    phoneReturnCount,
    zoneRtoRate,
    orderValueDeviation
  });
}

/**
 * Feed outcome back: when an order is delivered or returned,
 * recompute risk for that phone number and update all unchecked
 * or existing risk records.
 */
export async function updatePhoneRiskFromOutcome(
  workspaceId: mongoose.Types.ObjectId,
  phone: string
): Promise<void> {
  const returnCount = await getPhoneReturnCount(workspaceId, phone);

  // Update all fraud check logs for this phone
  const riskLevel =
    returnCount === 0
      ? "low"
      : returnCount <= 1
        ? "low"
        : returnCount <= 2
          ? "medium"
          : "high";

  const { FraudCheckLog } = await import("../models/FraudCheckLog.js");
  await FraudCheckLog.findOneAndUpdate(
    { workspaceId, phone },
    {
      $set: {
        riskLevel,
        totalOrders: returnCount
      }
    }
  );
}
