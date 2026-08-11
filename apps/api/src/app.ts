import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import storeConnectionRoutes from "./routes/storeConnection.routes";
import storeOrderRoutes from "./routes/storeOrder.routes";
import superAdminRoutes from "./routes/superAdmin.routes";

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

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/store-connections", storeConnectionRoutes);
app.use("/api/store-orders", storeOrderRoutes);
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
