"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_1 = require("../lib/prisma");
const prisma_2 = require("../generated/prisma");
class DashboardService {
    async getRoleBasedDashboard(userId, role) {
        switch (role) {
            case prisma_2.Role.ADMIN:
                return await this.getAdminDashboard();
            case prisma_2.Role.TRAINER:
                return await this.getTrainerDashboard(userId);
            case prisma_2.Role.CLIENT:
                return await this.getClientDashboard(userId);
            default:
                throw new Error("Invalid role");
        }
    }
    async getAdminDashboard() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        const [totalUsers, totalClients, totalTrainers, totalAdmins, verifiedUsers, totalMeasurements, totalNutritionLogs, totalMedicalRecords, recentRegistrations, userGrowth] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count({ where: { role: prisma_2.Role.CLIENT } }),
            prisma_1.prisma.user.count({ where: { role: prisma_2.Role.TRAINER } }),
            prisma_1.prisma.user.count({ where: { role: prisma_2.Role.ADMIN } }),
            prisma_1.prisma.user.count({ where: { isVerified: true } }),
            prisma_1.prisma.measurement.count(),
            prisma_1.prisma.nutritionLog.count(),
            prisma_1.prisma.$transaction([
                prisma_1.prisma.medicalCondition.count(),
                prisma_1.prisma.allergy.count(),
                prisma_1.prisma.medication.count(),
                prisma_1.prisma.injury.count()
            ]).then(([conditions, allergies, medications, injuries]) => conditions + allergies + medications + injuries),
            prisma_1.prisma.user.findMany({
                where: {
                    createdAt: { gte: startOfMonth }
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }),
            this.calculateUserGrowth(sixMonthsAgo, now)
        ]);
        const averageMeasurementsPerClient = totalClients > 0
            ? Math.round((totalMeasurements / totalClients) * 100) / 100
            : 0;
        const topTrainers = await prisma_1.prisma.staff.findMany({
            where: {
                isActive: true,
                user: { role: prisma_2.Role.TRAINER }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                specialization: true,
                _count: {
                    select: { clientProfiles: true }
                }
            },
            orderBy: {
                clientProfiles: {
                    _count: 'desc'
                }
            },
            take: 5
        });
        const adminDashboard = {
            systemOverview: {
                totalUsers,
                totalClients,
                totalTrainers,
                totalAdmins,
                verifiedUsers
            },
            platformStats: {
                totalMeasurements,
                totalNutritionLogs,
                totalMedicalRecords,
                averageMeasurementsPerClient
            },
            growthMetrics: {
                userGrowth,
                engagement: await this.calculateEngagement(sixMonthsAgo, now)
            },
            systemHealth: {
                databaseSize: await this.estimateDatabaseSize(),
                uptime: process.uptime(),
                activeSessions: await this.getActiveSessionsCount(),
                errorRate: 0.05
            },
            recentRegistrations,
            topTrainers: topTrainers.map(trainer => ({
                id: trainer.id,
                name: `${trainer.firstName} ${trainer.lastName}`,
                department: trainer.department,
                specialization: trainer.specialization || undefined,
                clientCount: trainer._count.clientProfiles
            }))
        };
        return adminDashboard;
    }
    async getTrainerDashboard(trainerUserId) {
        const trainer = await prisma_1.prisma.staff.findUnique({
            where: { userId: trainerUserId },
            include: {
                user: {
                    select: {
                        email: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!trainer) {
            throw new Error("Trainer not found");
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const clients = await prisma_1.prisma.clientProfile.findMany({
            where: { assignedTrainerId: trainer.id },
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
        });
        const activeClients = clients.filter(client => {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const latestMeasurement = client.measurements[0];
            return latestMeasurement && latestMeasurement.date >= thirtyDaysAgo;
        });
        const newClientsThisMonth = clients.filter(client => new Date(client.createdAt) >= startOfMonth).length;
        const recentClientActivity = await this.getTrainerClientActivity(trainer.id);
        const clientAges = clients
            .filter(client => client.dateOfBirth)
            .map(client => {
            const birthDate = new Date(client.dateOfBirth);
            const age = now.getFullYear() - birthDate.getFullYear();
            const monthDiff = now.getMonth() - birthDate.getMonth();
            return monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())
                ? age - 1
                : age;
        });
        const averageClientAge = clientAges.length > 0
            ? Math.round(clientAges.reduce((a, b) => a + b, 0) / clientAges.length)
            : undefined;
        const upcomingSessions = [];
        const trainerDashboard = {
            profile: {
                firstName: trainer.firstName,
                lastName: trainer.lastName,
                department: trainer.department,
                specialization: trainer.specialization || undefined
            },
            clients: {
                total: clients.length,
                active: activeClients.length,
                newThisMonth: newClientsThisMonth
            },
            clientProgress: {
                clientsWithRecentMeasurements: clients.filter(c => c.measurements.length > 0).length,
                clientsWithGoals: clients.filter(c => c.fitnessGoals.length > 0).length,
                averageClientAge
            },
            recentClientActivity,
            upcomingSessions,
            performanceMetrics: {
                clientSatisfaction: await this.calculateTrainerSatisfaction(trainer.id),
                averageGoalCompletion: await this.calculateAverageGoalCompletion(trainer.id),
                busiestDay: await this.getBusiestDay(trainer.id)
            }
        };
        return trainerDashboard;
    }
    async getClientDashboard(clientUserId) {
        const clientProfile = await prisma_1.prisma.clientProfile.findUnique({
            where: { userId: clientUserId },
            include: {
                user: {
                    select: {
                        email: true,
                        createdAt: true
                    }
                },
                assignedTrainer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        specialization: true
                    }
                },
                measurements: {
                    orderBy: { date: 'desc' },
                    take: 5
                },
                nutritionLogs: {
                    orderBy: { date: 'desc' },
                    take: 5
                },
                fitnessGoals: {
                    where: { achieved: false },
                    orderBy: { targetDate: 'asc' },
                    take: 5
                }
            }
        });
        if (!clientProfile) {
            throw new Error("Client profile not found");
        }
        const now = new Date();
        let latestWeight;
        let weightChange;
        if (clientProfile.measurements.length > 1) {
            const sortedMeasurements = [...clientProfile.measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            if (sortedMeasurements[0].weight && sortedMeasurements[1].weight) {
                latestWeight = sortedMeasurements[0].weight;
                weightChange = latestWeight - sortedMeasurements[1].weight;
            }
        }
        else if (clientProfile.measurements.length === 1) {
            latestWeight = clientProfile.measurements[0].weight || undefined;
        }
        const [totalMeasurements, totalNutritionLogs, totalGoals] = await Promise.all([
            prisma_1.prisma.measurement.count({ where: { clientId: clientProfile.id } }),
            prisma_1.prisma.nutritionLog.count({ where: { clientId: clientProfile.id } }),
            prisma_1.prisma.fitnessGoal.count({ where: { clientId: clientProfile.id } })
        ]);
        const achievedGoals = await prisma_1.prisma.fitnessGoal.count({
            where: {
                clientId: clientProfile.id,
                achieved: true
            }
        });
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcomingGoals = await prisma_1.prisma.fitnessGoal.findMany({
            where: {
                clientId: clientProfile.id,
                achieved: false,
                targetDate: {
                    gte: now,
                    lte: thirtyDaysFromNow
                }
            },
            orderBy: { targetDate: 'asc' },
            take: 3
        });
        const clientDashboard = {
            profile: {
                firstName: clientProfile.firstName,
                lastName: clientProfile.lastName,
                targetWeight: clientProfile.targetWeight || undefined,
                assignedTrainer: clientProfile.assignedTrainer ? {
                    firstName: clientProfile.assignedTrainer.firstName,
                    lastName: clientProfile.assignedTrainer.lastName
                } : undefined
            },
            progress: {
                latestWeight,
                weightChange,
                totalMeasurements,
                totalNutritionLogs
            },
            recentMeasurements: clientProfile.measurements.map(m => ({
                date: m.date,
                weight: m.weight,
                chest: m.chest,
                waist: m.waist,
                notes: m.notes
            })),
            recentNutritionLogs: clientProfile.nutritionLogs.map(log => ({
                date: log.date,
                mealType: log.mealType,
                notes: log.notes
            })),
            fitnessGoals: {
                total: totalGoals,
                achieved: achievedGoals,
                upcoming: upcomingGoals.map(goal => ({
                    id: goal.id,
                    goal: goal.goal,
                    targetDate: goal.targetDate,
                    description: goal.description
                }))
            },
            upcomingAppointments: []
        };
        return clientDashboard;
    }
    async calculateUserGrowth(startDate, endDate) {
        const growth = [];
        const current = new Date(startDate);
        while (current <= endDate) {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
            const count = await prisma_1.prisma.user.count({
                where: {
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                }
            });
            growth.push({
                month: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
                count
            });
            current.setMonth(current.getMonth() + 1);
        }
        return growth;
    }
    async calculateEngagement(startDate, endDate) {
        return [];
    }
    async estimateDatabaseSize() {
        return "~500 MB";
    }
    async getActiveSessionsCount() {
        return await prisma_1.prisma.refreshToken.count({
            where: {
                expiresAt: { gt: new Date() },
                revoked: false
            }
        });
    }
    async getTrainerClientActivity(trainerId) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const clients = await prisma_1.prisma.clientProfile.findMany({
            where: { assignedTrainerId: trainerId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                measurements: {
                    where: { date: { gte: thirtyDaysAgo } },
                    orderBy: { date: 'desc' },
                    take: 1,
                    select: { date: true, weight: true }
                },
                nutritionLogs: {
                    where: { date: { gte: thirtyDaysAgo } },
                    orderBy: { date: 'desc' },
                    take: 1,
                    select: { date: true, mealType: true }
                }
            }
        });
        return clients.map(client => ({
            clientId: client.id,
            clientName: `${client.firstName} ${client.lastName}`,
            lastMeasurement: client.measurements[0] ? {
                date: client.measurements[0].date,
                weight: client.measurements[0].weight
            } : null,
            lastNutritionLog: client.nutritionLogs[0] ? {
                date: client.nutritionLogs[0].date,
                mealType: client.nutritionLogs[0].mealType
            } : null
        })).filter(activity => activity.lastMeasurement || activity.lastNutritionLog).sort((a, b) => {
            const aDate = a.lastMeasurement?.date || a.lastNutritionLog?.date;
            const bDate = b.lastMeasurement?.date || b.lastNutritionLog?.date;
            return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime();
        }).slice(0, 10);
    }
    async calculateTrainerSatisfaction(trainerId) {
        const clients = await prisma_1.prisma.clientProfile.findMany({
            where: { assignedTrainerId: trainerId },
            include: {
                fitnessGoals: true
            }
        });
        if (clients.length === 0)
            return 0;
        let totalGoals = 0;
        let achievedGoals = 0;
        clients.forEach(client => {
            totalGoals += client.fitnessGoals.length;
            achievedGoals += client.fitnessGoals.filter(g => g.achieved).length;
        });
        return totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;
    }
    async calculateAverageGoalCompletion(trainerId) {
        const clients = await prisma_1.prisma.clientProfile.findMany({
            where: { assignedTrainerId: trainerId },
            include: {
                fitnessGoals: true
            }
        });
        if (clients.length === 0)
            return 0;
        const completionRates = clients
            .filter(client => client.fitnessGoals.length > 0)
            .map(client => {
            const total = client.fitnessGoals.length;
            const achieved = client.fitnessGoals.filter(g => g.achieved).length;
            return (achieved / total) * 100;
        });
        return completionRates.length > 0
            ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
            : 0;
    }
    async getBusiestDay(trainerId) {
        return "Monday";
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard-services.js.map