import { Response } from "express";
import { z } from "zod";
import { CourierOrder, CourierOrderStatus } from "../models/CourierOrder";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";

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
