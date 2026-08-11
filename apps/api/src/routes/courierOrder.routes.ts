import { Router } from "express";
import {
  listCourierOrders,
  getCourierOrder,
  createCourierOrder,
  updateCourierOrderStatus,
  deleteCourierOrder,
  sendToCourier,
  bulkSendToCourier
} from "../controllers/courierOrder.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get("/", listCourierOrders);
router.get("/:id", getCourierOrder);
router.post("/", createCourierOrder);
router.patch("/:id/status", updateCourierOrderStatus);
router.delete("/:id", deleteCourierOrder);
router.post("/send", sendToCourier);
router.post("/bulk-send", bulkSendToCourier);

export default router;
