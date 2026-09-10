import { Router, Request, Response } from "express";
import { Event } from "../models/Event";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const events = await Event.find({ coupleId }).sort({ date: 1 });
    return res.json(events);
  } catch (error: any) {
    console.error("Get events error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, date, notes, isCountdown } = req.body;
    const userId = req.user?.userId;
    const coupleId = req.user?.coupleId;

    if (!userId || !coupleId) {
      return res.status(400).json({ error: "User is not authorized" });
    }
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Event title is required" });
    }
    if (!date || Number.isNaN(Date.parse(date))) {
      return res.status(400).json({ error: "A valid event date is required" });
    }
    if (notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({ error: "Event notes must be a string" });
    }
    if (typeof isCountdown !== "boolean") {
      return res.status(400).json({ error: "isCountdown must be a boolean" });
    }

    const event = await Event.create({
      coupleId,
      title: title.trim(),
      date: new Date(date),
      notes: notes?.trim() || "",
      isCountdown,
      createdBy: userId,
    });

    return res.status(201).json(event);
  } catch (error: any) {
    console.error("Create event error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const event = await Event.findOneAndDelete({ _id: req.params.id, coupleId });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json({ message: "Event deleted successfully" });
  } catch (error: any) {
    console.error("Delete event error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

export default router;
