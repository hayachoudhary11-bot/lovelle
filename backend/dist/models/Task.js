"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const taskSchema = new mongoose_1.default.Schema({
    coupleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Couple",
        required: true,
        indexed: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    done: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    doneBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, { timestamps: true });
exports.Task = mongoose_1.default.model("Task", taskSchema);
//# sourceMappingURL=Task.js.map