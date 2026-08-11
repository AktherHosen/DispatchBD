import { Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import { ApiKey } from "../models/ApiKey";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";

const createSchema = z.object({
  name: z.string().min(1).max(100)
});

function generateApiKey(): string {
  return `pk_${crypto.randomBytes(32).toString("hex")}`;
}

function generateApiSecret(): string {
  return crypto.randomBytes(64).toString("hex");
}

export async function listApiKeys(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const keys = await ApiKey.find({
      workspaceId: req.workspaceId
    }).select("-secret").sort({ createdAt: -1 });

    res.json({ keys });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getApiKey(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const key = await ApiKey.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceId
    }).select("-secret");

    if (!key) {
      res.status(404).json({ message: "API key not found" });
      return;
    }

    res.json({ key });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function createApiKey(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const key = generateApiKey();
    const secret = generateApiSecret();

    const apiKey = await ApiKey.create({
      workspaceId: req.workspaceId,
      name: parsed.data.name,
      key,
      secret
    });

    res.status(201).json({
      key: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key,
        createdAt: apiKey.createdAt
      },
      secret
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteApiKey(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const key = await ApiKey.findOneAndDelete({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!key) {
      res.status(404).json({ message: "API key not found" });
      return;
    }

    res.json({ message: "API key deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getApiKeyStats(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const keys = await ApiKey.find({
      workspaceId: req.workspaceId
    });

    const totalKeys = keys.length;
    const totalRequests = keys.reduce((sum, key) => sum + (key.lastUsedAt ? 1 : 0), 0);

    res.json({
      totalKeys,
      totalRequests
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
