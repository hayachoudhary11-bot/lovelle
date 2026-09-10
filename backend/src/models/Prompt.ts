import mongoose from "mongoose";

const promptSchema = new mongoose.Schema(
  {
    promptText: {
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

export const Prompt = mongoose.model("Prompt", promptSchema);
