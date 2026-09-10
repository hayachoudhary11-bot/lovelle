import { Request, Response, NextFunction } from "express";
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
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const verifyToken: (token: string) => {
    userId: string;
    coupleId: string | null;
};
//# sourceMappingURL=auth.d.ts.map