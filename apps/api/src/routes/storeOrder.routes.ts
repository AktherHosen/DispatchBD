import { Router } from "express";
import {
  listStoreOrders,
  getStoreOrder,
  updateOrderStatus,
  syncStoreOrders,
  addOrderNote
} from "../controllers/storeOrder.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware } from "../middlewares/workspace.middleware";
import { checkPlanLimits, enforceOrderLimit } from "../middlewares/planLimit.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);
router.use(checkPlanLimits);

router.get("/", listStoreOrders);
router.get("/:id", getStoreOrder);
router.patch("/:id/status", updateOrderStatus);
router.post("/:id/notes", addOrderNote);
router.post("/sync/:storeConnectionId", enforceOrderLimit, syncStoreOrders);

export default router;
