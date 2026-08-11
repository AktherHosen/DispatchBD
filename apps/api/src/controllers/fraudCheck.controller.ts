import { Response } from "express";
import { z } from "zod";
import { FraudCheckLog } from "../models/FraudCheckLog";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";

const checkPhoneSchema = z.object({
  phone: z.string().min(11).max(11)
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

    const { phone } = parsed.data;

    // TODO: Implement actual fraud check logic with external API
    // For now, simulate risk assessment
    const totalOrders = Math.floor(Math.random() * 50);
    const successRate = Math.random() * 100;
    
    let riskLevel: "low" | "medium" | "high" = "low";
    if (successRate < 50) {
      riskLevel = "high";
    } else if (successRate < 75) {
      riskLevel = "medium";
    }

    // Create or update fraud check log
    const log = await FraudCheckLog.findOneAndUpdate(
      { workspaceId: req.workspaceId, phone },
      {
        $set: {
          riskLevel,
          totalOrders,
          successRate,
          checkedBy: req.user?._id
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      phone,
      riskLevel,
      totalOrders,
      successRate,
      lastChecked: log.createdAt
    });
  } catch (error) {
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
