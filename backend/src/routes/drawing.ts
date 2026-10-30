import { isStrokePayload } from "../validation";
import { sendError } from "../middleware/errors";
import { Router, Request, Response } from "express";
import { DrawingStroke } from "../models/DrawingStroke";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/strokes", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) return res.status(400).json({ error: "User is not in a couple" });

    const strokes = await DrawingStroke.find({ coupleId }).sort({ createdAt: 1 });
    return res.json(strokes);
  } catch (error: any) {
    return sendError(res, error);
  }
});

router.post("/strokes", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    const userId = req.user?.userId;
    if (!coupleId || !userId) return res.status(400).json({ error: "User is not in a couple" });

    const { points, color, strokeWidth } = req.body;
    if (!isStrokePayload({ points, color: color ?? "#333", strokeWidth: strokeWidth ?? 3 })) {
      return res.status(400).json({ error: "Invalid drawing stroke" });
    }

    const stroke = await DrawingStroke.create({
      coupleId,
      points,
      color: color || "#333",
      strokeWidth: strokeWidth || 3,
      createdBy: userId,
    });

    req.app.get("io")?.to(`couple:${coupleId}`).emit("stroke", stroke);
    return res.status(201).json(stroke);
  } catch (error: any) {
    return sendError(res, error);
  }
});

router.delete("/strokes", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) return res.status(400).json({ error: "User is not in a couple" });

    const result = await DrawingStroke.deleteMany({ coupleId });
    const io = req.app.get("io");
    io?.to(`couple:${coupleId}`).emit("board-cleared");
    return res.json({ message: "Drawing board cleared", deletedCount: result.deletedCount });
  } catch (error: any) {
    return sendError(res, error);
  }
});

export default router;
