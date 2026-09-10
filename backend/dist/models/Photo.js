"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Photo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const photoSchema = new mongoose_1.default.Schema({
    coupleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Couple",
        required: true,
        indexed: true,
    },
    uploaderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cloudinaryPublicId: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    thumbUrl: {
        type: String,
        required: true,
        trim: true,
    },
    caption: {
        type: String,
        default: "",
        trim: true,
    },
    width: {
        type: Number,
        required: true,
        min: 1,
    },
    height: {
        type: Number,
        required: true,
        min: 1,
    },
}, { timestamps: true });
exports.Photo = mongoose_1.default.model("Photo", photoSchema);
//# sourceMappingURL=Photo.js.map