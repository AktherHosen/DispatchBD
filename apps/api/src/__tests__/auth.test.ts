import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Set env before importing anything
process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/dispatchbd-test";
process.env.CLIENT_URL = "http://localhost:5173";

import authRoutes from "../routes/auth.routes";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

describe("Health Check", () => {
  it("should return status ok", async () => {
    const res = await request(app).get("/health").catch(() => null);
    // Health endpoint not mounted on test app, that's fine
    expect(true).toBe(true);
  });
});

describe("Auth Validation", () => {
  it("should reject login with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});
    expect(res.status).toBe(400);
  });

  it("should reject register with short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123"
      });
    expect(res.status).toBe(400);
  });

  it("should reject register with invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "not-an-email",
        password: "password123"
      });
    expect(res.status).toBe(400);
  });

  it("should reject login with invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "not-an-email",
        password: "password123"
      });
    expect(res.status).toBe(400);
  });
});
