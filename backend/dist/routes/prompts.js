"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Couple_1 = require("../models/Couple");
const Prompt_1 = require("../models/Prompt");
const PromptAnswer_1 = require("../models/PromptAnswer");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
function getDateKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
}
function getDayStart(dateKey) {
    return new Date(`${dateKey}T00:00:00.000Z`);
}
function selectPromptIndex(dateKey, coupleId, promptCount) {
    let hash = 0;
    for (const character of `${dateKey}:${coupleId}`) {
        hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }
    return hash % promptCount;
}
async function getTodaysPrompt(coupleId) {
    const activePrompts = await Prompt_1.Prompt.find({ active: true }).sort({ _id: 1 });
    if (!activePrompts.length)
        return null;
    const dateKey = getDateKey();
    return {
        prompt: activePrompts[selectPromptIndex(dateKey, coupleId, activePrompts.length)],
        dateKey,
    };
}
router.get("/today", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        const userId = req.user?.userId;
        if (!coupleId || !userId)
            return res.status(400).json({ error: "User is not in a couple" });
        const couple = await Couple_1.Couple.findById(coupleId).select("members");
        const todaysPrompt = await getTodaysPrompt(coupleId);
        if (!todaysPrompt)
            return res.status(404).json({ error: "No active prompts found" });
        const answers = await PromptAnswer_1.PromptAnswer.find({
            coupleId,
            promptId: todaysPrompt.prompt._id,
            date: getDayStart(todaysPrompt.dateKey),
        }).select("answeredBy answerText");
        const answerByUser = new Map(answers.map((answer) => [answer.answeredBy.toString(), answer.answerText]));
        const bothAnswered = (couple?.members.length || 0) >= 2 && couple.members.every((member) => answerByUser.has(member.toString()));
        return res.json({
            date: todaysPrompt.dateKey,
            prompt: todaysPrompt.prompt,
            answered: Boolean(answerByUser.get(userId)),
            partnerAnswered: answers.some((answer) => answer.answeredBy.toString() !== userId),
            bothAnswered,
            answers: bothAnswered
                ? answers.map((answer) => ({ answeredBy: answer.answeredBy, answerText: answer.answerText }))
                : undefined,
        });
    }
    catch (error) {
        console.error("Get today's prompt error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.post("/answer", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        const userId = req.user?.userId;
        const { answerText } = req.body;
        if (!coupleId || !userId)
            return res.status(400).json({ error: "User is not in a couple" });
        if (!answerText || typeof answerText !== "string" || !answerText.trim()) {
            return res.status(400).json({ error: "Answer text is required" });
        }
        const todaysPrompt = await getTodaysPrompt(coupleId);
        if (!todaysPrompt)
            return res.status(404).json({ error: "No active prompts found" });
        const date = getDayStart(todaysPrompt.dateKey);
        const answer = await PromptAnswer_1.PromptAnswer.findOneAndUpdate({ coupleId, promptId: todaysPrompt.prompt._id, answeredBy: userId, date }, { $set: { answerText: answerText.trim() } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        return res.status(201).json({ answer });
    }
    catch (error) {
        console.error("Submit prompt answer error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
router.get("/history", async (req, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId)
            return res.status(400).json({ error: "User is not in a couple" });
        const answers = await PromptAnswer_1.PromptAnswer.find({ coupleId })
            .sort({ date: -1 })
            .populate("promptId", "promptText category")
            .populate("answeredBy", "name email");
        const history = new Map();
        for (const answer of answers) {
            const key = `${answer.promptId._id.toString()}:${answer.date.toISOString()}`;
            if (!history.has(key)) {
                history.set(key, { date: answer.date, prompt: answer.promptId, answers: [] });
            }
            history.get(key).answers.push({ answeredBy: answer.answeredBy, answerText: answer.answerText });
        }
        return res.json(Array.from(history.values()));
    }
    catch (error) {
        console.error("Get prompt history error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=prompts.js.map