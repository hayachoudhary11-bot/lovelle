import mongoose from "mongoose";

const promptAnswerSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
      indexed: true,
    },
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
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

promptAnswerSchema.index(
  { coupleId: 1, promptId: 1, answeredBy: 1, date: 1 },
  { unique: true },
);

export const PromptAnswer = mongoose.model("PromptAnswer", promptAnswerSchema);
