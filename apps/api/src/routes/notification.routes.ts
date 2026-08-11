import { Router } from "express";
import {
  getNotificationSettings,
  updateBotToken,
  getLinkingCode,
  toggleTelegram,
  updateNotifyStatuses,
  getNotificationLogsController,
  unlinkTelegram
} from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware, requireRole } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get("/settings", getNotificationSettings);
router.put("/bot-token", requireRole("owner", "admin"), updateBotToken);
router.post("/linking-code", requireRole("owner", "admin"), getLinkingCode);
router.post("/toggle", requireRole("owner", "admin"), toggleTelegram);
router.put("/statuses", requireRole("owner", "admin"), updateNotifyStatuses);
router.post("/unlink", requireRole("owner", "admin"), unlinkTelegram);
router.get("/logs", getNotificationLogsController);

export default router;
