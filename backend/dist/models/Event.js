"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const eventSchema = new mongoose_1.default.Schema({
    coupleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Couple",
        required: true,
        indexed: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    notes: {
        type: String,
        default: "",
        trim: true,
    },
    isCountdown: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
exports.Event = mongoose_1.default.model("Event", eventSchema);
//# sourceMappingURL=Event.js.map