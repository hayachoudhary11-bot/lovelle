"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Couple = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Couple Schema
 * Represents a couple and their shared data
 * All features (notes, gallery, etc.) are tagged with coupleId to keep data private
 */
const coupleSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        default: null, // Optional, e.g. "Alex & Sam"
    },
    members: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "User",
        validate: {
            validator: function (v) {
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
exports.Couple = mongoose_1.default.model("Couple", coupleSchema);
//# sourceMappingURL=Couple.js.map