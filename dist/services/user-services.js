"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../lib/prisma");
const prisma_2 = require("../generated/prisma");
class UserService {
    async getAllUsers(role, verified) {
        const where = {};
        if (role) {
            where.role = role;
        }
        if (verified !== undefined) {
            where.isVerified = verified;
        }
        const users = await prisma_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                createdAt: true,
                clientProfile: {
                    select: {
                        phone: true,
                        assignedTrainer: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                staffProfile: {
                    select: {
                        department: true,
                        isActive: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return users;
    }
    async getUserById(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                clientProfile: {
                    include: {
                        assignedTrainer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                staffProfile: true,
                refreshTokens: {
                    select: {
                        id: true,
                        createdAt: true,
                        expiresAt: true,
                        revoked: true
                    }
                }
            }
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async updateUser(userId, data) {
        return await prisma_1.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true
            }
        });
    }
    async deleteUser(userId) {
        return await prisma_1.prisma.user.delete({
            where: { id: userId }
        });
    }
    async revokeUserRefreshTokens(userId) {
        await prisma_1.prisma.refreshToken.deleteMany({
            where: { userId }
        });
        return { message: "All refresh tokens revoked" };
    }
    async getUserStats() {
        const [totalUsers, totalClients, totalTrainers, totalAdmins, verifiedUsers, recentUsers] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count({ where: { role: prisma_2.Role.CLIENT } }),
            prisma_1.prisma.user.count({ where: { role: prisma_2.Role.TRAINER } }),
            prisma_1.prisma.user.count({ where: { role: prisma_2.Role.ADMIN } }),
            prisma_1.prisma.user.count({ where: { isVerified: true } }),
            prisma_1.prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);
        return {
            totalUsers,
            byRole: {
                clients: totalClients,
                trainers: totalTrainers,
                admins: totalAdmins
            },
            verifiedUsers,
            unverifiedUsers: totalUsers - verifiedUsers,
            recentUsers
        };
    }
    async searchUsers(query) {
        return await prisma_1.prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                createdAt: true
            },
            take: 20
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user-services.js.map