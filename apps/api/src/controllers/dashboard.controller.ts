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

/**
 * RTO cost dashboard: monthly RTO orders, cost, rate, broken down by courier.
 */
export async function getRtoStats(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    const { months = "6" } = req.query;
    const monthCount = Math.min(Number(months) || 6, 24);

    // Get date range
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthCount + 1, 1);

    // Total orders and returned orders per month
    const monthlyStats = await StoreOrder.aggregate([
      {
        $match: {
          workspaceId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 },
          returned: {
            $sum: { $cond: [{ $eq: ["$status", "returned"] }, 1, 0] }
          },
          delivered: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // RTO cost by courier
    const courierRtoStats = await CourierOrder.aggregate([
      {
        $match: {
          workspaceId,
          status: "returned",
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: "courierconnections",
          localField: "courierConnectionId",
          foreignField: "_id",
          as: "courier"
        }
      },
      { $unwind: "$courier" },
      {
        $group: {
          _id: {
            courierId: "$courierConnectionId",
            courierName: "$courier.name"
          },
          totalReturns: { $sum: 1 },
          totalReturnCost: { $sum: "$returnCost" },
          totalForwardCost: { $sum: "$amount" }
        }
      },
      { $sort: { totalReturns: -1 } }
    ]);

    // Top returned customers
    const topReturners = await StoreOrder.aggregate([
      {
        $match: {
          workspaceId,
          status: "returned",
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            phone: "$customerPhone",
            name: "$customerName"
          },
          returnCount: { $sum: 1 },
          totalValue: { $sum: "$total" }
        }
      },
      { $sort: { returnCount: -1 } },
      { $limit: 10 }
    ]);

    // Summary
    const totalOrders = monthlyStats.reduce((sum, m) => sum + m.total, 0);
    const totalReturned = monthlyStats.reduce((sum, m) => sum + m.returned, 0);
    const rtoRate = totalOrders > 0
      ? Math.round((totalReturned / totalOrders) * 100 * 10) / 10
      : 0;
    const totalRtoCost = courierRtoStats.reduce(
      (sum, c) => sum + c.totalReturnCost + c.totalForwardCost,
      0
    );

    res.json({
      summary: {
        totalOrders,
        totalReturned,
        rtoRate,
        totalRtoCost,
        periodMonths: monthCount
      },
      monthly: monthlyStats.map((m) => ({
        year: m._id.year,
        month: m._id.month,
        label: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
        total: m.total,
        returned: m.returned,
        delivered: m.delivered,
        rtoRate: m.total > 0 ? Math.round((m.returned / m.total) * 100 * 10) / 10 : 0
      })),
      byCourier: courierRtoStats.map((c) => ({
        courierId: c._id.courierId,
        courierName: c._id.courierName,
        totalReturns: c.totalReturns,
        totalReturnCost: c.totalReturnCost,
        totalForwardCost: c.totalForwardCost,
        totalCost: c.totalReturnCost + c.totalForwardCost
      })),
      topReturners: topReturners.map((r) => ({
        phone: r._id.phone,
        name: r._id.name,
        returnCount: r.returnCount,
        totalValue: r.totalValue
      }))
    });
  } catch (error) {
    console.error("RTO stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
