"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DrawingStroke_1 = require("../models/DrawingStroke");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/strokes", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId)
            return res.status(400).json({ error: "User is not in a couple" });
        const strokes = await DrawingStroke_1.DrawingStroke.find({ coupleId }).sort({ createdAt: 1 });
        return res.json(strokes);
    }
    catch (error) {
        console.error("Get drawing strokes error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.delete("/strokes", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId)
            return res.status(400).json({ error: "User is not in a couple" });
        const result = await DrawingStroke_1.DrawingStroke.deleteMany({ coupleId });
        const io = req.app.get("io");
        io?.to(`couple:${coupleId}`).emit("board-cleared");
        return res.json({ message: "Drawing board cleared", deletedCount: result.deletedCount });
    }
    catch (error) {
        console.error("Clear drawing board error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=drawing.js.map