import mongoose from "mongoose";
let connecting: Promise<typeof mongoose> | undefined;
export async function connectDB(uri = process.env.MONGO_URI || process.env.MONGODB_URI) {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!uri) throw new Error("MONGO_URI is required");
  if (!connecting) connecting = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000, maxPoolSize: 10,
  }).finally(() => { connecting = undefined; });
  return connecting;
}
