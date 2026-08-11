import { Router } from "express";
import {
  listStoreConnections,
  getStoreConnection,
  createStoreConnection,
  updateStoreConnection,
  deleteStoreConnection,
  testStoreConnection
} from "../controllers/storeConnection.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware, requireRole } from "../middlewares/workspace.middleware";
import { checkPlanLimits, enforceStoreLimit } from "../middlewares/planLimit.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);
router.use(checkPlanLimits);

router.get("/", listStoreConnections);
router.get("/:id", getStoreConnection);
router.post("/", requireRole("owner", "admin"), enforceStoreLimit, createStoreConnection);
router.put("/:id", requireRole("owner", "admin"), updateStoreConnection);
router.delete("/:id", requireRole("owner", "admin"), deleteStoreConnection);
router.post("/:id/test", testStoreConnection);

export default router;
