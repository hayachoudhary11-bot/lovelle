import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
      indexed: true,
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    thumbUrl: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      default: "",
      trim: true,
    },
    width: {
      type: Number,
      required: true,
      min: 1,
    },
    height: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true },
);

export const Photo = mongoose.model("Photo", photoSchema);
