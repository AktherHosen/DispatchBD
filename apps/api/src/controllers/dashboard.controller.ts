import { Response } from "express";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";
import { StoreOrder } from "../models/StoreOrder";
import { CourierOrder } from "../models/CourierOrder";
import { StoreConnection } from "../models/StoreConnection";
import { CourierConnection } from "../models/CourierConnection";

export async function getDashboardStats(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const workspaceId = req.workspaceId;

    const [
      totalOrders,
      storeConnections,
      courierConnections,
      deliveredOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      StoreOrder.countDocuments({ workspaceId }),
      StoreConnection.countDocuments({ workspaceId, status: "active" }),
      CourierConnection.countDocuments({ workspaceId, status: "active" }),
      StoreOrder.countDocuments({ workspaceId, status: "delivered" }),
      StoreOrder.aggregate([
        { $match: { workspaceId: workspaceId as any, status: { $in: ["delivered", "shipped"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      StoreOrder.find({ workspaceId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber customerName total status createdAt")
    ]);

    const successRate = totalOrders > 0
      ? Math.round((deliveredOrders / totalOrders) * 100 * 10) / 10
      : 0;

    res.json({
      stats: {
        totalOrders,
        activeCouriers: courierConnections,
        activeStores: storeConnections,
        totalRevenue: totalRevenue[0]?.total || 0,
        successRate
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
