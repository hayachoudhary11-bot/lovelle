import { Server, Socket } from "socket.io";
import { DrawingStroke } from "../models/DrawingStroke";
import { Message } from "../models/Message";
import { authenticateToken } from "../middleware/auth";

type AuthenticatedSocket = Socket & {
  user: { userId: string; coupleId: string };
};

import { isStrokePayload } from "../validation";
type MessagePayload = { text: string };

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
  io.use(async (socket, next) => {
    try {
      const token = getToken(socket);
      if (!token) return next(new Error("Missing authentication token"));
      const decoded = await authenticateToken(token);
      if (!decoded.userId || !decoded.coupleId) return next(new Error("User is not in a couple"));
      (socket as AuthenticatedSocket).user = {
        userId: decoded.userId,
        coupleId: decoded.coupleId,
      };
      if (decoded.exp) {
        const expires = setTimeout(() => socket.disconnect(true), Math.min(decoded.exp * 1000 - Date.now(), 2147483647));
        expires.unref();
        socket.once("disconnect", () => clearTimeout(expires));
      }
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
      const ack = typeof callback === "function" ? callback : () => {};
      if (!isStrokePayload(payload)) {
        ack({ error: "Invalid stroke payload" });
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
        ack({ stroke: savedStroke });
      } catch (error) {
        console.error("Save drawing stroke error:");
        ack({ error: "Could not save stroke" });
      }
    });

    socket.on("clear-board", async (callback?: (response: { error?: string }) => void) => {
      const ack = typeof callback === "function" ? callback : () => {};
      try {
        await DrawingStroke.deleteMany({ coupleId: socket.user.coupleId });
        io.to(room).emit("board-cleared");
        ack({});
      } catch (error) {
        console.error("Clear drawing board error:");
        ack({ error: "Could not clear board" });
      }
    });

    socket.on("send-message", async (payload: unknown, callback?: (response: { error?: string; message?: unknown }) => void) => {
      const ack = typeof callback === "function" ? callback : () => {};
      if (!isMessagePayload(payload)) {
        ack({ error: "Invalid message payload" });
        return;
      }

      const text = payload.text.trim();
      if (!text || text.length > 5000) {
        ack({ error: "Message must contain 1-5000 characters" });
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
        ack({ message: serializedMessage });
      } catch (error) {
        console.error("Save message error:");
        ack({ error: "Could not save message" });
      }
    });
  });
}
