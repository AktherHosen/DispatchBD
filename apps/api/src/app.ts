import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import storeConnectionRoutes from "./routes/storeConnection.routes";
import storeOrderRoutes from "./routes/storeOrder.routes";
import courierConnectionRoutes from "./routes/courierConnection.routes";
import courierOrderRoutes from "./routes/courierOrder.routes";
import fraudCheckRoutes from "./routes/fraudCheck.routes";
import apiKeyRoutes from "./routes/apiKey.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import superAdminRoutes from "./routes/superAdmin.routes";
import { apiLimiter } from "./middlewares/rateLimit.middleware";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Store routes
app.use("/api/store-connections", storeConnectionRoutes);
app.use("/api/store-orders", storeOrderRoutes);

// Courier routes
app.use("/api/courier-connections", courierConnectionRoutes);
app.use("/api/courier-orders", courierOrderRoutes);

// Fraud check routes
app.use("/api/fraud", fraudCheckRoutes);

// API key routes
app.use("/api/api-keys", apiKeyRoutes);

// Subscription routes
app.use("/api/subscriptions", subscriptionRoutes);

// Super admin routes
app.use("/api/admin", superAdminRoutes);

const port = process.env.PORT || 5000;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dispatchbd";

async function start() {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();
