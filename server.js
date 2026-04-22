import "./src/config.js";
import { validate } from "./src/infrastructure/middleware/validate.js";
import { registerSchema, loginSchema } from "./src/infrastructure/validation/auth.schema.js";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./src/infrastructure/db/mongoose.js";
import { userController } from "./src/delivery/http/container.js";
import { errorMiddleware } from "./src/delivery/http/middleware/error.middleware.js";
import { UserController } from "./src/delivery/http/user.controller.js";

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Routes
app.post("/api/v1/auth/register", validate(registerSchema), userController.register);

app.post("/api/v1/auth/login", validate(loginSchema), userController.login)

// Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
