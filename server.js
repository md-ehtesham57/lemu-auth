import "./src/config.js";
import { validate } from "./src/infrastructure/middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyEmailSchema,
  resetPasswordSchema,
} from "./src/infrastructure/validation/auth.schema.js";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { connectDB } from "./src/infrastructure/db/mongoose.js";
import { userController } from "./src/delivery/http/container.js";
import { mailQueue } from "./src/infrastructure/queues/mail.queue.js";
import { errorMiddleware } from "./src/delivery/http/middleware/error.middleware.js";
import { apiKeyAuth } from "./src/infrastructure/middleware/apiKey.js";

const app = express();

// Hoist server variable for graceful shutdown handlers (avoids TDZ)
let server;

// --- Security: Global Rate Limiting ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Security: Auth-specific Stricter Rate Limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Security: Graceful Shutdown & Uncaught Errors ---
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// --- Security Middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body Size Limits to prevent DoS
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Global rate limiting
app.use(globalLimiter);

// Health endpoint: must be before apiKeyAuth so health checks don't need the key
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// API key check for service-to-service requests
app.use(apiKeyAuth);

// --- Routes ---
app.use("/api/v1/auth", authLimiter);
app.post("/api/v1/auth/register", validate(registerSchema), userController.register);
app.post("/api/v1/auth/login", validate(loginSchema), userController.login);
app.post("/api/v1/auth/forgot-password", validate(forgotPasswordSchema), userController.forgotPassword);
app.post("/api/v1/auth/verify-email", validate(verifyEmailSchema), userController.verifyEmail);
app.post("/api/v1/auth/reset-password", validate(resetPasswordSchema), userController.resetPassword);
app.post("/api/v1/auth/logout", userController.logout);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// --- Start Server with Graceful Shutdown ---
connectDB().then(() => {
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Graceful shutdown on SIGTERM/SIGINT
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    await mailQueue.close();
    console.log("Mail queue closed.");
  } catch (e) {
    console.error("Error closing mail queue:", e.message);
  }

  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  } catch (e) {
    console.error("Error disconnecting MongoDB:", e.message);
  }

  try {
    await tokenBlacklist.close();
    console.log("Token blacklist Redis client disconnected.");
  } catch (e) {
    console.error("Error closing blacklist Redis client:", e.message);
  }

  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
