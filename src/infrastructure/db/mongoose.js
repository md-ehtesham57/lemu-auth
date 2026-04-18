import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'lemu-auth',
      maxPoolSize: 100, // Allows more concurrent connections
      minPoolSize: 10,
    });
    console.log("🍃 MongoDB Connected...");
  } catch (err) {
    console.error("Connection failed", err);
    process.exit(1);
  }
};
