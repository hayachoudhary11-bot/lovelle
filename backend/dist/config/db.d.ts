import mongoose from "mongoose";
/**
 * Connect to MongoDB Atlas
 *
 * This function is called when the server starts (in index.ts)
 * It reads MONGO_URI from the .env file
 */
export declare const connectDB: () => Promise<typeof mongoose>;
//# sourceMappingURL=db.d.ts.map