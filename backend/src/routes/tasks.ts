import mongoose from "mongoose";
import { Router, Request, Response } from "express";
import { Task } from "../models/Task";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const tasks = await Task.find({ coupleId }).sort({
      done: 1,
      createdAt: -1,
    });
    return res.json(tasks);
  } catch (error: any) {
    console.error("Get tasks error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const userId = req.user?.userId;
    const coupleId = req.user?.coupleId;

    if (!userId || !coupleId) {
      return res.status(400).json({ error: "User is not authorized" });
    }
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Task text is required" });
    }

    const task = await Task.create({
      coupleId,
      text: text.trim(),
      createdBy: userId,
      done: false,
      doneBy: null,
    });

    return res.status(201).json(task);
  } catch (error: any) {
    console.error("Create task error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const coupleId = req.user?.coupleId;
    if (!userId || !coupleId) {
      return res.status(400).json({ error: "User is not authorized" });
    }

    const task = await Task.findOne({ _id: req.params.id, coupleId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.done = !task.done;
    task.doneBy = task.done ? new mongoose.Types.ObjectId(userId) : null;
    await task.save();

    return res.json(task);
  } catch (error: any) {
    console.error("Toggle task error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, coupleId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    console.error("Delete task error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

export default router;
