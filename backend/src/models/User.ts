import mongoose from "mongoose";

/**
 * User Schema
 * Represents a registered user in the Lovelle app
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // No two users can have the same email
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      default: null, // User hasn't joined/created a couple yet
    },
    pushToken: {
      type: String,
      default: null, // For push notifications (Heartbeat feature, planned)
    },
  },
  { timestamps: true }, // Adds createdAt and updatedAt automatically
);

// Hide password when converting user to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model("User", userSchema);
