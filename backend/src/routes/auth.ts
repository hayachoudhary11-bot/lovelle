import { sendError } from "../middleware/errors";
import mongoose from "mongoose";
import { randomInt } from "crypto";
import { HttpError } from "../middleware/errors";
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Couple } from "../models/Couple";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const couple = user.coupleId ? await Couple.findById(user.coupleId) : null;
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        coupleId: user.coupleId,
      },
      couple,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
});

/**
 * Generate a random invite code (6 uppercase letters + numbers)
 * Used for couples to invite their partner
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(randomInt(chars.length));
  }
  return code;
}

/**
 * Generate a JWT token
 * The token contains userId and coupleId so we can verify requests later
 */
function generateToken(userId: string, coupleId: string | null): string {
  return jwt.sign(
    { userId, coupleId },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" }, // Token valid for 30 days
  );
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
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 254 || typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72 || typeof name !== "string" || !name.trim() || name.length > 100) {
      return res
        .status(400)
        .json({ error: "Valid email, name (1-100 characters), and password (8-72 bytes) are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password with bcrypt (makes it safe to store)
    // bcrypt adds a "salt" to make rainbow table attacks impossible
    const passwordHash = await bcrypt.hash(password, 10); // 10 = salt rounds, higher = slower but more secure

    // Create the new user
    const user = await User.create({
      email: email.trim().toLowerCase(),
      name: name.trim(),
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
  } catch (error: any) {
    sendError(res, error);
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
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (typeof email !== "string" || !email.trim() || email.length > 254 || typeof password !== "string" || !password || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the user
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+passwordHash",
    );
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the submitted password against the hashed password
    // bcrypt.compare returns true if they match, false if not
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = generateToken(
      user._id.toString(),
      user.coupleId?.toString() || null,
    );

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
  } catch (error: any) {
    sendError(res, error);
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
router.post("/create", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { coupleName } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (coupleName !== undefined && (typeof coupleName !== "string" || coupleName.length > 100)) {
      return res.status(400).json({ error: "Couple name must be at most 100 characters" });
    }
    const couple = await mongoose.connection.transaction(async (session) => {
      const user = await User.findById(userId).session(session);
      if (!user || user.coupleId) throw new HttpError(409, "You are already in a couple");
      const [created] = await Couple.create([{
        name: coupleName?.trim() || null, members: [userId], inviteCode: generateInviteCode(),
      }], { session });
      user.coupleId = created._id;
      await user.save({ session });
      return created;
    });

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
  } catch (error: any) {
    sendError(res, error);
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
router.post("/join", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (typeof inviteCode !== "string" || !/^[A-Z0-9]{6}$/.test(inviteCode.trim().toUpperCase())) {
      return res.status(400).json({ error: "A valid six-character invite code is required" });
    }
    const couple = await mongoose.connection.transaction(async (session) => {
      const user = await User.findById(userId).session(session);
      if (!user || user.coupleId) throw new HttpError(409, "You are already in a couple");
      const joined = await Couple.findOneAndUpdate(
        { inviteCode: inviteCode.trim().toUpperCase(), "members.1": { $exists: false }, members: { $ne: userId } },
        { $addToSet: { members: userId } },
        { returnDocument: "after", session },
      );
      if (!joined) throw new HttpError(409, "Invalid invite code or couple is full");
      user.coupleId = joined._id;
      await user.save({ session });
      return joined;
    });

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
  } catch (error: any) {
    sendError(res, error);
  }
});

export default router;
