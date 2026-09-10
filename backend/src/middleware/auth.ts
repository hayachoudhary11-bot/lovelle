import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extend the Express Request type to include user info
 * This tells TypeScript that authenticated requests have req.user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        coupleId: string | null;
      };
    }
  }
}

/**
 * Auth middleware - verifies JWT tokens
 *
 * Usage in routes:
 *   router.get('/protected-route', authMiddleware, (req, res) => {
 *     console.log(req.user.userId); // Now you can access the user's ID
 *   });
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get the Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.substring(7);

    // Verify the token using the JWT_SECRET
    // If valid, decode() returns the payload: { userId, coupleId }
    // If invalid, it throws an error which we catch below
    const decoded = verifyToken(token);

    // Attach user info to the request
    // Routes can now access req.user.userId and req.user.coupleId
    req.user = decoded as { userId: string; coupleId: string | null };

    // Move to the next middleware/route handler
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string;
    coupleId: string | null;
  };
};
