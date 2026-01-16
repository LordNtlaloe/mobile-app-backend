// controllers/measurements-controller.ts
import { Response } from "express";
import { MeasurementsService } from "../services/measurement-services";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const measurementsService = new MeasurementsService();

export const createMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const measurementData = req.body;

        // Validate required fields
        const hasAtLeastOneMeasurement =
            measurementData.weight !== undefined ||
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

        // Type assertion for clientId
        const measurement = await measurementsService.createMeasurement(clientId as string, measurementData);
        res.status(201).json({
            message: "Measurement created successfully",
            data: measurement
        });
    } catch (error: any) {
        console.error("Create measurement error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { measurementId, clientId } = req.params;

        // Type assertions for parameters
        const typedMeasurementId = measurementId as string;
        let typedClientId = clientId as string | undefined;

        // If clientId is not in params, check if user is accessing their own measurements
        if (!typedClientId && req.user) {
            // Check if the user is a client trying to access their own measurements
            const clientProfile = await prisma.clientProfile.findUnique({
                where: { userId: req.user.userId },
                select: { id: true }
            });

            if (clientProfile) {
                typedClientId = clientProfile.id;
            }
        }

        if (!typedClientId) {
            res.status(400).json({ error: "Client ID is required" });
            return;
        }

        const measurement = await measurementsService.getMeasurementById(
            typedMeasurementId,
            typedClientId // Pass the client ID for authorization check
        );

        res.json({
            data: measurement
        });
    } catch (error: any) {
        console.error("Get measurement error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getClientMeasurements = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const {
            startDate,
            endDate,
            minWeight,
            maxWeight,
            limit,
            offset
        } = req.query;

        const filters = {
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            minWeight: minWeight ? parseFloat(minWeight as string) : undefined,
            maxWeight: maxWeight ? parseFloat(maxWeight as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        };

        const result = await measurementsService.getClientMeasurements(clientId as string, filters);
        res.json(result);
    } catch (error: any) {
        console.error("Get client measurements error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { measurementId, clientId } = req.params;
        const updateData = req.body;

        const measurement = await measurementsService.updateMeasurement(
            measurementId as string,
            clientId as string,
            updateData
        );
        res.json({
            message: "Measurement updated successfully",
            data: measurement
        });
    } catch (error: any) {
        console.error("Update measurement error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { measurementId, clientId } = req.params;

        await measurementsService.deleteMeasurement(
            measurementId as string,
            clientId as string
        );

        res.json({
            message: "Measurement deleted successfully"
        });
    } catch (error: any) {
        console.error("Delete measurement error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMeasurementStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;

        const stats = await measurementsService.getMeasurementStats(clientId as string);

        res.json({
            data: stats
        });
    } catch (error: any) {
        console.error("Get measurement stats error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMeasurementTrends = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const { field, days } = req.query;

        if (!field || typeof field !== 'string') {
            res.status(400).json({ error: "Field parameter is required" });
            return;
        }

        const trends = await measurementsService.getMeasurementTrends(
            clientId as string,
            field as any,
            days ? parseInt(days as string) : 30
        );

        res.json({
            data: trends,
            metadata: {
                field,
                days: days ? parseInt(days as string) : 30,
                count: trends.length
            }
        });
    } catch (error: any) {
        console.error("Get measurement trends error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getBodyComposition = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;

        const bodyComposition = await measurementsService.calculateBodyComposition(clientId as string);

        res.json({
            data: bodyComposition
        });
    } catch (error: any) {
        console.error("Get body composition error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getLatestMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;

        const latestMeasurement = await measurementsService.getLatestMeasurement(clientId as string);

        if (!latestMeasurement) {
            res.status(404).json({ error: "No measurements found for this client" });
            return;
        }

        res.json({
            data: latestMeasurement
        });
    } catch (error: any) {
        console.error("Get latest measurement error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const bulkCreateMeasurements = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const { measurements } = req.body;

        if (!Array.isArray(measurements) || measurements.length === 0) {
            res.status(400).json({ error: "Measurements array is required and must not be empty" });
            return;
        }

        // Validate each measurement
        for (const measurement of measurements) {
            const hasAtLeastOneMeasurement =
                measurement.weight !== undefined ||
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

        const createdMeasurements = await measurementsService.bulkCreateMeasurements(
            clientId as string,
            measurements
        );

        res.status(201).json({
            message: `${createdMeasurements.length} measurements created successfully`,
            data: createdMeasurements,
            metadata: {
                totalRequested: measurements.length,
                totalCreated: createdMeasurements.length,
                skippedDuplicates: measurements.length - createdMeasurements.length
            }
        });
    } catch (error: any) {
        console.error("Bulk create measurements error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const exportMeasurements = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const { format } = req.query;

        const exportData = await measurementsService.exportMeasurements(
            clientId as string,
            (format as 'csv' | 'json') || 'json'
        );

        // Set appropriate headers based on format
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
            res.send(exportData.data);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
            res.json(exportData.data);
        }
    } catch (error: any) {
        console.error("Export measurements error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

// Dashboard endpoints
export const getDashboardMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;

        const [latestMeasurement, stats, bodyComposition] = await Promise.all([
            measurementsService.getLatestMeasurement(clientId as string),
            measurementsService.getMeasurementStats(clientId as string),
            measurementsService.calculateBodyComposition(clientId as string)
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
                            daysTracked: Math.ceil(
                                (new Date().getTime() - new Date(stats.firstMeasurementDate!).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                        }
                        : null
                }
            }
        });
    } catch (error: any) {
        console.error("Get dashboard metrics error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const compareMeasurements = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({ error: "Both startDate and endDate are required" });
            return;
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        const [startMeasurement, endMeasurement] = await Promise.all([
            prisma.measurement.findFirst({
                where: {
                    clientId: clientId as string, // Type assertion here
                    date: {
                        gte: start,
                        lte: new Date(start.getTime() + 24 * 60 * 60 * 1000) // End of start day
                    }
                },
                orderBy: { date: 'asc' }
            }),
            prisma.measurement.findFirst({
                where: {
                    clientId: clientId as string, // Type assertion here
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

        const comparison: any = {
            period: {
                start: startMeasurement.date,
                end: endMeasurement.date,
                days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            }
        };

        // Compare each measurement field
        const fields = ['weight', 'chest', 'waist', 'hips', 'biceps', 'thighs'];
        fields.forEach(field => {
            const startValue = startMeasurement[field as keyof typeof startMeasurement];
            const endValue = endMeasurement[field as keyof typeof endMeasurement];

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
    } catch (error: any) {
        console.error("Compare measurements error:", error);

        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};