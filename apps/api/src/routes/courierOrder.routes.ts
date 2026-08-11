import { Router } from "express";
import {
  listCourierOrders,
  getCourierOrder,
  createCourierOrder,
  updateCourierOrderStatus,
  deleteCourierOrder
} from "../controllers/courierOrder.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware, requireRole } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get("/", listCourierOrders);
router.get("/:id", getCourierOrder);
router.post("/", requireRole("owner", "admin", "moderator"), createCourierOrder);
router.patch("/:id/status", requireRole("owner", "admin", "moderator"), updateCourierOrderStatus);
router.delete("/:id", requireRole("owner", "admin"), deleteCourierOrder);

export default router;
