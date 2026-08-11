import { Response } from "express";
import { z } from "zod";
import { FraudCheckLog } from "../models/FraudCheckLog";
import { CourierConnection } from "../models/CourierConnection";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";
import { checkPhoneFraud } from "../services/fraudCheck.service";

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

    // Get courier connection credentials
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

    // Check fraud using courier API
    const result = await checkPhoneFraud(
      phone,
      courierConnection.name,
      courierConnection.apiEndpoint,
      courierConnection.apiKey,
      courierConnection.apiSecret
    );

    // Save to fraud check log
    const log = await FraudCheckLog.findOneAndUpdate(
      { workspaceId: req.workspaceId, phone },
      {
        $set: {
          riskLevel: result.riskLevel,
          totalOrders: result.totalOrders,
          successRate: result.successRate,
          checkedBy: req.user?._id
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      phone,
      riskLevel: result.riskLevel,
      totalOrders: result.totalOrders,
      successRate: result.successRate,
      provider: result.provider,
      lastChecked: log.createdAt
    });
  } catch (error) {
    console.error("Fraud check error:", error);
    res.status(500).json({ message: "Failed to perform fraud check" });
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
