import { Router } from "express";
import {
  checkPhone,
  scoreOrder,
  bulkScoreOrders,
  releaseHeldOrder,
  getHeldOrders,
  listFraudChecks,
  getFraudCheckStats
} from "../controllers/fraudCheck.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware, requireRole } from "../middlewares/workspace.middleware";
import { fraudCheckLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.post("/check", requireRole("owner", "admin", "moderator"), fraudCheckLimiter, checkPhone);
router.post("/score/:orderId", requireRole("owner", "admin", "moderator"), scoreOrder);
router.post("/bulk-score", requireRole("owner", "admin"), bulkScoreOrders);
router.post("/release/:orderId", requireRole("owner", "admin"), releaseHeldOrder);
router.get("/held", getHeldOrders);
router.get("/", listFraudChecks);
router.get("/stats", getFraudCheckStats);

export default router;
