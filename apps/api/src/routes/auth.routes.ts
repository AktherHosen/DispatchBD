import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  me,
  listWorkspaces
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", authMiddleware, me);
router.get("/workspaces", authMiddleware, listWorkspaces);

export default router;
