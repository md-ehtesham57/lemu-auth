import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'lemu-auth',
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    });
    console.log("🍃 MongoDB Connected...");
  } catch (err) {
    console.error("Connection failed", err);
    process.exit(1);
  }
};
