"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProgressReport = exports.getNutritionLogs = exports.addNutritionLog = exports.getMeasurements = exports.addMeasurement = void 0;
const progress_services_1 = require("../services/progress-services");
const progressService = new progress_services_1.ProgressService();
const addMeasurement = async (req, res) => {
    try {
        const { clientId } = req.params;
        const data = req.body;
        const measurement = await progressService.addMeasurement(clientId, data);
        res.status(201).json(measurement);
    }
    catch (error) {
        console.error("Add measurement error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.addMeasurement = addMeasurement;
const getMeasurements = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { startDate, endDate } = req.query;
        const measurements = await progressService.getMeasurements(clientId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.json(measurements);
    }
    catch (error) {
        console.error("Get measurements error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getMeasurements = getMeasurements;
const addNutritionLog = async (req, res) => {
    try {
        const { clientId } = req.params;
        const data = req.body;
        if (!data.mealType || !data.imageUrl) {
            res.status(400).json({ error: "Meal type and image URL are required" });
            return;
        }
        const log = await progressService.addNutritionLog(clientId, data);
        res.status(201).json(log);
    }
    catch (error) {
        console.error("Add nutrition log error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.addNutritionLog = addNutritionLog;
const getNutritionLogs = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { date } = req.query;
        const logs = await progressService.getNutritionLogs(clientId, date ? new Date(date) : undefined);
        res.json(logs);
    }
    catch (error) {
        console.error("Get nutrition logs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getNutritionLogs = getNutritionLogs;
const generateProgressReport = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            res.status(400).json({ error: "Start date and end date are required" });
            return;
        }
        const report = await progressService.generateProgressReport(clientId, new Date(startDate), new Date(endDate));
        res.json(report);
    }
    catch (error) {
        console.error("Generate progress report error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.generateProgressReport = generateProgressReport;
//# sourceMappingURL=progress-controller.js.map