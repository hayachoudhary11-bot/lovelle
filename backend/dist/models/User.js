"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * User Schema
 * Represents a registered user in the Lovelle app
 */
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // No two users can have the same email
        lowercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    coupleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Couple",
        default: null, // User hasn't joined/created a couple yet
    },
    pushToken: {
        type: String,
        default: null, // For push notifications (Heartbeat feature, planned)
    },
}, { timestamps: true });
// Hide password when converting user to JSON
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};
exports.User = mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=User.js.map