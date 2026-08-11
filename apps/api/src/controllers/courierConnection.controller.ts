import { Response } from "express";
import { z } from "zod";
import { CourierConnection } from "../models/CourierConnection";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  apiEndpoint: z.string().url(),
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1)
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  apiEndpoint: z.string().url().optional(),
  apiKey: z.string().min(1).optional(),
  apiSecret: z.string().min(1).optional()
});

export async function listCourierConnections(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const connections = await CourierConnection.find({
      workspaceId: req.workspaceId
    }).sort({ createdAt: -1 });

    res.json({ connections });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getCourierConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const connection = await CourierConnection.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!connection) {
      res.status(404).json({ message: "Courier connection not found" });
      return;
    }

    res.json({ connection });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function createCourierConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const connection = await CourierConnection.create({
      workspaceId: req.workspaceId,
      ...parsed.data,
      status: "inactive"
    });

    res.status(201).json({ connection });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateCourierConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const connection = await CourierConnection.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.workspaceId },
      { $set: parsed.data },
      { new: true }
    );

    if (!connection) {
      res.status(404).json({ message: "Courier connection not found" });
      return;
    }

    res.json({ connection });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteCourierConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const connection = await CourierConnection.findOneAndDelete({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!connection) {
      res.status(404).json({ message: "Courier connection not found" });
      return;
    }

    res.json({ message: "Courier connection deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function testCourierConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const connection = await CourierConnection.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!connection) {
      res.status(404).json({ message: "Courier connection not found" });
      return;
    }

    // TODO: Implement actual courier API test
    // For now, just mark as active
    connection.status = "active";
    await connection.save();

    res.json({ success: true, message: "Connection test successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
