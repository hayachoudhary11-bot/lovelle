import { Router, Request, Response } from "express";
import { Note } from "../models/Note";
import { authMiddleware } from "../middleware/auth";

console.log("[notes.ts] NOTE ROUTER FILE LOADED");

const router = Router();

router.use(authMiddleware);

/**
 * GET /notes
 * Return notes for the logged-in user's couple, newest first
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userCoupleId = req.user?.coupleId;

    if (!userCoupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const notes = await Note.find({ coupleId: userCoupleId })
      .sort({ createdAt: -1 })
      .populate("authorId", "name email");

    return res.json(notes);
  } catch (error: any) {
    console.error("Get notes error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

/**
 * POST /notes
 * Create a new note for the logged-in user's couple
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, color, pinned } = req.body;
    const userId = req.user?.userId;
    const userCoupleId = req.user?.coupleId;

    if (!userId || !userCoupleId) {
      return res.status(400).json({ error: "User is not authorized" });
    }

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Note text is required" });
    }

    const note = await Note.create({
      coupleId: userCoupleId,
      authorId: userId,
      text: text.trim(),
      color: color || "yellow",
      pinned: Boolean(pinned),
    });

    return res.status(201).json(note);
  } catch (error: any) {
    console.error("Create note error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

/**
 * DELETE /notes/:id
 * Only allow deleting notes from the user's couple
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;
    const userCoupleId = req.user?.coupleId;

    if (!userCoupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.coupleId.toString() !== userCoupleId.toString()) {
      return res.status(403).json({ error: "You do not own this note" });
    }

    await Note.findByIdAndDelete(noteId);

    return res.json({ message: "Note deleted successfully" });
  } catch (error: any) {
    console.error("Delete note error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

export default router;
