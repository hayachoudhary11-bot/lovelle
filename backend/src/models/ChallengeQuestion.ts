import mongoose from "mongoose";

const challengeQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: null,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const ChallengeQuestion = mongoose.model(
  "ChallengeQuestion",
  challengeQuestionSchema,
);
