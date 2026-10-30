import { sendError } from "../middleware/errors";
import { Router, Request, Response } from "express";
import { Couple } from "../models/Couple";
import { Photo } from "../models/Photo";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

const getStartOfDay = (value: Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const handleFeaturedPhoto = async (req: Request, res: Response) => {
  try {
    const { photoId } = req.body;
    const coupleId = req.user?.coupleId;

    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }
    if (!photoId || typeof photoId !== "string") {
      return res.status(400).json({ error: "photoId is required" });
    }

    const photo = await Photo.findOne({ _id: photoId, coupleId });
    if (!photo) {
      return res.status(404).json({ error: "Photo not found in your couple" });
    }

    const couple = await Couple.findByIdAndUpdate(
      coupleId,
      { featuredPhotoId: photo._id },
      { returnDocument: "after" },
    );
    if (!couple) {
      return res.status(404).json({ error: "Couple not found" });
    }

    return res.json({
      couple: {
        id: couple._id,
        name: couple.name,
        featuredPhotoId: couple.featuredPhotoId,
      },
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};
router.post("/featured-photo", handleFeaturedPhoto);
router.patch("/featured-photo", handleFeaturedPhoto);

router.post("/activity", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const couple = await Couple.findById(coupleId);
    if (!couple) {
      return res.status(404).json({ error: "Couple not found" });
    }

    const now = new Date();
    const today = getStartOfDay(now);
    const previous = couple.lastActivityAt ? getStartOfDay(couple.lastActivityAt) : null;

    let nextStreak = 1;
    if (previous) {
      const diffDays = Math.round(
        (today.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) {
        nextStreak = Math.max(couple.currentStreak || 1, 1);
      } else if (diffDays === 1) {
        nextStreak = (couple.currentStreak || 1) + 1;
      }
    }

    couple.currentStreak = nextStreak;
    couple.longestStreak = Math.max(couple.longestStreak || 0, nextStreak);
    couple.lastActivityAt = now;
    await couple.save();

    return res.json({
      couple: {
        id: couple._id,
        currentStreak: couple.currentStreak,
        longestStreak: couple.longestStreak,
        lastActivityAt: couple.lastActivityAt,
      },
    });
  } catch (error: any) {
    return sendError(res, error);
  }
});

router.get("/status", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const couple = await Couple.findById(coupleId);
    if (!couple) {
      return res.status(404).json({ error: "Couple not found" });
    }

    return res.json({
      couple: {
        id: couple._id,
        currentStreak: couple.currentStreak,
        longestStreak: couple.longestStreak,
        lastActivityAt: couple.lastActivityAt,
      },
    });
  } catch (error: any) {
    return sendError(res, error);
  }
});

router.get("/activity/week", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const currentDay = new Date(now);
    currentDay.setHours(0, 0, 0, 0);

    const summary = new Map<string, number>();
    for (let index = 6; index >= 0; index -= 1) {
      const day = new Date(currentDay.getTime() - index * dayMs);
      const key = day.toISOString().slice(0, 10);
      summary.set(key, 0);
    }

    const start = new Date(currentDay.getTime() - 6 * dayMs);
    const filter = { coupleId, createdAt: { $gte: start, $lt: new Date(currentDay.getTime() + dayMs) } };
    const groups = await Promise.all([
      (await import("../models/Note")).Note.find(filter).select("createdAt").lean(),
      (await import("../models/Message")).Message.find(filter).select("createdAt").lean(),
      (await import("../models/Photo")).Photo.find(filter).select("createdAt").lean(),
      (await import("../models/Task")).Task.find(filter).select("createdAt").lean(),
      (await import("../models/Event")).Event.find(filter).select("createdAt").lean(),
      (await import("../models/BucketListItem")).BucketListItem.find(filter).select("createdAt").lean(),
    ]);
    for (const docs of groups) {
      for (const doc of docs) {
        const key = new Date(doc.createdAt).toISOString().slice(0, 10);
        if (summary.has(key)) summary.set(key, (summary.get(key) ?? 0) + 1);
      }
    }

    const activity = Array.from(summary.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return res.json({ activity });
  } catch (error: any) {
    return sendError(res, error);
  }
});

router.post("/status", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const { lastActiveAt } = req.body;
    const couple = await Couple.findById(coupleId);
    if (!couple) {
      return res.status(404).json({ error: "Couple not found" });
    }

    if (typeof lastActiveAt === "string" && lastActiveAt.trim().length > 0) {
      couple.lastActivityAt = new Date(lastActiveAt);
    }

    await couple.save();

    return res.json({
      couple: {
        id: couple._id,
        currentStreak: couple.currentStreak,
        longestStreak: couple.longestStreak,
        lastActivityAt: couple.lastActivityAt,
      },
    });
  } catch (error: any) {
    return sendError(res, error);
  }
});

export default router;
