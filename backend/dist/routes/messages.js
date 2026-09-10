"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Message_1 = require("../models/Message");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/history", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) {
            return res.status(400).json({ error: "User is not in a couple" });
        }
        const messages = await Message_1.Message.find({ coupleId })
            .sort({ createdAt: 1 })
            .populate("senderId", "name");
        return res.json(messages);
    }
    catch (error) {
        console.error("Get message history error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map