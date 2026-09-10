"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeQuestion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const challengeQuestionSchema = new mongoose_1.default.Schema({
    questionText: {
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
}, { timestamps: true });
exports.ChallengeQuestion = mongoose_1.default.model("ChallengeQuestion", challengeQuestionSchema);
//# sourceMappingURL=ChallengeQuestion.js.map