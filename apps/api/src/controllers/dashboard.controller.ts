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
      recentOrders,
      courierStats
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
        .select("orderNumber customerName total status createdAt"),
      CourierOrder.aggregate([
        { $match: { workspaceId: workspaceId as any } },
        { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } }
      ])
    ]);

    const successRate = totalOrders > 0
      ? Math.round((deliveredOrders / totalOrders) * 100 * 10) / 10
      : 0;

    const courierPerformance = courierStats.map(s => ({
      status: s._id,
      count: s.count,
      totalAmount: s.totalAmount
    }));

    const totalCourierOrders = courierStats.reduce((sum, s) => sum + s.count, 0);
    const deliveredCourierOrders = courierStats.find(s => s._id === "delivered")?.count || 0;
    const courierSuccessRate = totalCourierOrders > 0
      ? Math.round((deliveredCourierOrders / totalCourierOrders) * 100 * 10) / 10
      : 0;

    res.json({
      stats: {
        totalOrders,
        activeCouriers: courierConnections,
        activeStores: storeConnections,
        totalRevenue: totalRevenue[0]?.total || 0,
        successRate
      },
      recentOrders,
      courierPerformance: {
        total: totalCourierOrders,
        delivered: deliveredCourierOrders,
        successRate: courierSuccessRate,
        byStatus: courierPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
