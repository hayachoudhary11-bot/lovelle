import { sendError } from "../middleware/errors";
import { Router, Request, Response } from "express";
import { Message } from "../models/Message";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/history", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;

    if (!coupleId) {
      return res.status(400).json({ error: "User is not in a couple" });
    }

    const messages = await Message.find({ coupleId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name");

    return res.json(messages);
  } catch (error: any) {
    return sendError(res, error);
  }
});

export default router;
