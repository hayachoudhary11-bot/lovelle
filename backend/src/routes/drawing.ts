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
    console.error("Get drawing strokes error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
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
    console.error("Clear drawing board error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

export default router;
