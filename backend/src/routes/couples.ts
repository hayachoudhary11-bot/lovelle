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
      { new: true },
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
    console.error("Set featured photo error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
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
    console.error("Create couple activity error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
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
    console.error("Get couple status error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
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

    const activityModels = [
      { model: (await import("../models/Note")).Note, name: "note" },
      { model: (await import("../models/Message")).Message, name: "message" },
      { model: (await import("../models/Photo")).Photo, name: "photo" },
      { model: (await import("../models/Task")).Task, name: "task" },
      { model: (await import("../models/Event")).Event, name: "event" },
      { model: (await import("../models/BucketListItem")).BucketListItem, name: "bucketList" },
    ];

    for (const entry of activityModels) {
      const start = new Date(currentDay.getTime() - 6 * dayMs);
      start.setHours(0, 0, 0, 0);
      const docs = await entry.model.find({
        coupleId,
        createdAt: { $gte: start, $lt: new Date(currentDay.getTime() + dayMs) },
      });

      for (const doc of docs) {
        const createdAt = new Date(doc.createdAt);
        const key = createdAt.toISOString().slice(0, 10);
        if (summary.has(key)) {
          summary.set(key, (summary.get(key) ?? 0) + 1);
        }
      }
    }

    const activity = Array.from(summary.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return res.json({ activity });
  } catch (error: any) {
    console.error("Get weekly activity error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
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
    console.error("Update couple status error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

export default router;
