"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = require("express");
const Task_1 = require("../models/Task");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) {
            return res.status(400).json({ error: "User is not in a couple" });
        }
        const tasks = await Task_1.Task.find({ coupleId }).sort({
            done: 1,
            createdAt: -1,
        });
        return res.json(tasks);
    }
    catch (error) {
        console.error("Get tasks error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.post("/", async (req, res) => {
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
        const task = await Task_1.Task.create({
            coupleId,
            text: text.trim(),
            createdBy: userId,
            done: false,
            doneBy: null,
        });
        return res.status(201).json(task);
    }
    catch (error) {
        console.error("Create task error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.patch("/:id", async (req, res) => {
    try {
        const userId = req.user?.userId;
        const coupleId = req.user?.coupleId;
        if (!userId || !coupleId) {
            return res.status(400).json({ error: "User is not authorized" });
        }
        const task = await Task_1.Task.findOne({ _id: req.params.id, coupleId });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        task.done = !task.done;
        task.doneBy = task.done ? new mongoose_1.default.Types.ObjectId(userId) : null;
        await task.save();
        return res.json(task);
    }
    catch (error) {
        console.error("Toggle task error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) {
            return res.status(400).json({ error: "User is not in a couple" });
        }
        const task = await Task_1.Task.findOneAndDelete({ _id: req.params.id, coupleId });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        return res.json({ message: "Task deleted successfully" });
    }
    catch (error) {
        console.error("Delete task error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=tasks.js.map