import { Router } from "express";
import {
  getSuperAdminStats,
  listWorkspaces,
  suspendWorkspace,
  reactivateWorkspace
} from "../controllers/superAdmin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/stats", getSuperAdminStats);
router.get("/workspaces", listWorkspaces);
router.post("/workspaces/:id/suspend", suspendWorkspace);
router.post("/workspaces/:id/reactivate", reactivateWorkspace);

export default router;
