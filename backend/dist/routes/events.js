"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Event_1 = require("../models/Event");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) {
            return res.status(400).json({ error: "User is not in a couple" });
        }
        const events = await Event_1.Event.find({ coupleId }).sort({ date: 1 });
        return res.json(events);
    }
    catch (error) {
        console.error("Get events error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.post("/", async (req, res) => {
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
        const event = await Event_1.Event.create({
            coupleId,
            title: title.trim(),
            date: new Date(date),
            notes: notes?.trim() || "",
            isCountdown,
            createdBy: userId,
        });
        return res.status(201).json(event);
    }
    catch (error) {
        console.error("Create event error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) {
            return res.status(400).json({ error: "User is not in a couple" });
        }
        const event = await Event_1.Event.findOneAndDelete({ _id: req.params.id, coupleId });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        return res.json({ message: "Event deleted successfully" });
    }
    catch (error) {
        console.error("Delete event error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map