import { Router } from "express";
import {
  listPlans,
  getSubscription,
  upgradePlan,
  cancelSubscription
} from "../controllers/subscription.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware, requireRole } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get("/plans", listPlans);
router.get("/", getSubscription);
router.post("/upgrade", requireRole("owner"), upgradePlan);
router.post("/cancel", requireRole("owner"), cancelSubscription);

export default router;
