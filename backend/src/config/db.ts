import mongoose from "mongoose";

/**
 * Connect to MongoDB Atlas
 *
 * This function is called when the server starts (in index.ts)
 * It reads MONGO_URI from the .env file
 */
export const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log(
      "Connection string:",
      process.env.MONGO_URI?.substring(0, 50) + "...",
    );

    const conn = await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error("Stack:", error.stack);
    process.exit(1); // Stop the server if connection fails
  }
};
