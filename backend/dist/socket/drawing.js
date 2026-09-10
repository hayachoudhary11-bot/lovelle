"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDrawingSocket = registerDrawingSocket;
const DrawingStroke_1 = require("../models/DrawingStroke");
const Message_1 = require("../models/Message");
const auth_1 = require("../middleware/auth");
function isStrokePayload(payload) {
    if (!payload || typeof payload !== "object")
        return false;
    const stroke = payload;
    return (Array.isArray(stroke.points) &&
        stroke.points.length > 0 &&
        stroke.points.every((point) => point &&
            typeof point.x === "number" &&
            Number.isFinite(point.x) &&
            typeof point.y === "number" &&
            Number.isFinite(point.y)) &&
        typeof stroke.color === "string" &&
        stroke.color.trim().length > 0 &&
        typeof stroke.strokeWidth === "number" &&
        Number.isFinite(stroke.strokeWidth) &&
        stroke.strokeWidth > 0);
}
function isMessagePayload(payload) {
    return !!payload && typeof payload === "object" && typeof payload.text === "string";
}
function serializeMessage(message) {
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
function getToken(socket) {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === "string")
        return authToken;
    const authorization = socket.handshake.headers.authorization;
    if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
        return authorization.substring(7);
    }
    return null;
}
function registerDrawingSocket(io) {
    io.use((socket, next) => {
        try {
            const token = getToken(socket);
            if (!token)
                return next(new Error("Missing authentication token"));
            const decoded = (0, auth_1.verifyToken)(token);
            if (!decoded.userId || !decoded.coupleId)
                return next(new Error("User is not in a couple"));
            socket.user = {
                userId: decoded.userId,
                coupleId: decoded.coupleId,
            };
            return next();
        }
        catch {
            return next(new Error("Invalid or expired token"));
        }
    });
    io.on("connection", (rawSocket) => {
        const socket = rawSocket;
        const room = `couple:${socket.user.coupleId}`;
        socket.join(room);
        socket.on("join-board", () => {
            socket.join(room);
            socket.emit("board-joined", { room });
        });
        socket.on("stroke", async (payload, callback) => {
            if (!isStrokePayload(payload)) {
                callback?.({ error: "Invalid stroke payload" });
                return;
            }
            try {
                const savedStroke = await DrawingStroke_1.DrawingStroke.create({
                    coupleId: socket.user.coupleId,
                    points: payload.points,
                    color: payload.color.trim(),
                    strokeWidth: payload.strokeWidth,
                    createdBy: socket.user.userId,
                });
                socket.to(room).emit("stroke", savedStroke);
                callback?.({ stroke: savedStroke });
            }
            catch (error) {
                console.error("Save drawing stroke error:", error);
                callback?.({ error: "Could not save stroke" });
            }
        });
        socket.on("clear-board", async (callback) => {
            try {
                await DrawingStroke_1.DrawingStroke.deleteMany({ coupleId: socket.user.coupleId });
                io.to(room).emit("board-cleared");
                callback?.({});
            }
            catch (error) {
                console.error("Clear drawing board error:", error);
                callback?.({ error: "Could not clear board" });
            }
        });
        socket.on("send-message", async (payload, callback) => {
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
                const savedMessage = await Message_1.Message.create({
                    coupleId: socket.user.coupleId,
                    senderId: socket.user.userId,
                    text,
                });
                const serializedMessage = serializeMessage(savedMessage.toObject());
                socket.to(room).emit("new-message", serializedMessage);
                socket.emit("new-message", serializedMessage);
                callback?.({ message: serializedMessage });
            }
            catch (error) {
                console.error("Save message error:", error);
                callback?.({ error: "Could not save message" });
            }
        });
    });
}
//# sourceMappingURL=drawing.js.map