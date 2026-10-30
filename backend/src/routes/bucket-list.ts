import { sendError } from "../middleware/errors";
import mongoose from "mongoose";
import { Router, Request, Response } from "express";
import { BucketListItem } from "../models/BucketListItem";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const items = await BucketListItem.find({ coupleId }).sort({
      done: 1,
      createdAt: -1,
    });
    return res.json(items);
  } catch (error: any) {
    return sendError(res, error);
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
      return res.status(400).json({ error: "Bucket list item text is required" });
    }

    const item = await BucketListItem.create({
      coupleId,
      text: text.trim(),
      createdBy: userId,
      done: false,
      doneBy: null,
    });

    return res.status(201).json(item);
  } catch (error: any) {
    return sendError(res, error);
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const coupleId = req.user?.coupleId;
    if (!userId || !coupleId) {
      return res.status(400).json({ error: "User is not authorized" });
    }

    const item = await BucketListItem.findOne({ _id: req.params.id, coupleId });
    if (!item) {
      return res.status(404).json({ error: "Bucket list item not found" });
    }

    item.done = !item.done;
    item.doneBy = item.done ? new mongoose.Types.ObjectId(userId) : null;
    await item.save();

    return res.json(item);
  } catch (error: any) {
    return sendError(res, error);
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const item = await BucketListItem.findOneAndDelete({ _id: req.params.id, coupleId });
    if (!item) {
      return res.status(404).json({ error: "Bucket list item not found" });
    }

    return res.json({ message: "Bucket list item deleted successfully" });
  } catch (error: any) {
    return sendError(res, error);
  }
});

export default router;
