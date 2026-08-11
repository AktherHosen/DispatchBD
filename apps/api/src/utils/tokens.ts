import jwt from "jsonwebtoken";
import { env } from "../config/env";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY
  });
}

export function verifyAccessToken(token: string): { userId: string } {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as { userId: string };
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { userId: string };
}
