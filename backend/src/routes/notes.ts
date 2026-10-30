import { sendError } from "../middleware/errors";
import { Router, Request, Response } from "express";
import { Note } from "../models/Note";
import { authMiddleware } from "../middleware/auth";


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
    return sendError(res, error);
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
    return sendError(res, error);
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

    const note = await Note.findOneAndDelete({ _id: noteId, coupleId: userCoupleId });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.json({ message: "Note deleted successfully" });
  } catch (error: any) {
    return sendError(res, error);
  }
});

export default router;
