"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Connect to MongoDB Atlas
 *
 * This function is called when the server starts (in index.ts)
 * It reads MONGO_URI from the .env file
 */
const connectDB = async () => {
    try {
        console.log("🔄 Connecting to MongoDB...");
        console.log("Connection string:", process.env.MONGO_URI?.substring(0, 50) + "...");
        const conn = await mongoose_1.default.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        console.error(`❌ MongoDB connection failed: ${error.message}`);
        console.error("Stack:", error.stack);
        process.exit(1); // Stop the server if connection fails
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map