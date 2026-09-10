"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptAnswer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const promptAnswerSchema = new mongoose_1.default.Schema({
    coupleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Couple",
        required: true,
        indexed: true,
    },
    promptId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Prompt",
        required: true,
    },
    answeredBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
promptAnswerSchema.index({ coupleId: 1, promptId: 1, answeredBy: 1, date: 1 }, { unique: true });
exports.PromptAnswer = mongoose_1.default.model("PromptAnswer", promptAnswerSchema);
//# sourceMappingURL=PromptAnswer.js.map