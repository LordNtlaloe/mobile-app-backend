// controllers/stream-controller.ts
import { Response } from "express";
;
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth";

const STREAM_API_SECRET = process.env.STREAM_VIDEO_API_SECRET;

if (!STREAM_API_SECRET) {
    throw new Error("STREAM_VIDEO_API_SECRET is not defined in environment variables");
}

export const getStreamToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;

        // Generate Stream Video token
        const token = generateStreamVideoToken(userId);

        res.json({
            success: true,
            payload: {
                token,
                userId
            }
        });
    } catch (error: any) {
        console.error("Stream token generation error:", error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message || "Failed to generate Stream token",
                status: 500
            }
        });
    }
};

function generateStreamVideoToken(userId: string): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiration = issuedAt + 3600; // 1 hour

    const payload = {
        user_id: userId,
        iat: issuedAt,
        exp: expiration
    };

    return jwt.sign(payload, STREAM_API_SECRET!, { algorithm: 'HS256' });
}

