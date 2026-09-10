"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Couple_1 = require("../models/Couple");
const Photo_1 = require("../models/Photo");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.post("/featured-photo", async (req, res) => {
    try {
        const { photoId } = req.body;
        const coupleId = req.user?.coupleId;
        if (!coupleId) {
            return res.status(400).json({ error: "User is not in a couple" });
        }
        if (!photoId || typeof photoId !== "string") {
            return res.status(400).json({ error: "photoId is required" });
        }
        const photo = await Photo_1.Photo.findOne({ _id: photoId, coupleId });
        if (!photo) {
            return res.status(404).json({ error: "Photo not found in your couple" });
        }
        const couple = await Couple_1.Couple.findByIdAndUpdate(coupleId, { featuredPhotoId: photo._id }, { new: true });
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
    }
    catch (error) {
        console.error("Set featured photo error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=couples.js.map