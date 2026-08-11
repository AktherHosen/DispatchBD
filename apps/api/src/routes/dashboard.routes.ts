import { Router } from "express";
import { getDashboardStats, getRtoStats } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get("/stats", getDashboardStats);
router.get("/rto", getRtoStats);

export default router;
