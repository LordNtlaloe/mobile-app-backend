// controllers/progress-controller.ts
import { Request, Response } from "express";
import { ProgressService } from "../services/progress-services";

const progressService = new ProgressService();

export const addMeasurement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const data = req.body;

        const measurement = await progressService.addMeasurement(clientId as string, data);
        res.status(201).json(measurement);
    } catch (error) {
        console.error("Add measurement error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMeasurements = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const { startDate, endDate } = req.query;

        const measurements = await progressService.getMeasurements(
            clientId as string,
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );
        res.json(measurements);
    } catch (error) {
        console.error("Get measurements error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addNutritionLog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const data = req.body;

        if (!data.mealType || !data.imageUrl) {
            res.status(400).json({ error: "Meal type and image URL are required" });
            return;
        }

        const log = await progressService.addNutritionLog(clientId as string, data);
        res.status(201).json(log);
    } catch (error) {
        console.error("Add nutrition log error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getNutritionLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const { date } = req.query;

        const logs = await progressService.getNutritionLogs(
            clientId as string,
            date ? new Date(date as string) : undefined
        );
        res.json(logs);
    } catch (error) {
        console.error("Get nutrition logs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const generateProgressReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({ error: "Start date and end date are required" });
            return;
        }

        const report = await progressService.generateProgressReport(
            clientId as string,
            new Date(startDate as string),
            new Date(endDate as string)
        );
        res.json(report);
    } catch (error) {
        console.error("Generate progress report error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};