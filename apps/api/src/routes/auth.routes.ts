import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  me,
  listWorkspaces,
  changePassword,
  updateProfile,
  requestPasswordReset,
  resetPassword
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.post("/forgot-password", authLimiter, requestPasswordReset);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/me", authMiddleware, me);
router.get("/workspaces", authMiddleware, listWorkspaces);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;
