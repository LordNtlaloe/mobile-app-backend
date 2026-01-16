"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasurementsService = void 0;
const prisma_1 = require("../lib/prisma");
const errors_1 = require("../middleware/errors");
class MeasurementsService {
    async createMeasurement(clientId, data) {
        const client = await prisma_1.prisma.clientProfile.findUnique({
            where: { id: clientId }
        });
        if (!client) {
            throw new errors_1.AppError("Client not found", 404);
        }
        if (data.date) {
            const measurementDate = new Date(data.date);
            const startOfDay = new Date(measurementDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(measurementDate);
            endOfDay.setHours(23, 59, 59, 999);
            const existingMeasurement = await prisma_1.prisma.measurement.findFirst({
                where: {
                    clientId,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });
            if (existingMeasurement) {
                throw new errors_1.AppError("Measurement already exists for this date", 400);
            }
        }
        return await prisma_1.prisma.measurement.create({
            data: {
                clientId,
                date: data.date || new Date(),
                weight: data.weight,
                chest: data.chest,
                waist: data.waist,
                hips: data.hips,
                biceps: data.biceps,
                thighs: data.thighs,
                notes: data.notes
            }
        });
    }
    async getMeasurementById(measurementId, clientId) {
        const where = { id: measurementId };
        if (clientId) {
            where.clientId = clientId;
        }
        const measurement = await prisma_1.prisma.measurement.findUnique({
            where,
            include: {
                client: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            }
        });
        if (!measurement) {
            throw new errors_1.AppError("Measurement not found", 404);
        }
        return measurement;
    }
    async getClientMeasurements(clientId, filters) {
        const client = await prisma_1.prisma.clientProfile.findUnique({
            where: { id: clientId }
        });
        if (!client) {
            throw new errors_1.AppError("Client not found", 404);
        }
        const where = { clientId };
        if (filters?.startDate || filters?.endDate) {
            where.date = {};
            if (filters.startDate) {
                where.date.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.date.lte = new Date(filters.endDate);
            }
        }
        if (filters?.minWeight || filters?.maxWeight) {
            where.weight = {};
            if (filters.minWeight) {
                where.weight.gte = filters.minWeight;
            }
            if (filters.maxWeight) {
                where.weight.lte = filters.maxWeight;
            }
        }
        const measurements = await prisma_1.prisma.measurement.findMany({
            where,
            orderBy: { date: 'desc' },
            skip: filters?.offset || 0,
            take: filters?.limit || 50,
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true,
                        targetWeight: true
                    }
                }
            }
        });
        const total = await prisma_1.prisma.measurement.count({ where });
        return {
            measurements,
            pagination: {
                total,
                limit: filters?.limit || 50,
                offset: filters?.offset || 0,
                hasMore: total > (filters?.offset || 0) + measurements.length
            }
        };
    }
    async updateMeasurement(measurementId, clientId, data) {
        const existingMeasurement = await prisma_1.prisma.measurement.findUnique({
            where: { id: measurementId, clientId }
        });
        if (!existingMeasurement) {
            throw new errors_1.AppError("Measurement not found", 404);
        }
        if (data.date) {
            const newDate = new Date(data.date);
            const existingDate = new Date(existingMeasurement.date);
            if (newDate.toDateString() !== existingDate.toDateString()) {
                const startOfDay = new Date(newDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(newDate);
                endOfDay.setHours(23, 59, 59, 999);
                const conflictingMeasurement = await prisma_1.prisma.measurement.findFirst({
                    where: {
                        clientId,
                        id: { not: measurementId },
                        date: {
                            gte: startOfDay,
                            lte: endOfDay
                        }
                    }
                });
                if (conflictingMeasurement) {
                    throw new errors_1.AppError("Another measurement already exists for this date", 400);
                }
            }
        }
        return await prisma_1.prisma.measurement.update({
            where: { id: measurementId },
            data
        });
    }
    async deleteMeasurement(measurementId, clientId) {
        const where = { id: measurementId };
        if (clientId) {
            where.clientId = clientId;
        }
        const measurement = await prisma_1.prisma.measurement.findUnique({
            where
        });
        if (!measurement) {
            throw new errors_1.AppError("Measurement not found", 404);
        }
        return await prisma_1.prisma.measurement.delete({
            where: { id: measurementId }
        });
    }
    async getMeasurementStats(clientId) {
        const measurements = await prisma_1.prisma.measurement.findMany({
            where: { clientId },
            orderBy: { date: 'asc' },
            select: {
                date: true,
                weight: true,
                chest: true,
                waist: true,
                hips: true,
                biceps: true,
                thighs: true
            }
        });
        if (measurements.length === 0) {
            return {
                measurementsCount: 0
            };
        }
        const firstMeasurement = measurements[0];
        const lastMeasurement = measurements[measurements.length - 1];
        const stats = {
            measurementsCount: measurements.length,
            firstMeasurementDate: firstMeasurement.date,
            lastMeasurementDate: lastMeasurement.date
        };
        if (firstMeasurement.weight !== null && lastMeasurement.weight !== null) {
            const firstWeight = firstMeasurement.weight;
            const lastWeight = lastMeasurement.weight;
            stats.currentWeight = lastWeight;
            stats.weightChange = lastWeight - firstWeight;
            stats.weightChangePercentage = (stats.weightChange / firstWeight) * 100;
        }
        const fields = ['chest', 'waist', 'hips', 'biceps', 'thighs'];
        fields.forEach(field => {
            const firstValue = firstMeasurement[field];
            const lastValue = lastMeasurement[field];
            if (firstValue !== null && lastValue !== null) {
                const change = lastValue - firstValue;
                switch (field) {
                    case 'chest':
                        stats.chestChange = change;
                        break;
                    case 'waist':
                        stats.waistChange = change;
                        break;
                    case 'hips':
                        stats.hipsChange = change;
                        break;
                    case 'biceps':
                        stats.bicepsChange = change;
                        break;
                    case 'thighs':
                        stats.thighsChange = change;
                        break;
                }
            }
        });
        return stats;
    }
    async getMeasurementTrends(clientId, field, days = 30) {
        const validFields = ['weight', 'chest', 'waist', 'hips', 'biceps', 'thighs'];
        if (!validFields.includes(field)) {
            throw new errors_1.AppError(`Invalid field: ${field}. Must be one of: ${validFields.join(', ')}`, 400);
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const measurements = await prisma_1.prisma.measurement.findMany({
            where: {
                clientId,
                date: { gte: startDate },
                [field]: { not: null }
            },
            orderBy: { date: 'asc' },
            select: {
                date: true,
                [field]: true
            }
        });
        return measurements.map(m => {
            const trend = {
                date: m.date
            };
            const value = m[field];
            if (value !== null) {
                trend[field] = value;
            }
            return trend;
        });
    }
    async calculateBodyComposition(clientId) {
        const latestMeasurement = await prisma_1.prisma.measurement.findFirst({
            where: { clientId },
            orderBy: { date: 'desc' },
            select: {
                weight: true,
                waist: true,
                hips: true
            }
        });
        if (!latestMeasurement || latestMeasurement.weight === null) {
            return {};
        }
        const bodyComposition = {};
        const client = await prisma_1.prisma.clientProfile.findUnique({
            where: { id: clientId },
            select: { dateOfBirth: true, gender: true }
        });
        if (latestMeasurement.waist !== null && latestMeasurement.hips !== null) {
            bodyComposition.waistToHipRatio = latestMeasurement.waist / latestMeasurement.hips;
        }
        if (latestMeasurement.waist !== null && latestMeasurement.weight !== null && client?.gender) {
            if (client.gender === 'MALE') {
                bodyComposition.bodyFatPercentage = (latestMeasurement.waist * 0.5) / latestMeasurement.weight * 100;
            }
            else {
                bodyComposition.bodyFatPercentage = (latestMeasurement.waist * 0.6) / latestMeasurement.weight * 100;
            }
        }
        return bodyComposition;
    }
    async getLatestMeasurement(clientId) {
        return await prisma_1.prisma.measurement.findFirst({
            where: { clientId },
            orderBy: { date: 'desc' }
        });
    }
    async bulkCreateMeasurements(clientId, measurements) {
        const client = await prisma_1.prisma.clientProfile.findUnique({
            where: { id: clientId }
        });
        if (!client) {
            throw new errors_1.AppError("Client not found", 404);
        }
        const processedMeasurements = measurements.map(m => ({
            ...m,
            date: m.date ? new Date(m.date) : new Date()
        }));
        return await prisma_1.prisma.$transaction(async (tx) => {
            const createdMeasurements = [];
            for (const measurement of processedMeasurements) {
                const measurementDate = new Date(measurement.date);
                const startOfDay = new Date(measurementDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(measurementDate);
                endOfDay.setHours(23, 59, 59, 999);
                const existing = await tx.measurement.findFirst({
                    where: {
                        clientId,
                        date: {
                            gte: startOfDay,
                            lte: endOfDay
                        }
                    }
                });
                if (!existing) {
                    const created = await tx.measurement.create({
                        data: {
                            clientId,
                            ...measurement
                        }
                    });
                    createdMeasurements.push(created);
                }
            }
            return createdMeasurements;
        });
    }
    async exportMeasurements(clientId, format = 'json') {
        const measurements = await prisma_1.prisma.measurement.findMany({
            where: { clientId },
            orderBy: { date: 'desc' },
            select: {
                date: true,
                weight: true,
                chest: true,
                waist: true,
                hips: true,
                biceps: true,
                thighs: true,
                notes: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (format === 'csv') {
            const headers = ['Date', 'Weight', 'Chest', 'Waist', 'Hips', 'Biceps', 'Thighs', 'Notes', 'Created At', 'Updated At'];
            const csvRows = measurements.map(m => [
                m.date.toISOString().split('T')[0],
                m.weight || '',
                m.chest || '',
                m.waist || '',
                m.hips || '',
                m.biceps || '',
                m.thighs || '',
                m.notes || '',
                m.createdAt.toISOString(),
                m.updatedAt.toISOString()
            ]);
            return {
                format: 'csv',
                data: [headers, ...csvRows].map(row => row.join(',')).join('\n'),
                filename: `measurements-${clientId}-${new Date().toISOString().split('T')[0]}.csv`
            };
        }
        return {
            format: 'json',
            data: measurements,
            filename: `measurements-${clientId}-${new Date().toISOString().split('T')[0]}.json`
        };
    }
}
exports.MeasurementsService = MeasurementsService;
//# sourceMappingURL=measurement-services.js.map