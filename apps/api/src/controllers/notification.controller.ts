import { Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";
import { NotificationSettings } from "../models/NotificationSettings";
import {
  generateLinkingCode,
  startBotPolling,
  getNotificationLogs
} from "../services/telegramNotification.service";

const toggleTelegramSchema = z.object({
  enabled: z.boolean()
});

const updateBotTokenSchema = z.object({
  botToken: z.string().min(1)
});

const updateStatusesSchema = z.object({
  notifyStatuses: z.array(z.string()).min(1)
});

export async function getNotificationSettings(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    let settings = await NotificationSettings.findOne({
      workspaceId: req.workspaceId
    });

    if (!settings) {
      settings = await NotificationSettings.create({
        workspaceId: req.workspaceId,
        telegram: { enabled: false, notifyStatuses: ["picked", "out_for_delivery", "delivered", "returned", "failed"] }
      });
    }

    res.json({
      settings: {
        telegram: {
          enabled: settings.telegram.enabled,
          hasBotToken: !!settings.telegram.botToken,
          hasChatId: !!settings.telegram.chatId,
          chatId: settings.telegram.chatId,
          linkedAt: settings.telegram.linkedAt,
          notifyStatuses: settings.telegram.notifyStatuses
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateBotToken(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = updateBotTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    let settings = await NotificationSettings.findOne({
      workspaceId: req.workspaceId
    });

    if (!settings) {
      settings = await NotificationSettings.create({
        workspaceId: req.workspaceId,
        telegram: {
          enabled: true,
          botToken: parsed.data.botToken,
          notifyStatuses: ["picked", "out_for_delivery", "delivered", "returned", "failed"]
        }
      });
    } else {
      settings.telegram.botToken = parsed.data.botToken;
      settings.telegram.enabled = true;
      await settings.save();
    }

    res.json({ message: "Bot token saved. Send the linking code to your bot to complete setup." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getLinkingCode(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    let settings = await NotificationSettings.findOne({
      workspaceId: req.workspaceId
    });

    if (!settings?.telegram.botToken) {
      res.status(400).json({ message: "Add a bot token first" });
      return;
    }

    if (settings.telegram.chatId) {
      res.json({ message: "Bot already linked", linked: true });
      return;
    }

    // Generate new code
    const code = generateLinkingCode();
    settings.telegram.linkingCode = code;
    await settings.save();

    // Start polling in background (fire and forget)
    startBotPolling(settings.telegram.botToken, req.workspaceId as unknown as mongoose.Types.ObjectId).catch(() => {});

    res.json({
      code,
      instructions: `Send this code to your Telegram bot: ${code}`
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function toggleTelegram(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = toggleTelegramSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const settings = await NotificationSettings.findOne({
      workspaceId: req.workspaceId
    });

    if (!settings) {
      res.status(404).json({ message: "Notification settings not found. Add a bot token first." });
      return;
    }

    if (parsed.data.enabled && !settings.telegram.chatId) {
      res.status(400).json({ message: "Bot not linked yet. Complete linking first." });
      return;
    }

    settings.telegram.enabled = parsed.data.enabled;
    await settings.save();

    res.json({ message: `Telegram notifications ${parsed.data.enabled ? "enabled" : "disabled"}` });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateNotifyStatuses(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = updateStatusesSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const settings = await NotificationSettings.findOne({
      workspaceId: req.workspaceId
    });

    if (!settings) {
      res.status(404).json({ message: "Notification settings not found" });
      return;
    }

    settings.telegram.notifyStatuses = parsed.data.notifyStatuses;
    await settings.save();

    res.json({ message: "Notification statuses updated", notifyStatuses: settings.telegram.notifyStatuses });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getNotificationLogsController(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const logs = await getNotificationLogs(req.workspaceId as unknown as mongoose.Types.ObjectId);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function unlinkTelegram(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const settings = await NotificationSettings.findOne({
      workspaceId: req.workspaceId
    });

    if (!settings) {
      res.status(404).json({ message: "Notification settings not found" });
      return;
    }

    settings.telegram.chatId = undefined;
    settings.telegram.linkedAt = undefined;
    settings.telegram.linkingCode = undefined;
    settings.telegram.enabled = false;
    await settings.save();

    res.json({ message: "Telegram bot unlinked" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
