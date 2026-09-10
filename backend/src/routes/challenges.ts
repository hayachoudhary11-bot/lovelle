import { Router, Request, Response } from "express";
import { Couple } from "../models/Couple";
import { ChallengeQuestion } from "../models/ChallengeQuestion";
import { ChallengeAnswer } from "../models/ChallengeAnswer";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

function getDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function getDayStart(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function selectQuestionIndex(dateKey: string, coupleId: string, questionCount: number): number {
  let hash = 0;
  for (const character of `${dateKey}:${coupleId}`) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash % questionCount;
}

async function getTodaysQuestion(coupleId: string) {
  const activeQuestions = await ChallengeQuestion.find({ active: true }).sort({ _id: 1 });
  if (!activeQuestions.length) return null;
  const dateKey = getDateKey();
  return {
    question: activeQuestions[selectQuestionIndex(dateKey, coupleId, activeQuestions.length)],
    dateKey,
  };
}

router.get("/today", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    const userId = req.user?.userId;
    if (!coupleId || !userId) return res.status(400).json({ error: "User is not in a couple" });

    const couple = await Couple.findById(coupleId).select("members");
    const todaysQuestion = await getTodaysQuestion(coupleId);
    if (!todaysQuestion) return res.status(404).json({ error: "No active challenge questions found" });

    const answers = await ChallengeAnswer.find({
      coupleId,
      questionId: todaysQuestion.question._id,
      date: getDayStart(todaysQuestion.dateKey),
    }).select("answeredBy answerText");
    const answerByUser = new Map(answers.map((answer) => [answer.answeredBy.toString(), answer.answerText]));
    const bothAnswered = (couple?.members.length || 0) >= 2 && couple!.members.every((member) => answerByUser.has(member.toString()));

    return res.json({
      date: todaysQuestion.dateKey,
      question: todaysQuestion.question,
      answered: Boolean(answerByUser.get(userId)),
      partnerAnswered: answers.some((answer) => answer.answeredBy.toString() !== userId),
      bothAnswered,
      answers: bothAnswered
        ? answers.map((answer) => ({ answeredBy: answer.answeredBy, answerText: answer.answerText }))
        : undefined,
    });
  } catch (error: any) {
    console.error("Get today's challenge error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

router.post("/answer", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    const userId = req.user?.userId;
    const { answerText } = req.body;
    if (!coupleId || !userId) return res.status(400).json({ error: "User is not in a couple" });
    if (!answerText || typeof answerText !== "string" || !answerText.trim()) {
      return res.status(400).json({ error: "Answer text is required" });
    }

    const todaysQuestion = await getTodaysQuestion(coupleId);
    if (!todaysQuestion) return res.status(404).json({ error: "No active challenge questions found" });
    const date = getDayStart(todaysQuestion.dateKey);
    const answer = await ChallengeAnswer.findOneAndUpdate(
      { coupleId, questionId: todaysQuestion.question._id, answeredBy: userId, date },
      { $set: { answerText: answerText.trim() } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return res.status(201).json({ answer });
  } catch (error: any) {
    console.error("Submit challenge answer error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

router.get("/history", async (req: Request, res: Response) => {
  try {
    const coupleId = req.user?.coupleId;
    if (!coupleId) return res.status(400).json({ error: "User is not in a couple" });

    const answers = await ChallengeAnswer.find({ coupleId })
      .sort({ date: -1 })
      .populate("questionId", "questionText category")
      .populate("answeredBy", "name email");
    const history = new Map<string, any>();
    for (const answer of answers) {
      const key = `${answer.questionId._id.toString()}:${answer.date.toISOString()}`;
      if (!history.has(key)) {
        history.set(key, { date: answer.date, question: answer.questionId, answers: [] });
      }
      history.get(key).answers.push({ answeredBy: answer.answeredBy, answerText: answer.answerText });
    }
    return res.json(Array.from(history.values()));
  } catch (error: any) {
    console.error("Get challenge history error:", error.message);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

export default router;
