// services/measurements-services.ts
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errors";

export interface MeasurementData {
    date?: Date;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
    notes?: string;
}

export interface MeasurementUpdateData extends Partial<MeasurementData> { }

export interface MeasurementFilters {
    startDate?: Date;
    endDate?: Date;
    minWeight?: number;
    maxWeight?: number;
    limit?: number;
    offset?: number;
}

export interface MeasurementStats {
    currentWeight?: number;
    weightChange?: number;
    weightChangePercentage?: number;
    chestChange?: number;
    waistChange?: number;
    hipsChange?: number;
    bicepsChange?: number;
    thighsChange?: number;
    measurementsCount: number;
    firstMeasurementDate?: Date;
    lastMeasurementDate?: Date;
}

export interface MeasurementTrend {
    date: Date;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
}

export interface BodyComposition {
    bmi?: number;
    waistToHipRatio?: number;
    bodyFatPercentage?: number; // Estimate based on measurements
}

// Type for the measurement fields that can be compared
type MeasurementField = 'weight' | 'chest' | 'waist' | 'hips' | 'biceps' | 'thighs';

export class MeasurementsService {
    async createMeasurement(clientId: string, data: MeasurementData) {
        // Verify client exists
        const client = await prisma.clientProfile.findUnique({
            where: { id: clientId }
        });

        if (!client) {
            throw new AppError("Client not found", 404);
        }

        // Check if measurement already exists for the same date
        if (data.date) {
            const measurementDate = new Date(data.date);
            const startOfDay = new Date(measurementDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(measurementDate);
            endOfDay.setHours(23, 59, 59, 999);

            const existingMeasurement = await prisma.measurement.findFirst({
                where: {
                    clientId,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });

            if (existingMeasurement) {
                throw new AppError("Measurement already exists for this date", 400);
            }
        }

        return await prisma.measurement.create({
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

    async getMeasurementById(measurementId: string, clientId?: string) {
        const where: any = { id: measurementId };
        if (clientId) {
            where.clientId = clientId;
        }

        const measurement = await prisma.measurement.findUnique({
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
            throw new AppError("Measurement not found", 404);
        }

        return measurement;
    }

    async getClientMeasurements(clientId: string, filters?: MeasurementFilters) {
        // Verify client exists
        const client = await prisma.clientProfile.findUnique({
            where: { id: clientId }
        });

        if (!client) {
            throw new AppError("Client not found", 404);
        }

        const where: any = { clientId };

        // Apply date filters
        if (filters?.startDate || filters?.endDate) {
            where.date = {};
            if (filters.startDate) {
                where.date.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.date.lte = new Date(filters.endDate);
            }
        }

        // Apply weight filters
        if (filters?.minWeight || filters?.maxWeight) {
            where.weight = {};
            if (filters.minWeight) {
                where.weight.gte = filters.minWeight;
            }
            if (filters.maxWeight) {
                where.weight.lte = filters.maxWeight;
            }
        }

        const measurements = await prisma.measurement.findMany({
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

        const total = await prisma.measurement.count({ where });

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

    async updateMeasurement(measurementId: string, clientId: string, data: MeasurementUpdateData) {
        // Check if measurement exists and belongs to client
        const existingMeasurement = await prisma.measurement.findUnique({
            where: { id: measurementId, clientId }
        });

        if (!existingMeasurement) {
            throw new AppError("Measurement not found", 404);
        }

        // Check for date conflict if date is being updated
        if (data.date) {
            const newDate = new Date(data.date);
            const existingDate = new Date(existingMeasurement.date);

            if (newDate.toDateString() !== existingDate.toDateString()) {
                const startOfDay = new Date(newDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(newDate);
                endOfDay.setHours(23, 59, 59, 999);

                const conflictingMeasurement = await prisma.measurement.findFirst({
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
                    throw new AppError("Another measurement already exists for this date", 400);
                }
            }
        }

        return await prisma.measurement.update({
            where: { id: measurementId },
            data
        });
    }

    async deleteMeasurement(measurementId: string, clientId?: string) {
        const where: any = { id: measurementId };
        if (clientId) {
            where.clientId = clientId;
        }

        const measurement = await prisma.measurement.findUnique({
            where
        });

        if (!measurement) {
            throw new AppError("Measurement not found", 404);
        }

        return await prisma.measurement.delete({
            where: { id: measurementId }
        });
    }

    async getMeasurementStats(clientId: string): Promise<MeasurementStats> {
        const measurements = await prisma.measurement.findMany({
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

        const stats: MeasurementStats = {
            measurementsCount: measurements.length,
            firstMeasurementDate: firstMeasurement.date,
            lastMeasurementDate: lastMeasurement.date
        };

        // Calculate changes for weight
        if (firstMeasurement.weight !== null && lastMeasurement.weight !== null) {
            const firstWeight = firstMeasurement.weight;
            const lastWeight = lastMeasurement.weight;

            stats.currentWeight = lastWeight;
            stats.weightChange = lastWeight - firstWeight;
            stats.weightChangePercentage = (stats.weightChange / firstWeight) * 100;
        }

        // Calculate changes for other measurement fields
        const fields: MeasurementField[] = ['chest', 'waist', 'hips', 'biceps', 'thighs'];

        fields.forEach(field => {
            // Safely access the field values
            const firstValue = firstMeasurement[field];
            const lastValue = lastMeasurement[field];

            // Check if both values exist and are numbers
            if (firstValue !== null && lastValue !== null) {
                const change = lastValue - firstValue;

                // Assign to the appropriate property in stats
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

    async getMeasurementTrends(clientId: string, field: MeasurementField, days: number = 30): Promise<MeasurementTrend[]> {
        const validFields: MeasurementField[] = ['weight', 'chest', 'waist', 'hips', 'biceps', 'thighs'];
        if (!validFields.includes(field)) {
            throw new AppError(`Invalid field: ${field}. Must be one of: ${validFields.join(', ')}`, 400);
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const measurements = await prisma.measurement.findMany({
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

        // Map the results to MeasurementTrend objects
        return measurements.map(m => {
            const trend: MeasurementTrend = {
                date: m.date
            };

            // Assign the field value dynamically
            const value = m[field];
            if (value !== null) {
                trend[field] = value;
            }

            return trend;
        });
    }

    async calculateBodyComposition(clientId: string): Promise<BodyComposition> {
        const latestMeasurement = await prisma.measurement.findFirst({
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

        const bodyComposition: BodyComposition = {};

        // Get client info for BMI calculation
        const client = await prisma.clientProfile.findUnique({
            where: { id: clientId },
            select: { dateOfBirth: true, gender: true }
        });

        // Calculate BMI (simplified - need height which isn't in schema)
        // For now, we'll leave BMI calculation for when height is added

        // Calculate Waist-to-Hip Ratio
        if (latestMeasurement.waist !== null && latestMeasurement.hips !== null) {
            bodyComposition.waistToHipRatio = latestMeasurement.waist / latestMeasurement.hips;
        }

        // Estimate Body Fat Percentage using US Navy method (simplified)
        // This is a simplified estimation and should be replaced with proper calculations
        if (latestMeasurement.waist !== null && latestMeasurement.weight !== null && client?.gender) {
            // This is a very rough estimate - in production, use proper formulas
            if (client.gender === 'MALE') {
                bodyComposition.bodyFatPercentage = (latestMeasurement.waist * 0.5) / latestMeasurement.weight * 100;
            } else {
                bodyComposition.bodyFatPercentage = (latestMeasurement.waist * 0.6) / latestMeasurement.weight * 100;
            }
        }

        return bodyComposition;
    }

    async getLatestMeasurement(clientId: string) {
        return await prisma.measurement.findFirst({
            where: { clientId },
            orderBy: { date: 'desc' }
        });
    }

    async bulkCreateMeasurements(clientId: string, measurements: MeasurementData[]) {
        // Verify client exists
        const client = await prisma.clientProfile.findUnique({
            where: { id: clientId }
        });

        if (!client) {
            throw new AppError("Client not found", 404);
        }

        // Process dates and check for duplicates
        const processedMeasurements = measurements.map(m => ({
            ...m,
            date: m.date ? new Date(m.date) : new Date()
        }));

        return await prisma.$transaction(async (tx) => {
            const createdMeasurements = [];

            for (const measurement of processedMeasurements) {
                // Create new date objects for the day range check
                const measurementDate = new Date(measurement.date);
                const startOfDay = new Date(measurementDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(measurementDate);
                endOfDay.setHours(23, 59, 59, 999);

                // Check for existing measurement on same date
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

    async exportMeasurements(clientId: string, format: 'csv' | 'json' = 'json') {
        const measurements = await prisma.measurement.findMany({
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