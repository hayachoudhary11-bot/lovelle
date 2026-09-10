import mongoose from "mongoose";

/**
 * Couple Schema
 * Represents a couple and their shared data
 * All features (notes, gallery, etc.) are tagged with coupleId to keep data private
 */
const coupleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null, // Optional, e.g. "Alex & Sam"
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      validate: {
        validator: function (v: any) {
          return v.length <= 2; // Max 2 members per couple
        },
        message: "A couple can have at most 2 members",
      },
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },
    // Photo Frame feature (planned)
    featuredPhotoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      default: null,
    },
    // Days Together feature (planned)
    relationshipStartDate: {
      type: Date,
      default: null, // Set later during onboarding or settings
    },
    // Daily Streak feature (planned)
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastNoteDate: {
      type: Date,
      default: null, // Last date a note was posted (used for streak calculation)
    },
  },
  { timestamps: true },
);

export const Couple = mongoose.model("Couple", coupleSchema);
