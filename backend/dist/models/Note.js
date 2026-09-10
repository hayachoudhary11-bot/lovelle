"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Note Schema
 * Represents a sticky note shared between couple members
 * Notes are private per couple — each couple only sees their own notes
 */
const noteSchema = new mongoose_1.default.Schema({
    coupleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Couple",
        required: true,
        indexed: true, // Fast lookups: "give me all notes for couple XYZ"
    },
    authorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
exports.Note = mongoose_1.default.model("Note", noteSchema);
//# sourceMappingURL=Note.js.map