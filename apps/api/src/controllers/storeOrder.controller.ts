import { Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { StoreOrder, OrderStatus } from "../models/StoreOrder";
import { StoreConnection } from "../models/StoreConnection";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";
import { fetchWooCommerceOrders } from "../services/woocommerce.service";
import { computeOrderRisk, updatePhoneRiskFromOutcome } from "../services/riskScoring.service";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "returned"])
});

const addNoteSchema = z.object({
  text: z.string().min(1).max(500)
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

    // Feed outcome back to risk model
    if (parsed.data.status === "delivered" || parsed.data.status === "returned") {
      await updatePhoneRiskFromOutcome(
        req.workspaceId as unknown as mongoose.Types.ObjectId,
        order.customerPhone
      );
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

    const connection = await StoreConnection.findOne({
      _id: storeConnectionId,
      workspaceId: req.workspaceId
    });

    if (!connection) {
      res.status(404).json({ message: "Store connection not found" });
      return;
    }

    if (connection.status !== "active") {
      res.status(400).json({ message: "Store connection is not active. Test the connection first." });
      return;
    }

    let synced = 0;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { orders, totalPages } = await fetchWooCommerceOrders(
        connection.storeUrl,
        connection.consumerKey,
        connection.consumerSecret,
        page,
        50
      );

      for (const wcOrder of orders) {
        const existing = await StoreOrder.findOne({
          workspaceId: req.workspaceId,
          wooCommerceId: wcOrder.id
        });

        const orderData = {
          workspaceId: req.workspaceId,
          storeConnectionId: connection._id,
          wooCommerceId: wcOrder.id,
          orderNumber: wcOrder.number || `WC-${wcOrder.id}`,
          status: mapWooCommerceStatus(wcOrder.status),
          customerName: `${wcOrder.billing.first_name} ${wcOrder.billing.last_name}`.trim(),
          customerPhone: wcOrder.billing.phone || "",
          customerEmail: wcOrder.billing.email || "",
          shippingAddress: wcOrder.shipping
            ? `${wcOrder.shipping.address_1}, ${wcOrder.shipping.city}`
            : "",
          shippingCity: wcOrder.shipping?.city || "",
          items: (wcOrder.line_items || []).map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(String(item.price))
          })),
          subtotal: parseFloat(wcOrder.total) || 0,
          total: parseFloat(wcOrder.total) || 0,
          currency: wcOrder.currency || "BDT",
          note: wcOrder.customer_note || ""
        };

        if (existing) {
          await StoreOrder.findOneAndUpdate(
            { _id: existing._id },
            { $set: orderData }
          );
        } else {
          // Compute risk score for new order
          const risk = await computeOrderRisk(
            req.workspaceId as unknown as mongoose.Types.ObjectId,
            orderData.customerPhone,
            orderData.shippingCity,
            orderData.total
          );

          await StoreOrder.create({
            ...orderData,
            riskLevel: risk.riskLevel,
            riskScore: risk.riskScore,
            riskFactors: risk.factors
          });
          synced++;
        }
      }

      page++;
      hasMore = page <= totalPages && page <= 10;
    }

    connection.lastSyncAt = new Date();
    await connection.save();

    res.json({ message: "Sync completed", synced });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Failed to sync orders" });
  }
}

function mapWooCommerceStatus(status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    pending: "pending",
    processing: "processing",
    "on-hold": "processing",
    completed: "delivered",
    cancelled: "cancelled",
    refunded: "returned",
    failed: "cancelled"
  };
  return statusMap[status] || "pending";
}

export async function addOrderNote(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const parsed = addNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const order = await StoreOrder.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.workspaceId },
      {
        $push: {
          internalNotes: {
            text: parsed.data.text,
            author: req.user.name || req.user.email,
            createdAt: new Date()
          }
        }
      },
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
