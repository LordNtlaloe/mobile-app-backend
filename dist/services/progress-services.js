"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressService = void 0;
const prisma_1 = require("../lib/prisma");
class ProgressService {
    async addMeasurement(clientId, data) {
        return await prisma_1.prisma.measurement.create({
            data: {
                clientId,
                ...data
            }
        });
    }
    async getMeasurements(clientId, startDate, endDate) {
        const where = { clientId };
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = startDate;
            if (endDate)
                where.date.lte = endDate;
        }
        return await prisma_1.prisma.measurement.findMany({
            where,
            orderBy: { date: 'desc' }
        });
    }
    async getMeasurementTrends(clientId, metric) {
        if (['notes', 'date', 'clientId'].includes(metric)) {
            throw new Error("Invalid metric for trends");
        }
        const measurements = await prisma_1.prisma.measurement.findMany({
            where: {
                clientId,
                [metric]: { not: null }
            },
            select: {
                date: true,
                [metric]: true
            },
            orderBy: { date: 'asc' },
            take: 30
        });
        return measurements;
    }
    async addNutritionLog(clientId, data) {
        return await prisma_1.prisma.nutritionLog.create({
            data: {
                clientId,
                ...data
            }
        });
    }
    async getNutritionLogs(clientId, date) {
        const where = { clientId };
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.date = {
                gte: startOfDay,
                lte: endOfDay
            };
        }
        return await prisma_1.prisma.nutritionLog.findMany({
            where,
            orderBy: { date: 'desc' }
        });
    }
    async getNutritionSummary(clientId, startDate, endDate) {
        const logs = await prisma_1.prisma.nutritionLog.findMany({
            where: {
                clientId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'asc' }
        });
        const summary = logs.reduce((acc, log) => {
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
    async generateProgressReport(clientId, startDate, endDate) {
        const [measurements, nutritionLogs, goals] = await Promise.all([
            this.getMeasurements(clientId, startDate, endDate),
            this.getNutritionLogs(clientId),
            prisma_1.prisma.fitnessGoal.findMany({
                where: {
                    clientId,
                    targetDate: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            })
        ]);
        let weightChange = null;
        if (measurements.length >= 2) {
            const sortedMeasurements = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
                byMealType: nutritionLogs.reduce((acc, log) => {
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
exports.ProgressService = ProgressService;
//# sourceMappingURL=progress-services.js.map