// types/express.d.ts
import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
                firstName?: string;
                lastName?: string;
            };
        }
    }
}