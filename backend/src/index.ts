import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";
import drawingRoutes from "./routes/drawing";
import messagesRoutes from "./routes/messages";
import photosRoutes from "./routes/photos";
import eventsRoutes from "./routes/events";
import tasksRoutes from "./routes/tasks";
import { registerDrawingSocket } from "./socket/drawing";

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8081", "http://localhost:3000"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 4000;

const logRegisteredRoutes = () => {
  const stack = (app as any)._router?.stack ?? [];

  console.log("\nRegistered routes:");
  for (const layer of stack) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map((method) => method.toUpperCase())
        .join(", ");
      console.log(`- ${methods} ${layer.route.path}`);
    } else if (layer.name === "router") {
      console.log(`- ROUTER ${String(layer.regexp)}`);
    }
  }
};

// ============ MIDDLEWARE ============

// CORS: Allow requests from the mobile app (Expo uses http://localhost:8081 during dev)
app.use(
  cors({
    origin: ["http://localhost:8081", "http://localhost:3000"], // Add your mobile app URL here
    credentials: true,
  }),
);

// JSON parser: automatically parse request bodies as JSON
app.use(express.json());

// ============ ROUTES ============

// Health check endpoint (useful for debugging)
app.get("/health", (req, res) => {
  res.json({ status: "Backend is running ✅" });
});

// Auth routes (signup, login, create/join couple)
app.use("/auth", authRoutes);

// Notes routes (protected by JWT)
app.use("/notes", notesRoutes);
app.use("/drawing", drawingRoutes);
app.use("/messages", messagesRoutes);
app.use("/photos", photosRoutes);
app.use("/events", eventsRoutes);
app.use("/tasks", tasksRoutes);

app.set("io", io);
registerDrawingSocket(io);

// Temporary sanity-check route to confirm Express is accepting routes at all
app.get("/notes-test", (req, res) => {
  res.json({ ok: true, message: "Notes test route is working" });
});

// ============ START SERVER ============

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    server.listen(PORT, () => {
      logRegisteredRoutes();
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Try: curl http://localhost:${PORT}/health\n`);
    });
  } catch (error: any) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
