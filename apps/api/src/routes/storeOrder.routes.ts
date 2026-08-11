import { Router } from "express";
import {
  listStoreOrders,
  getStoreOrder,
  updateOrderStatus,
  syncStoreOrders
} from "../controllers/storeOrder.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get("/", listStoreOrders);
router.get("/:id", getStoreOrder);
router.patch("/:id/status", updateOrderStatus);
router.post("/sync/:storeConnectionId", syncStoreOrders);

export default router;
