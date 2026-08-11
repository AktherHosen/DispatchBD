import { Router } from "express";
import {
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember
} from "../controllers/member.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceMiddleware, requireRole } from "../middlewares/workspace.middleware";

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get("/", listMembers);
router.post("/", requireRole("owner", "admin"), inviteMember);
router.patch("/:id/role", requireRole("owner"), updateMemberRole);
router.delete("/:id", requireRole("owner", "admin"), removeMember);

export default router;
