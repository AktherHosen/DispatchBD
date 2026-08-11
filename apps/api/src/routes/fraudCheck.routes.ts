import { Router } from "express";
import {
  checkPhone,
  listFraudChecks,
  getFraudCheckStats
} from "../controllers/fraudCheck.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware, requireRole } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.post("/check", requireRole("owner", "admin", "moderator"), checkPhone);
router.get("/", listFraudChecks);
router.get("/stats", getFraudCheckStats);

export default router;
