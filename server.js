import "./src/config.js";


import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./src/infrastructure/db/mongoose.js";
import { userController } from "./src/delivery/http/container.js";
import { errorMiddleware } from "./src/delivery/http/middleware/error.middleware.js";

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.post("/api/v1/auth/register", userController.register);

// Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
