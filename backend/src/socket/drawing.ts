import { Server, Socket } from "socket.io";
import { DrawingStroke } from "../models/DrawingStroke";
import { Message } from "../models/Message";
import { verifyToken } from "../middleware/auth";

type AuthenticatedSocket = Socket & {
  user: { userId: string; coupleId: string };
};

type Point = { x: number; y: number };
type StrokePayload = {
  points: Point[];
  color: string;
  strokeWidth: number;
};
type MessagePayload = {
  text: string;
};

function isStrokePayload(payload: unknown): payload is StrokePayload {
  if (!payload || typeof payload !== "object") return false;
  const stroke = payload as Partial<StrokePayload>;
  return (
    Array.isArray(stroke.points) &&
    stroke.points.length > 0 &&
    stroke.points.every(
      (point) =>
        point &&
        typeof point.x === "number" &&
        Number.isFinite(point.x) &&
        typeof point.y === "number" &&
        Number.isFinite(point.y),
    ) &&
    typeof stroke.color === "string" &&
    stroke.color.trim().length > 0 &&
    typeof stroke.strokeWidth === "number" &&
    Number.isFinite(stroke.strokeWidth) &&
    stroke.strokeWidth > 0
  );
}

function isMessagePayload(payload: unknown): payload is MessagePayload {
  return !!payload && typeof payload === "object" && typeof (payload as { text?: unknown }).text === "string";
}

function serializeMessage(message: any) {
  return {
    _id: message._id?.toString?.() ?? message._id,
    coupleId: message.coupleId?.toString?.() ?? message.coupleId,
    senderId: message.senderId?.toString?.() ?? message.senderId,
    text: message.text,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    readAt: message.readAt ?? null,
  };
}

function getToken(socket: Socket): string | null {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string") return authToken;
  const authorization = socket.handshake.headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    return authorization.substring(7);
  }
  return null;
}

export function registerDrawingSocket(io: Server) {
  io.use((socket, next) => {
    try {
      const token = getToken(socket);
      if (!token) return next(new Error("Missing authentication token"));
      const decoded = verifyToken(token);
      if (!decoded.userId || !decoded.coupleId) return next(new Error("User is not in a couple"));
      (socket as AuthenticatedSocket).user = {
        userId: decoded.userId,
        coupleId: decoded.coupleId,
      };
      return next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const room = `couple:${socket.user.coupleId}`;
    socket.join(room);

    socket.on("join-board", () => {
      socket.join(room);
      socket.emit("board-joined", { room });
    });

    socket.on("stroke", async (payload: unknown, callback?: (response: { error?: string; stroke?: unknown }) => void) => {
      if (!isStrokePayload(payload)) {
        callback?.({ error: "Invalid stroke payload" });
        return;
      }
      try {
        const savedStroke = await DrawingStroke.create({
          coupleId: socket.user.coupleId,
          points: payload.points,
          color: payload.color.trim(),
          strokeWidth: payload.strokeWidth,
          createdBy: socket.user.userId,
        });
        socket.to(room).emit("stroke", savedStroke);
        callback?.({ stroke: savedStroke });
      } catch (error) {
        console.error("Save drawing stroke error:", error);
        callback?.({ error: "Could not save stroke" });
      }
    });

    socket.on("clear-board", async (callback?: (response: { error?: string }) => void) => {
      try {
        await DrawingStroke.deleteMany({ coupleId: socket.user.coupleId });
        io.to(room).emit("board-cleared");
        callback?.({});
      } catch (error) {
        console.error("Clear drawing board error:", error);
        callback?.({ error: "Could not clear board" });
      }
    });

    socket.on("send-message", async (payload: unknown, callback?: (response: { error?: string; message?: unknown }) => void) => {
      if (!isMessagePayload(payload)) {
        callback?.({ error: "Invalid message payload" });
        return;
      }

      const text = payload.text.trim();
      if (!text) {
        callback?.({ error: "Message text is required" });
        return;
      }

      try {
        const savedMessage = await Message.create({
          coupleId: socket.user.coupleId,
          senderId: socket.user.userId,
          text,
        });

        const serializedMessage = serializeMessage(savedMessage.toObject());
        socket.to(room).emit("new-message", serializedMessage);
        socket.emit("new-message", serializedMessage);
        callback?.({ message: serializedMessage });
      } catch (error) {
        console.error("Save message error:", error);
        callback?.({ error: "Could not save message" });
      }
    });
  });
}
