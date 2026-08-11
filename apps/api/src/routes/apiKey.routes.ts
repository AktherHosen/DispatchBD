import { Router } from "express";
import {
  listApiKeys,
  getApiKey,
  createApiKey,
  deleteApiKey,
  getApiKeyStats
} from "../controllers/apiKey.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware, requireRole } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get("/", listApiKeys);
router.get("/stats", getApiKeyStats);
router.get("/:id", getApiKey);
router.post("/", requireRole("owner", "admin"), createApiKey);
router.delete("/:id", requireRole("owner", "admin"), deleteApiKey);

export default router;
