import { Router } from "express";
import {
  listCourierConnections,
  getCourierConnection,
  createCourierConnection,
  updateCourierConnection,
  deleteCourierConnection,
  testCourierConnection
} from "../controllers/courierConnection.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware, requireRole } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get("/", listCourierConnections);
router.get("/:id", getCourierConnection);
router.post("/", requireRole("owner", "admin"), createCourierConnection);
router.put("/:id", requireRole("owner", "admin"), updateCourierConnection);
router.delete("/:id", requireRole("owner", "admin"), deleteCourierConnection);
router.post("/:id/test", testCourierConnection);

export default router;
