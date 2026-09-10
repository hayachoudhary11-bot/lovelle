"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawingStroke = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pointSchema = new mongoose_1.default.Schema({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
}, { _id: false });
const drawingStrokeSchema = new mongoose_1.default.Schema({
    coupleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Couple",
        required: true,
        indexed: true,
    },
    points: {
        type: [pointSchema],
        required: true,
        validate: {
            validator: (value) => value.length > 0,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
exports.DrawingStroke = mongoose_1.default.model("DrawingStroke", drawingStrokeSchema);
//# sourceMappingURL=DrawingStroke.js.map