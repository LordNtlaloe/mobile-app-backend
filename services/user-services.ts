// services/user-services.ts
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";;

export class UserService {
    async getAllUsers(role?: Role, verified?: boolean) {
        const where: any = {};

        if (role) {
            where.role = role;
        }

        if (verified !== undefined) {
            where.isVerified = verified;
        }

        const users = await prisma.user.findMany({
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

    async getUserById(userId: string) {
        const user = await prisma.user.findUnique({
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

    async updateUser(userId: string, data: {
        firstName?: string;
        lastName?: string;
        role?: Role;
        isVerified?: boolean;
    }) {
        return await prisma.user.update({
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

    async deleteUser(userId: string) {
        return await prisma.user.delete({
            where: { id: userId }
        });
    }

    async revokeUserRefreshTokens(userId: string) {
        await prisma.refreshToken.deleteMany({
            where: { userId }
        });

        return { message: "All refresh tokens revoked" };
    }

    async getUserStats() {
        const [
            totalUsers,
            totalClients,
            totalTrainers,
            totalAdmins,
            verifiedUsers,
            recentUsers
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: Role.CLIENT } }),
            prisma.user.count({ where: { role: Role.TRAINER } }),
            prisma.user.count({ where: { role: Role.ADMIN } }),
            prisma.user.count({ where: { isVerified: true } }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
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

    async searchUsers(query: string) {
        return await prisma.user.findMany({
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