import { Request, Response } from "express";
import { AuthService } from "../services/auth-services";

const authService = new AuthService();
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        if (!email || !password) {
            res.status(400).json({ 
                success: false,
                error: { message: "Email and password are required" }
            });
            return;
        }

        const result = await authService.registerUser({ email, password, firstName, lastName, role });
        
        // ✅ Return in the format your frontend expects
        res.status(201).json({
            success: true,
            payload: result
        });
    } catch (error: any) {
        console.error("Registration error:", error);

        res.status(error.message === "User already exists" ? 400 : 500).json({ 
            success: false,
            error: { 
                message: error.message || "Internal server error",
                status: error.message === "User already exists" ? 400 : 500
            }
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ 
                success: false,
                error: { message: "Email and password are required" }
            });
            return;
        }

        const result = await authService.loginUser(email, password);
        
        // ✅ Return in the format your frontend expects
        res.json({
            success: true,
            payload: result
        });
    } catch (error: any) {
        console.error("Login error:", error);

        res.status(400).json({ 
            success: false,
            error: { 
                message: error.message || "Internal server error",
                status: 400
            }
        });
    }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            res.status(400).json({ error: "Email and code are required" });
            return;
        }

        const result = await authService.verifyUser(email, code);
        res.json(result);
    } catch (error: any) {
        console.error("Verification error:", error);

        if (error.message.includes("Invalid") || error.message.includes("expired")) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};


export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }

        const result = await authService.requestPasswordReset(email);
        res.json(result);
    } catch (error) {
        console.error("Password reset request error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            res.status(400).json({ error: "Email, token and password are required" });
            return;
        }

        const result = await authService.resetPassword(email, token, newPassword);
        res.json(result);
    } catch (error: any) {
        console.error("Password reset error:", error);

        if (error.message.includes("Invalid") || error.message.includes("expired")) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }

        const result = await authService.refreshAccessToken(refreshToken);
        res.json(result);
    } catch (error: any) {
        console.error("Token refresh error:", error);

        if (error.message.includes("Invalid") || error.message.includes("expired")) {
            res.status(401).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = authService.validateToken(token);

        res.json(decoded);
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};