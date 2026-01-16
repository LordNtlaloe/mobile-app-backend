"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const prisma_1 = require("../lib/prisma");
class StaffService {
    async createStaff(userId, data) {
        const existingStaff = await prisma_1.prisma.staff.findUnique({
            where: { userId }
        });
        if (existingStaff) {
            throw new Error("Staff profile already exists");
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error("User not found");
        }
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName
            }
        });
        return await prisma_1.prisma.staff.create({
            data: {
                userId,
                ...data
            }
        });
    }
    async getStaff(staffId) {
        const staff = await prisma_1.prisma.staff.findUnique({
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
    async updateStaff(staffId, data) {
        return await prisma_1.prisma.staff.update({
            where: { id: staffId },
            data
        });
    }
    async deactivateStaff(staffId) {
        return await prisma_1.prisma.staff.update({
            where: { id: staffId },
            data: { isActive: false }
        });
    }
    async activateStaff(staffId) {
        return await prisma_1.prisma.staff.update({
            where: { id: staffId },
            data: { isActive: true }
        });
    }
    async getAllStaff(department, activeOnly = true) {
        const where = {};
        if (department) {
            where.department = department;
        }
        if (activeOnly) {
            where.isActive = true;
        }
        return await prisma_1.prisma.staff.findMany({
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
    async getStaffByDepartment(department) {
        return await prisma_1.prisma.staff.findMany({
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
    async searchStaff(query) {
        return await prisma_1.prisma.staff.findMany({
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
    async getStaffClients(staffId) {
        const staff = await prisma_1.prisma.staff.findUnique({
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
exports.StaffService = StaffService;
//# sourceMappingURL=staff-services.js.map