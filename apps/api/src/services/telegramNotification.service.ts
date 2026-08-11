import axios from "axios";
import { NotificationLog } from "../models/NotificationLog";
import { NotificationSettings } from "../models/NotificationSettings";
import { CourierOrder } from "../models/CourierOrder";
import { Workspace } from "../models/Workspace";
import {
  NormalizedStatus,
  normalizeCourierStatus,
  STATUS_LABELS
} from "./notificationStatus.service";
import mongoose from "mongoose";

interface NotifyResult {
  success: boolean;
  channel: string;
  error?: string;
}

/**
 * Send a Telegram message to a chat.
 */
async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await axios.post(
      url,
      {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      },
      { timeout: 10000 }
    );
    return { ok: response.data.ok };
  } catch (error: any) {
    const errMsg =
      error.response?.data?.description || error.message || "Unknown error";
    return { ok: false, error: errMsg };
  }
}

/**
 * Generate a short linking code for Telegram bot pairing.
 */
export function generateLinkingCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Start Telegram bot polling for linking messages.
 * When a user sends the linking code to the bot, we pair the chat.
 */
export async function startBotPolling(
  botToken: string,
  workspaceId: mongoose.Types.ObjectId
): Promise<void> {
  const settings = await NotificationSettings.findOne({ workspaceId });
  if (!settings?.telegram.linkingCode) return;

  try {
    const url = `https://api.telegram.org/bot${botToken}/getUpdates`;
    const response = await axios.get(url, { params: { timeout: 5 }, timeout: 10000 });
    const updates = response.data.result || [];

    for (const update of updates) {
      const message = update.message?.text;
      const chatId = String(update.message?.chat?.id);
      if (!message || !chatId) continue;

      if (message.trim() === settings.telegram.linkingCode) {
        settings.telegram.chatId = chatId;
        settings.telegram.linkedAt = new Date();
        settings.telegram.linkingCode = undefined;
        await settings.save();
        break;
      }
    }
  } catch {
    // Polling failed silently — will retry next time
  }
}

/**
 * Core trigger: called when a courier order status changes.
 * Dispatches to all enabled channels.
 */
export async function onCourierStatusChanged(
  courierOrder: any,
  oldStatus: string,
  newStatus: string
): Promise<NotifyResult[]> {
  const workspaceId = courierOrder.workspaceId;
  const normalized = normalizeCourierStatus("", newStatus);

  const settings = await NotificationSettings.findOne({ workspaceId });
  if (!settings || !settings.telegram.enabled || !settings.telegram.chatId) {
    return [];
  }

  // Check if this status is in the notify list
  if (!settings.telegram.notifyStatuses.includes(normalized)) {
    return [];
  }

  const workspace = await Workspace.findById(workspaceId);
  const courierName =
    courierOrder.courierConnectionId?.name || "Unknown Courier";

  const message = [
    `📦 <b>Order #${courierOrder.consignmentId}</b>`,
    ``,
    `Status: <b>${STATUS_LABELS[normalized]}</b>`,
    `Courier: ${courierName}`,
    `Amount: ৳${courierOrder.amount.toLocaleString()}`,
    ``,
    `— ${workspace?.name || "DispatchBD"}`
  ].join("\n");

  const results: NotifyResult[] = [];

  // Send to Telegram
  if (settings.telegram.botToken && settings.telegram.chatId) {
    const result = await sendTelegramMessage(
      settings.telegram.botToken,
      settings.telegram.chatId,
      message
    );

    await NotificationLog.create({
      workspaceId,
      courierOrderId: courierOrder._id,
      channel: "telegram",
      recipientType: "workspace_chat",
      recipient: settings.telegram.chatId,
      status: result.ok ? "sent" : "failed",
      payload: message,
      error: result.error
    });

    results.push({
      success: result.ok,
      channel: "telegram",
      error: result.error
    });
  }

  return results;
}

/**
 * Get notification logs for a workspace.
 */
export async function getNotificationLogs(
  workspaceId: mongoose.Types.ObjectId,
  limit = 50
) {
  return NotificationLog.find({ workspaceId })
    .populate("courierOrderId", "consignmentId amount status")
    .sort({ sentAt: -1 })
    .limit(limit);
}
