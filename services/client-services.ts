// services/client-services.ts
import { prisma } from "../lib/prisma";
import { Gender } from "../generated/prisma";

export interface ClientProfileData {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    occupation?: string;
    alcoholConsumption?: boolean;
    smokingStatus?: boolean;
    targetWeight?: number;
    assignedTrainerId?: string;
}

export class ClientService {
    async createClientProfile(userId: string, data: ClientProfileData) {
        // Check if client profile already exists
        const existingProfile = await prisma.clientProfile.findUnique({
            where: { userId }
        });

        if (existingProfile) {
            throw new Error("Client profile already exists");
        }

        // Check if trainer exists if assigned
        if (data.assignedTrainerId) {
            const trainer = await prisma.staff.findUnique({
                where: { id: data.assignedTrainerId }
            });
            if (!trainer) {
                throw new Error("Trainer not found");
            }
        }

        return await prisma.clientProfile.create({
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

    async getClientProfile(userId: string) {
        const profile = await prisma.clientProfile.findUnique({
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

    async updateClientProfile(userId: string, data: Partial<ClientProfileData>) {
        // Check if trainer exists if being assigned
        if (data.assignedTrainerId) {
            const trainer = await prisma.staff.findUnique({
                where: { id: data.assignedTrainerId }
            });
            if (!trainer) {
                throw new Error("Trainer not found");
            }
        }

        return await prisma.clientProfile.update({
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

    async deleteClientProfile(userId: string) {
        return await prisma.clientProfile.delete({
            where: { userId }
        });
    }

    async getAllClients(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [clients, total] = await Promise.all([
            prisma.clientProfile.findMany({
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
            prisma.clientProfile.count()
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

    async searchClients(query: string) {
        return await prisma.clientProfile.findMany({
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