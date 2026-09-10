"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Photo_1 = require("../models/Photo");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) {
            return res.status(400).json({ error: "User is not in a couple" });
        }
        const photos = await Photo_1.Photo.find({ coupleId }).sort({ createdAt: -1 });
        return res.json(photos);
    }
    catch (error) {
        console.error("Get photos error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { cloudinaryPublicId, url, thumbUrl, width, height, caption, } = req.body;
        const coupleId = req.user?.coupleId;
        const uploaderId = req.user?.userId;
        if (!coupleId || !uploaderId) {
            return res.status(400).json({ error: "User is not authorized" });
        }
        if (!cloudinaryPublicId || typeof cloudinaryPublicId !== "string") {
            return res.status(400).json({ error: "cloudinaryPublicId is required" });
        }
        if (!url || typeof url !== "string") {
            return res.status(400).json({ error: "Photo url is required" });
        }
        if (!thumbUrl || typeof thumbUrl !== "string") {
            return res.status(400).json({ error: "Photo thumbUrl is required" });
        }
        if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1) {
            return res.status(400).json({ error: "Photo width and height must be positive integers" });
        }
        if (caption !== undefined && typeof caption !== "string") {
            return res.status(400).json({ error: "Photo caption must be a string" });
        }
        const photo = await Photo_1.Photo.create({
            coupleId,
            uploaderId,
            cloudinaryPublicId: cloudinaryPublicId.trim(),
            url: url.trim(),
            thumbUrl: thumbUrl.trim(),
            caption: caption?.trim() || "",
            width,
            height,
        });
        return res.status(201).json(photo);
    }
    catch (error) {
        console.error("Save photo error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) {
            return res.status(400).json({ error: "User is not in a couple" });
        }
        const photo = await Photo_1.Photo.findOneAndDelete({ _id: req.params.id, coupleId });
        if (!photo) {
            return res.status(404).json({ error: "Photo not found" });
        }
        return res.json({ message: "Photo deleted successfully" });
    }
    catch (error) {
        console.error("Delete photo error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=photos.js.map