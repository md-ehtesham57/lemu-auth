import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("CRITICAL: MONGO_URI is missing from .env");
}

if (!process.env.JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET is missing from .env");
}

export const env = process.env;
