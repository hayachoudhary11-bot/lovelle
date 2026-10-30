import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/mongo-adapter";
import { AppConfig } from "./config/env";
import { connectDB } from "./config/db";
import { errorHandler, HttpError } from "./middleware/errors";
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";
import drawingRoutes from "./routes/drawing";
import messagesRoutes from "./routes/messages";
import photosRoutes from "./routes/photos";
import eventsRoutes from "./routes/events";
import tasksRoutes from "./routes/tasks";
import promptsRoutes from "./routes/prompts";
import challengesRoutes from "./routes/challenges";
import couplesRoutes from "./routes/couples";
import { registerDrawingSocket } from "./socket/drawing";

export function createApplication(config: AppConfig) {
  const app = express();
  const server = http.createServer(app);
  const allowedOrigin = (origin?: string) => !origin || config.origins.includes(origin);
  const io = new Server(server, {
    transports: ["websocket"], maxHttpBufferSize: 128 * 1024,
    cors: { origin: config.origins },
    allowRequest: (req, callback) => callback(null, allowedOrigin(req.headers.origin)),
  });
  let initialized: Promise<void> | undefined;
  const ready = () => {
    if (!initialized) {
      initialized = (async () => {
        await connectDB(config.mongoUri);
        if (config.distributed) {
          const collection = mongoose.connection.db!.collection("socket_events");
          await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
          io.adapter(createAdapter(collection, { addCreatedAtField: true }));
        }
      })().catch((error) => { initialized = undefined; throw error; });
    }
    return initialized;
  };
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);
  app.use(helmet());
  app.use(cors({ origin: (origin, callback) => callback(allowedOrigin(origin) ? null : new HttpError(403, "Origin not allowed"), allowedOrigin(origin)) }));
  app.use((_req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); });
  app.use(express.json({ limit: "128kb" }));
  app.use((req, _res, next) => {
    // Bodyless actions such as PATCH /tasks/:id toggle state without a payload.
    if (req.body === undefined) req.body = {};
    if (["POST", "PUT", "PATCH"].includes(req.method) && (!req.body || Array.isArray(req.body) || typeof req.body !== "object")) return next(new HttpError(400, "A JSON object body is required"));
    next();
  });
  app.get("/health", async (_req, res) => {
    try { await ready(); await mongoose.connection.db!.admin().ping(); res.json({ status: "ok" }); }
    catch { res.status(503).json({ status: "unavailable" }); }
  });
  app.use(async (_req, res, next) => {
    try { await ready(); next(); } catch { res.status(503).json({ error: "Service temporarily unavailable" }); }
  });
  app.use("/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-8", legacyHeaders: false, skip: (req) => req.method === "GET", message: { error: "Too many attempts. Please try again later." } }));
  app.use("/auth", authRoutes);
  app.use("/notes", notesRoutes);
  app.use("/drawing", drawingRoutes);
  app.use("/messages", messagesRoutes);
  app.use("/photos", photosRoutes);
  app.use("/events", eventsRoutes);
  app.use("/tasks", tasksRoutes);
  app.use("/prompts", promptsRoutes);
  app.use("/challenges", challengesRoutes);
  app.use("/couples", couplesRoutes);
  app.set("io", io);
  io.use(async (_socket, next) => { try { await ready(); next(); } catch { next(new Error("Service temporarily unavailable")); } });
  registerDrawingSocket(io);
  app.use((_req, res) => { res.status(404).json({ error: "Route not found" }); });
  app.use(errorHandler);
  return { app, server, io, ready };
}
