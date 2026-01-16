// routes/progress.routes.ts
import express from "express";
import {
    addMeasurement,
    getMeasurements,
} from "../controllers/progress-controller";

const router = express.Router();

// Measurements
router.post("/:clientId/measurements", addMeasurement);
router.get("/:clientId/measurements", getMeasurements);

export default router;