"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const prisma_1 = require("../lib/prisma");
class ClientService {
    async createClientProfile(userId, data) {
        const existingProfile = await prisma_1.prisma.clientProfile.findUnique({
            where: { userId }
        });
        if (existingProfile) {
            throw new Error("Client profile already exists");
        }
        if (data.assignedTrainerId) {
            const trainer = await prisma_1.prisma.staff.findUnique({
                where: { id: data.assignedTrainerId }
            });
            if (!trainer) {
                throw new Error("Trainer not found");
            }
        }
        return await prisma_1.prisma.clientProfile.create({
            data: {
                userId,
                ...data
            },
            include: {
                assignedTrainer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                }
            }
        });
    }
    async getClientProfile(userId) {
        const profile = await prisma_1.prisma.clientProfile.findUnique({
            where: { userId },
            include: {
                assignedTrainer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        department: true,
                        specialization: true
                    }
                },
                medicalConditions: true,
                allergies: true,
                medications: true,
                injuries: true,
                fitnessGoals: true,
                dietaryRestrictions: true,
                measurements: {
                    orderBy: { date: 'desc' },
                    take: 10
                },
                nutritionLogs: {
                    orderBy: { date: 'desc' },
                    take: 10
                }
            }
        });
        if (!profile) {
            throw new Error("Client profile not found");
        }
        return profile;
    }
    async updateClientProfile(userId, data) {
        if (data.assignedTrainerId) {
            const trainer = await prisma_1.prisma.staff.findUnique({
                where: { id: data.assignedTrainerId }
            });
            if (!trainer) {
                throw new Error("Trainer not found");
            }
        }
        return await prisma_1.prisma.clientProfile.update({
            where: { userId },
            data,
            include: {
                assignedTrainer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                }
            }
        });
    }
    async deleteClientProfile(userId) {
        return await prisma_1.prisma.clientProfile.delete({
            where: { userId }
        });
    }
    async getAllClients(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [clients, total] = await Promise.all([
            prisma_1.prisma.clientProfile.findMany({
                skip,
                take: limit,
                include: {
                    assignedTrainer: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    },
                    user: {
                        select: {
                            email: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.clientProfile.count()
        ]);
        return {
            clients,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async searchClients(query) {
        return await prisma_1.prisma.clientProfile.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 20,
            include: {
                assignedTrainer: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }
}
exports.ClientService = ClientService;
//# sourceMappingURL=client-services.js.map