import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  me
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", authMiddleware, me);

export default router;
