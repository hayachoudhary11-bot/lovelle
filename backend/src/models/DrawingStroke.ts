import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false },
);

const drawingStrokeSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
      indexed: true,
    },
    points: {
      type: [pointSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) => value.length > 0,
        message: "A stroke must contain at least one point",
      },
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    strokeWidth: {
      type: Number,
      required: true,
      min: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const DrawingStroke = mongoose.model("DrawingStroke", drawingStrokeSchema);
