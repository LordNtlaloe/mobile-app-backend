// services/progress-services.ts
import { prisma } from "../lib/prisma";
import { MealType } from "../generated/prisma";

export interface MeasurementData {
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
    notes?: string;
    date?: Date;
}

export interface NutritionLogData {
    mealType: MealType;
    imageUrl: string;
    notes?: string;
    date?: Date;
}

export class ProgressService {
    // Measurements
    async addMeasurement(clientId: string, data: MeasurementData) {
        return await prisma.measurement.create({
            data: {
                clientId,
                ...data
            }
        });
    }

    async getMeasurements(clientId: string, startDate?: Date, endDate?: Date) {
        const where: any = { clientId };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = startDate;
            if (endDate) where.date.lte = endDate;
        }

        return await prisma.measurement.findMany({
            where,
            orderBy: { date: 'desc' }
        });
    }

    async getMeasurementTrends(clientId: string, metric: keyof MeasurementData) {
        if (['notes', 'date', 'clientId'].includes(metric)) {
            throw new Error("Invalid metric for trends");
        }

        const measurements = await prisma.measurement.findMany({
            where: {
                clientId,
                [metric]: { not: null }
            },
            select: {
                date: true,
                [metric]: true
            },
            orderBy: { date: 'asc' },
            take: 30 // Last 30 measurements
        });

        return measurements;
    }

    // Nutrition Logs
    async addNutritionLog(clientId: string, data: NutritionLogData) {
        return await prisma.nutritionLog.create({
            data: {
                clientId,
                ...data
            }
        });
    }

    async getNutritionLogs(clientId: string, date?: Date) {
        const where: any = { clientId };

        if (date) {
            // Filter by specific date (day)
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            where.date = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        return await prisma.nutritionLog.findMany({
            where,
            orderBy: { date: 'desc' }
        });
    }

    async getNutritionSummary(clientId: string, startDate: Date, endDate: Date) {
        const logs = await prisma.nutritionLog.findMany({
            where: {
                clientId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'asc' }
        });

        // Group by meal type
        const summary = logs.reduce((acc: any, log) => {
            const mealType = log.mealType;
            if (!acc[mealType]) {
                acc[mealType] = 0;
            }
            acc[mealType]++;
            return acc;
        }, {});

        return {
            totalLogs: logs.length,
            byMealType: summary,
            logs
        };
    }

    // Progress Reports
    async generateProgressReport(clientId: string, startDate: Date, endDate: Date) {
        const [measurements, nutritionLogs, goals] = await Promise.all([
            this.getMeasurements(clientId, startDate, endDate),
            this.getNutritionLogs(clientId),
            prisma.fitnessGoal.findMany({
                where: {
                    clientId,
                    targetDate: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            })
        ]);

        // Calculate weight change if available
        let weightChange = null;
        if (measurements.length >= 2) {
            const sortedMeasurements = [...measurements].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            const firstWeight = sortedMeasurements[0].weight;
            const lastWeight = sortedMeasurements[sortedMeasurements.length - 1].weight;

            if (firstWeight && lastWeight) {
                weightChange = lastWeight - firstWeight;
            }
        }

        return {
            period: { startDate, endDate },
            measurements: {
                total: measurements.length,
                latest: measurements[0],
                weightChange
            },
            nutrition: {
                totalLogs: nutritionLogs.length,
                byMealType: nutritionLogs.reduce((acc: any, log) => {
                    acc[log.mealType] = (acc[log.mealType] || 0) + 1;
                    return acc;
                }, {})
            },
            goals: {
                total: goals.length,
                achieved: goals.filter(g => g.achieved).length,
                pending: goals.filter(g => !g.achieved).length,
                list: goals
            }
        };
    }
}