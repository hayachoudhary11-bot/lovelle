"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Couple_1 = require("../models/Couple");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/me", auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user?.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const couple = user.coupleId ? await Couple_1.Couple.findById(user.coupleId) : null;
        return res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                coupleId: user.coupleId,
            },
            couple,
        });
    }
    catch (error) {
        console.error("Get current user error:", error.message);
        return res.status(500).json({ error: error.message || "Server error" });
    }
});
/**
 * Generate a random invite code (6 uppercase letters + numbers)
 * Used for couples to invite their partner
 */
function generateInviteCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
/**
 * Generate a JWT token
 * The token contains userId and coupleId so we can verify requests later
 */
function generateToken(userId, coupleId) {
    return jsonwebtoken_1.default.sign({ userId, coupleId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}
/**
 * POST /auth/signup
 * Create a new user account
 *
 * Request body:
 *   { email: string, password: string, name: string }
 *
 * Response:
 *   { user: { id, email, name, coupleId }, token: "jwt..." }
 */
router.post("/signup", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Validate input
        if (!email || !password || !name) {
            return res
                .status(400)
                .json({ error: "Email, password, and name are required" });
        }
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }
        // Hash the password with bcrypt (makes it safe to store)
        // bcrypt adds a "salt" to make rainbow table attacks impossible
        const passwordHash = await bcrypt_1.default.hash(password, 10); // 10 = salt rounds, higher = slower but more secure
        // Create the new user
        const user = await User_1.User.create({
            email: email.toLowerCase(),
            name,
            passwordHash,
            coupleId: null, // User hasn't joined/created a couple yet
        });
        // Generate a JWT token for immediate login
        const token = generateToken(user._id.toString(), null);
        // Return user info + token
        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                coupleId: user.coupleId,
            },
            token,
        });
    }
    catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ error: error.message || "Server error" });
    }
});
/**
 * POST /auth/login
 * Log in with email and password
 *
 * Request body:
 *   { email: string, password: string }
 *
 * Response:
 *   { user: { id, email, name, coupleId }, token: "jwt..." }
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        // Find the user
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Compare the submitted password against the hashed password
        // bcrypt.compare returns true if they match, false if not
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Generate a JWT token
        const token = generateToken(user._id.toString(), user.coupleId?.toString() || null);
        // Return user info + token
        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                coupleId: user.coupleId,
            },
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: error.message || "Server error" });
    }
});
/**
 * POST /couples/create
 * First partner creates a couple (generates invite code for partner to use)
 *
 * Requires: JWT token (user must be logged in)
 * Request body: { coupleName?: string } (optional)
 *
 * Response:
 *   { couple: { id, name, members, inviteCode } }
 */
router.post("/create", auth_1.authMiddleware, async (req, res) => {
    try {
        const { coupleName } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        // Create a new couple with the logged-in user as the first member
        const couple = await Couple_1.Couple.create({
            name: coupleName || null,
            members: [userId],
            inviteCode: generateInviteCode(),
        });
        // Update the user's coupleId
        await User_1.User.findByIdAndUpdate(userId, { coupleId: couple._id });
        const token = generateToken(userId, couple._id.toString());
        res.status(201).json({
            couple: {
                id: couple._id,
                name: couple.name,
                members: couple.members,
                inviteCode: couple.inviteCode,
            },
            token,
        });
    }
    catch (error) {
        console.error("Create couple error:", error.message);
        res.status(500).json({ error: error.message || "Server error" });
    }
});
/**
 * POST /couples/join
 * Second partner joins a couple using the invite code
 *
 * Requires: JWT token (user must be logged in)
 * Request body: { inviteCode: string }
 *
 * Response:
 *   { couple: { id, name, members, inviteCode } }
 */
router.post("/join", auth_1.authMiddleware, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        // Validate input
        if (!inviteCode) {
            return res.status(400).json({ error: "Invite code is required" });
        }
        // Find the couple by invite code
        const couple = await Couple_1.Couple.findOne({ inviteCode });
        if (!couple) {
            return res.status(404).json({ error: "Invalid invite code" });
        }
        // Check if couple already has 2 members
        if (couple.members.length >= 2) {
            return res
                .status(400)
                .json({ error: "This couple already has 2 members" });
        }
        // Check if user already in a couple
        const user = await User_1.User.findById(userId);
        if (user?.coupleId) {
            return res.status(400).json({ error: "You are already in a couple" });
        }
        // Add the user to the couple
        couple.members.push(new mongoose_1.default.Types.ObjectId(userId));
        await couple.save();
        // Update the user's coupleId
        await User_1.User.findByIdAndUpdate(userId, { coupleId: couple._id });
        const token = generateToken(userId, couple._id.toString());
        res.json({
            couple: {
                id: couple._id,
                name: couple.name,
                members: couple.members,
                inviteCode: couple.inviteCode,
            },
            token,
        });
    }
    catch (error) {
        console.error("Join couple error:", error.message);
        res.status(500).json({ error: error.message || "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map