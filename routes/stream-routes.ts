// routes/stream-routes.ts
import express from "express";
import { getStreamToken } from "../controllers/stream-controller";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Protected route - requires authentication
router.get('/token', authenticate, getStreamToken);

export default router;