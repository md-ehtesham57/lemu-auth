import dotenv from "dotenv";
dotenv.config();

// Throw an immediate error if critical variables are missing
if (!process.env.MONGO_URI) {
  throw new Error("❌ CRITICAL: MONGO_URI is missing from .env");
}

export const env = process.env;