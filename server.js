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
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/infrastructure/db/mongoose.js";
import { userController } from "./src/delivery/http/container.js";
import { errorMiddleware } from "./src/delivery/http/middleware/error.middleware.js";

const app = express();

// Hoist server variable for graceful shutdown handlers (avoids TDZ)
let server;

// --- Security: Global Rate Limiting ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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

// Logging: Only use Morgan in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body Size Limits to prevent DoS
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Global rate limiting
app.use(globalLimiter);

// --- Routes ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

app.post("/api/v1/auth/register", authLimiter, validate(registerSchema), userController.register);
app.post("/api/v1/auth/login", authLimiter, validate(loginSchema), userController.login);
app.post("/api/v1/auth/forgot-password", authLimiter, validate(forgotPasswordSchema), userController.forgotPassword);
app.post("/api/v1/auth/verify-email", authLimiter, validate(verifyEmailSchema), userController.verifyEmail);
app.post("/api/v1/auth/reset-password", authLimiter, validate(resetPasswordSchema), userController.resetPassword);
app.post("/api/v1/auth/logout", authLimiter, userController.logout);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// --- Start Server with Graceful Shutdown ---
connectDB().then(() => {
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Graceful shutdown on SIGTERM/SIGINT
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
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
