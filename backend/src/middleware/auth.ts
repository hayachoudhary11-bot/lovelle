import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Couple } from "../models/Couple";
declare global {
  namespace Express {
    interface Request { user?: { userId: string; coupleId: string | null }; }
  }
}
export function verifyToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ["HS256"] });
  if (typeof decoded === "string" || !mongoose.isObjectIdOrHexString(decoded.userId)) throw new Error("Invalid token");
  return decoded as jwt.JwtPayload & { userId: string; coupleId: string | null };
}
export async function authenticateToken(token: string) {
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.userId).select("coupleId");
  if (!user) throw new Error("Invalid user");
  const coupleId = user.coupleId?.toString() || null;
  if (coupleId && !await Couple.exists({ _id: coupleId, members: user._id })) throw new Error("Invalid membership");
  return { userId: user._id.toString(), coupleId, exp: decoded.exp };
}
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing authentication token" });
  try { req.user = await authenticateToken(header.slice(7)); next(); }
  catch { res.status(401).json({ error: "Invalid or expired token" }); }
}
