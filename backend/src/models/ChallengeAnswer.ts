import mongoose from "mongoose";

const challengeAnswerSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
      indexed: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChallengeQuestion",
      required: true,
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answerText: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

challengeAnswerSchema.index(
  { coupleId: 1, questionId: 1, answeredBy: 1, date: 1 },
  { unique: true },
);

export const ChallengeAnswer = mongoose.model(
  "ChallengeAnswer",
  challengeAnswerSchema,
);
