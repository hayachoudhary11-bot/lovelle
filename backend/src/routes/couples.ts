import { Router, Request, Response } from "express";
import { Couple } from "../models/Couple";
import { Photo } from "../models/Photo";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

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

export default router;
