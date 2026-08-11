import { Response } from "express";
import { z } from "zod";
import { CourierOrder, CourierOrderStatus } from "../models/CourierOrder";
import { StoreOrder } from "../models/StoreOrder";
import { CourierConnection } from "../models/CourierConnection";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";
import { submitToSteadfast, submitToPathao } from "../services/courierSubmit.service";

const createSchema = z.object({
  courierConnectionId: z.string(),
  storeOrderId: z.string(),
  consignmentId: z.string().min(1),
  amount: z.number().positive(),
  codAmount: z.number().min(0).optional(),
  note: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "picked", "in_transit", "delivered", "returned", "cancelled"])
});

export async function listCourierOrders(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const { status, courierConnectionId } = req.query;
    
    const filter: Record<string, unknown> = {
      workspaceId: req.workspaceId
    };
    
    if (status) {
      filter.status = status;
    }
    
    if (courierConnectionId) {
      filter.courierConnectionId = courierConnectionId;
    }

    const orders = await CourierOrder.find(filter)
      .populate("courierConnectionId", "name")
      .populate("storeOrderId")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getCourierOrder(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const order = await CourierOrder.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceId
    })
      .populate("courierConnectionId", "name")
      .populate("storeOrderId");

    if (!order) {
      res.status(404).json({ message: "Courier order not found" });
      return;
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function createCourierOrder(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const order = await CourierOrder.create({
      workspaceId: req.workspaceId,
      ...parsed.data,
      status: "pending"
    });

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateCourierOrderStatus(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const order = await CourierOrder.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.workspaceId },
      { $set: { status: parsed.data.status } },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: "Courier order not found" });
      return;
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteCourierOrder(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const order = await CourierOrder.findOneAndDelete({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!order) {
      res.status(404).json({ message: "Courier order not found" });
      return;
    }

    res.json({ message: "Courier order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

const sendToCourierSchema = z.object({
  storeOrderId: z.string(),
  courierConnectionId: z.string(),
  note: z.string().optional()
});

export async function sendToCourier(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = sendToCourierSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const { storeOrderId, courierConnectionId, note } = parsed.data;

    const storeOrder = await StoreOrder.findOne({
      _id: storeOrderId,
      workspaceId: req.workspaceId
    });

    if (!storeOrder) {
      res.status(404).json({ message: "Store order not found" });
      return;
    }

    const existing = await CourierOrder.findOne({
      storeOrderId,
      workspaceId: req.workspaceId
    });

    if (existing) {
      res.status(409).json({ message: "Order already sent to courier", consignmentId: existing.consignmentId });
      return;
    }

    const courier = await CourierConnection.findOne({
      _id: courierConnectionId,
      workspaceId: req.workspaceId
    });

    if (!courier) {
      res.status(404).json({ message: "Courier connection not found" });
      return;
    }

    if (courier.status !== "active") {
      res.status(400).json({ message: "Courier connection is not active" });
      return;
    }

    const orderData = {
      orderNumber: storeOrder.orderNumber,
      customerName: storeOrder.customerName,
      customerPhone: storeOrder.customerPhone,
      customerAddress: storeOrder.shippingAddress,
      customerCity: storeOrder.shippingCity,
      amount: storeOrder.total,
      note: note || storeOrder.note
    };

    let result;
    const courierName = courier.name.toLowerCase();

    if (courierName.includes("steadfast")) {
      result = await submitToSteadfast(courier.apiKey, courier.apiSecret, orderData);
    } else if (courierName.includes("pathao")) {
      result = await submitToPathao(courier.apiKey, courier.apiSecret, orderData);
    } else {
      result = {
        success: true,
        consignmentId: `EXT-${storeOrder.orderNumber}`,
        message: "Order queued (generic courier)"
      };
    }

    if (!result.success) {
      res.status(400).json({ message: result.message });
      return;
    }

    const courierOrder = await CourierOrder.create({
      workspaceId: req.workspaceId,
      courierConnectionId: courier._id,
      storeOrderId: storeOrder._id,
      consignmentId: result.consignmentId,
      status: "pending",
      amount: storeOrder.total,
      codAmount: storeOrder.total,
      note
    });

    res.status(201).json({ order: courierOrder, consignmentId: result.consignmentId });
  } catch (error) {
    console.error("Send to courier error:", error);
    res.status(500).json({ message: "Failed to send order to courier" });
  }
}
