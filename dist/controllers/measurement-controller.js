"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareMeasurements = exports.getDashboardMetrics = exports.exportMeasurements = exports.bulkCreateMeasurements = exports.getLatestMeasurement = exports.getBodyComposition = exports.getMeasurementTrends = exports.getMeasurementStats = exports.deleteMeasurement = exports.updateMeasurement = exports.getClientMeasurements = exports.getMeasurement = exports.createMeasurement = void 0;
const measurement_services_1 = require("../services/measurement-services");
const prisma_1 = require("../lib/prisma");
const measurementsService = new measurement_services_1.MeasurementsService();
const createMeasurement = async (req, res) => {
    try {
        const { clientId } = req.params;
        const measurementData = req.body;
        const hasAtLeastOneMeasurement = measurementData.weight !== undefined ||
            measurementData.chest !== undefined ||
            measurementData.waist !== undefined ||
            measurementData.hips !== undefined ||
            measurementData.biceps !== undefined ||
            measurementData.thighs !== undefined;
        if (!hasAtLeastOneMeasurement) {
            res.status(400).json({
                error: "At least one measurement value is required (weight, chest, waist, hips, biceps, thighs)"
            });
            return;
        }
        const measurement = await measurementsService.createMeasurement(clientId, measurementData);
        res.status(201).json({
            message: "Measurement created successfully",
            data: measurement
        });
    }
    catch (error) {
        console.error("Create measurement error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createMeasurement = createMeasurement;
const getMeasurement = async (req, res) => {
    try {
        const { measurementId, clientId } = req.params;
        let authorizedClientId = clientId;
        if (!authorizedClientId && req.user) {
            const clientProfile = await prisma_1.prisma.clientProfile.findUnique({
                where: { userId: req.user.userId },
                select: { id: true }
            });
            if (clientProfile) {
                authorizedClientId = clientProfile.id;
            }
        }
        const measurement = await measurementsService.getMeasurementById(measurementId, authorizedClientId);
        res.json({
            data: measurement
        });
    }
    catch (error) {
        console.error("Get measurement error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getMeasurement = getMeasurement;
const getClientMeasurements = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { startDate, endDate, minWeight, maxWeight, limit, offset } = req.query;
        const filters = {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            minWeight: minWeight ? parseFloat(minWeight) : undefined,
            maxWeight: maxWeight ? parseFloat(maxWeight) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined
        };
        const result = await measurementsService.getClientMeasurements(clientId, filters);
        res.json(result);
    }
    catch (error) {
        console.error("Get client measurements error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getClientMeasurements = getClientMeasurements;
const updateMeasurement = async (req, res) => {
    try {
        const { measurementId, clientId } = req.params;
        const updateData = req.body;
        const measurement = await measurementsService.updateMeasurement(measurementId, clientId, updateData);
        res.json({
            message: "Measurement updated successfully",
            data: measurement
        });
    }
    catch (error) {
        console.error("Update measurement error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateMeasurement = updateMeasurement;
const deleteMeasurement = async (req, res) => {
    try {
        const { measurementId, clientId } = req.params;
        await measurementsService.deleteMeasurement(measurementId, clientId);
        res.json({
            message: "Measurement deleted successfully"
        });
    }
    catch (error) {
        console.error("Delete measurement error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteMeasurement = deleteMeasurement;
const getMeasurementStats = async (req, res) => {
    try {
        const { clientId } = req.params;
        const stats = await measurementsService.getMeasurementStats(clientId);
        res.json({
            data: stats
        });
    }
    catch (error) {
        console.error("Get measurement stats error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getMeasurementStats = getMeasurementStats;
const getMeasurementTrends = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { field, days } = req.query;
        if (!field || typeof field !== 'string') {
            res.status(400).json({ error: "Field parameter is required" });
            return;
        }
        const trends = await measurementsService.getMeasurementTrends(clientId, field, days ? parseInt(days) : 30);
        res.json({
            data: trends,
            metadata: {
                field,
                days: days ? parseInt(days) : 30,
                count: trends.length
            }
        });
    }
    catch (error) {
        console.error("Get measurement trends error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getMeasurementTrends = getMeasurementTrends;
const getBodyComposition = async (req, res) => {
    try {
        const { clientId } = req.params;
        const bodyComposition = await measurementsService.calculateBodyComposition(clientId);
        res.json({
            data: bodyComposition
        });
    }
    catch (error) {
        console.error("Get body composition error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getBodyComposition = getBodyComposition;
const getLatestMeasurement = async (req, res) => {
    try {
        const { clientId } = req.params;
        const latestMeasurement = await measurementsService.getLatestMeasurement(clientId);
        if (!latestMeasurement) {
            res.status(404).json({ error: "No measurements found for this client" });
            return;
        }
        res.json({
            data: latestMeasurement
        });
    }
    catch (error) {
        console.error("Get latest measurement error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getLatestMeasurement = getLatestMeasurement;
const bulkCreateMeasurements = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { measurements } = req.body;
        if (!Array.isArray(measurements) || measurements.length === 0) {
            res.status(400).json({ error: "Measurements array is required and must not be empty" });
            return;
        }
        for (const measurement of measurements) {
            const hasAtLeastOneMeasurement = measurement.weight !== undefined ||
                measurement.chest !== undefined ||
                measurement.waist !== undefined ||
                measurement.hips !== undefined ||
                measurement.biceps !== undefined ||
                measurement.thighs !== undefined;
            if (!hasAtLeastOneMeasurement) {
                res.status(400).json({
                    error: "Each measurement must have at least one measurement value"
                });
                return;
            }
        }
        const createdMeasurements = await measurementsService.bulkCreateMeasurements(clientId, measurements);
        res.status(201).json({
            message: `${createdMeasurements.length} measurements created successfully`,
            data: createdMeasurements,
            metadata: {
                totalRequested: measurements.length,
                totalCreated: createdMeasurements.length,
                skippedDuplicates: measurements.length - createdMeasurements.length
            }
        });
    }
    catch (error) {
        console.error("Bulk create measurements error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.bulkCreateMeasurements = bulkCreateMeasurements;
const exportMeasurements = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { format } = req.query;
        const exportData = await measurementsService.exportMeasurements(clientId, format || 'json');
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
            res.send(exportData.data);
        }
        else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
            res.json(exportData.data);
        }
    }
    catch (error) {
        console.error("Export measurements error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.exportMeasurements = exportMeasurements;
const getDashboardMetrics = async (req, res) => {
    try {
        const { clientId } = req.params;
        const [latestMeasurement, stats, bodyComposition] = await Promise.all([
            measurementsService.getLatestMeasurement(clientId),
            measurementsService.getMeasurementStats(clientId),
            measurementsService.calculateBodyComposition(clientId)
        ]);
        res.json({
            data: {
                latestMeasurement,
                stats,
                bodyComposition,
                progress: {
                    weightProgress: stats.currentWeight && stats.firstMeasurementDate
                        ? {
                            current: stats.currentWeight,
                            change: stats.weightChange,
                            changePercentage: stats.weightChangePercentage,
                            daysTracked: Math.ceil((new Date().getTime() - new Date(stats.firstMeasurementDate).getTime()) /
                                (1000 * 60 * 60 * 24))
                        }
                        : null
                }
            }
        });
    }
    catch (error) {
        console.error("Get dashboard metrics error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
const compareMeasurements = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            res.status(400).json({ error: "Both startDate and endDate are required" });
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const [startMeasurement, endMeasurement] = await Promise.all([
            prisma_1.prisma.measurement.findFirst({
                where: {
                    clientId,
                    date: {
                        gte: start,
                        lte: new Date(start.getTime() + 24 * 60 * 60 * 1000)
                    }
                },
                orderBy: { date: 'asc' }
            }),
            prisma_1.prisma.measurement.findFirst({
                where: {
                    clientId,
                    date: {
                        gte: new Date(end.setHours(0, 0, 0, 0)),
                        lte: new Date(end.setHours(23, 59, 59, 999))
                    }
                },
                orderBy: { date: 'desc' }
            })
        ]);
        if (!startMeasurement || !endMeasurement) {
            res.status(404).json({ error: "Measurements not found for the specified dates" });
            return;
        }
        const comparison = {
            period: {
                start: startMeasurement.date,
                end: endMeasurement.date,
                days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            }
        };
        const fields = ['weight', 'chest', 'waist', 'hips', 'biceps', 'thighs'];
        fields.forEach(field => {
            const startValue = startMeasurement[field];
            const endValue = endMeasurement[field];
            if (typeof startValue === 'number' && typeof endValue === 'number') {
                comparison[field] = {
                    start: startValue,
                    end: endValue,
                    change: endValue - startValue,
                    changePercentage: ((endValue - startValue) / startValue) * 100
                };
            }
        });
        res.json({
            data: comparison
        });
    }
    catch (error) {
        console.error("Compare measurements error:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.compareMeasurements = compareMeasurements;
//# sourceMappingURL=measurement-controller.js.map