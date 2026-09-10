"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Auth middleware - verifies JWT tokens
 *
 * Usage in routes:
 *   router.get('/protected-route', authMiddleware, (req, res) => {
 *     console.log(req.user.userId); // Now you can access the user's ID
 *   });
 */
const authMiddleware = (req, res, next) => {
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
        const decoded = (0, exports.verifyToken)(token);
        // Attach user info to the request
        // Routes can now access req.user.userId and req.user.coupleId
        req.user = decoded;
        // Move to the next middleware/route handler
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.authMiddleware = authMiddleware;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=auth.js.map