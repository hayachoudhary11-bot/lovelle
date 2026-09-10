"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeAnswer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const challengeAnswerSchema = new mongoose_1.default.Schema({
    coupleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Couple",
        required: true,
        indexed: true,
    },
    questionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ChallengeQuestion",
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
challengeAnswerSchema.index({ coupleId: 1, questionId: 1, answeredBy: 1, date: 1 }, { unique: true });
exports.ChallengeAnswer = mongoose_1.default.model("ChallengeAnswer", challengeAnswerSchema);
//# sourceMappingURL=ChallengeAnswer.js.map