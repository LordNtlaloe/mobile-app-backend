// routes/nutrition.routes.ts
import express from "express";
import {
    createNutritionLog,
    getNutritionLogById,
    getClientNutritionLogs,
    getNutritionLogsByDate,
    updateNutritionLog,
    deleteNutritionLog,
    getNutritionSummary,
    bulkCreateNutritionLogs
} from "../controllers/nutrition-controller";

const router = express.Router();

// Nutrition Logs
router.post("/", createNutritionLog);
router.post("/bulk", bulkCreateNutritionLogs);
router.get("/:id", getNutritionLogById);
router.get("/client/:clientId", getClientNutritionLogs);
router.get("/client/:clientId/date/:date", getNutritionLogsByDate);
router.put("/:id", updateNutritionLog);
router.delete("/:id", deleteNutritionLog);
router.get("/client/:clientId/summary", getNutritionSummary);

export default router;