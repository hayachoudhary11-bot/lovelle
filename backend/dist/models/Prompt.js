"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prompt = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const promptSchema = new mongoose_1.default.Schema({
    promptText: {
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
exports.Prompt = mongoose_1.default.model("Prompt", promptSchema);
//# sourceMappingURL=Prompt.js.map