// services/staff-services.ts
import { prisma } from "../lib/prisma";
import { Department } from "../generated/prisma";

export interface StaffData {
    firstName: string;
    lastName: string;
    department: Department;
    specialization?: string;
    contactInfo: string;
    isActive?: boolean;
}

export class StaffService {
    async createStaff(userId: string, data: StaffData) {
        // Check if staff profile already exists
        const existingStaff = await prisma.staff.findUnique({
            where: { userId }
        });

        if (existingStaff) {
            throw new Error("Staff profile already exists");
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Update user's first and last name
        await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName
            }
        });

        return await prisma.staff.create({
            data: {
                userId,
                ...data
            }
        });
    }

    async getStaff(staffId: string) {
        const staff = await prisma.staff.findUnique({
            where: { id: staffId },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        isVerified: true,
                        createdAt: true
                    }
                },
                clientProfiles: {
                    include: {
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!staff) {
            throw new Error("Staff not found");
        }

        return staff;
    }

    async updateStaff(staffId: string, data: Partial<StaffData>) {
        return await prisma.staff.update({
            where: { id: staffId },
            data
        });
    }

    async deactivateStaff(staffId: string) {
        return await prisma.staff.update({
            where: { id: staffId },
            data: { isActive: false }
        });
    }

    async activateStaff(staffId: string) {
        return await prisma.staff.update({
            where: { id: staffId },
            data: { isActive: true }
        });
    }

    async getAllStaff(department?: Department, activeOnly: boolean = true) {
        const where: any = {};

        if (department) {
            where.department = department;
        }

        if (activeOnly) {
            where.isActive = true;
        }

        return await prisma.staff.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                },
                _count: {
                    select: { clientProfiles: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getStaffByDepartment(department: Department) {
        return await prisma.staff.findMany({
            where: {
                department,
                isActive: true
            },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });
    }

    async searchStaff(query: string) {
        return await prisma.staff.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { specialization: { contains: query, mode: 'insensitive' } }
                ],
                isActive: true
            },
            take: 20,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });
    }

    async getStaffClients(staffId: string) {
        const staff = await prisma.staff.findUnique({
            where: { id: staffId },
            include: {
                clientProfiles: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                createdAt: true
                            }
                        },
                        measurements: {
                            orderBy: { date: 'desc' },
                            take: 1
                        },
                        fitnessGoals: {
                            where: { achieved: false },
                            take: 3
                        }
                    }
                }
            }
        });

        if (!staff) {
            throw new Error("Staff not found");
        }

        return staff.clientProfiles;
    }
}