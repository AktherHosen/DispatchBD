import { Response } from "express";
import { z } from "zod";
import { StoreOrder, OrderStatus } from "../models/StoreOrder";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "returned"])
});

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "returned"]).optional(),
  storeConnectionId: z.string().optional(),
  search: z.string().optional()
});

export async function listStoreOrders(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const { page, limit, status, storeConnectionId, search } = parsed.data;
    const filter: Record<string, unknown> = { workspaceId: req.workspaceId };

    if (status) filter.status = status;
    if (storeConnectionId) filter.storeConnectionId = storeConnectionId;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } }
      ];
    }

    const [orders, total] = await Promise.all([
      StoreOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      StoreOrder.countDocuments(filter)
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getStoreOrder(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const order = await StoreOrder.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateOrderStatus(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const order = await StoreOrder.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.workspaceId },
      { $set: { status: parsed.data.status } },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function syncStoreOrders(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const { storeConnectionId } = req.params;

    // Placeholder: In real implementation, fetch from WooCommerce API
    // and upsert orders into StoreOrder collection
    res.json({ message: "Sync started", synced: 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
