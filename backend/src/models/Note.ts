import mongoose from "mongoose";

/**
 * Note Schema
 * Represents a sticky note shared between couple members
 * Notes are private per couple — each couple only sees their own notes
 */
const noteSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
      indexed: true, // Fast lookups: "give me all notes for couple XYZ"
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "yellow", // e.g., 'yellow', 'pink', 'blue'
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Note = mongoose.model("Note", noteSchema);
