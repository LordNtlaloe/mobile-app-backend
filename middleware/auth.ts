// middleware/auth-middleware.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth-services";

const authService = new AuthService();

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = authService.validateToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Option 1: Keep rest parameters but call it differently in routes
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};

// Option 2: Create a new function that accepts array
export const authorizeRoles = (roles: string | string[]) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];

    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!roleArray.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};

export const authorizeSelfOrAdmin = (paramName: string = 'userId') => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const requestedUserId = req.params[paramName] || req.body.userId;

        if (req.user.role !== 'ADMIN' && req.user.userId !== requestedUserId) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};