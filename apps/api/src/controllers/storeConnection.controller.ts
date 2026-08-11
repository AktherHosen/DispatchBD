import { Response } from "express";
import { z } from "zod";
import { StoreConnection } from "../models/StoreConnection";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";
import { testWooCommerceConnection } from "../services/woocommerce.service";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  platform: z.enum(["woocommerce"]),
  storeUrl: z.string().url(),
  consumerKey: z.string().min(1),
  consumerSecret: z.string().min(1)
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  consumerKey: z.string().min(1).optional(),
  consumerSecret: z.string().min(1).optional()
});

export async function listStoreConnections(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const connections = await StoreConnection.find({
      workspaceId: req.workspaceId
    }).sort({ createdAt: -1 });

    res.json({ connections });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getStoreConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const connection = await StoreConnection.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!connection) {
      res.status(404).json({ message: "Store connection not found" });
      return;
    }

    res.json({ connection });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function createStoreConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const connection = await StoreConnection.create({
      workspaceId: req.workspaceId,
      ...parsed.data,
      status: "inactive"
    });

    res.status(201).json({ connection });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateStoreConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const connection = await StoreConnection.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.workspaceId },
      { $set: parsed.data },
      { new: true }
    );

    if (!connection) {
      res.status(404).json({ message: "Store connection not found" });
      return;
    }

    res.json({ connection });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteStoreConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const connection = await StoreConnection.findOneAndDelete({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!connection) {
      res.status(404).json({ message: "Store connection not found" });
      return;
    }

    res.json({ message: "Store connection deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function testStoreConnection(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const connection = await StoreConnection.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!connection) {
      res.status(404).json({ message: "Store connection not found" });
      return;
    }

    const result = await testWooCommerceConnection(
      connection.storeUrl,
      connection.consumerKey,
      connection.consumerSecret
    );

    if (result.success) {
      connection.status = "active";
      await connection.save();
    } else {
      connection.status = "error";
      await connection.save();
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
