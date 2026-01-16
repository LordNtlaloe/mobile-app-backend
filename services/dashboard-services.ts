// services/dashboard-services.ts
import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma";

export interface DashboardMetrics {
    overview: {
        totalClients: number;
        totalTrainers: number;
        totalMeasurements: number;
        totalNutritionLogs: number;
        activeClients: number;
        newClientsThisMonth: number;
    };
    recentActivity: any[];
    upcomingEvents: any[];
    statistics: {
        clientGrowth: { month: string; count: number }[];
        measurementsTrend: { month: string; count: number }[];
        nutritionTrend: { month: string; count: number }[];
    };
}

export interface ClientDashboard {
    profile: {
        firstName: string;
        lastName: string;
        targetWeight?: number;
        assignedTrainer?: {
            firstName: string;
            lastName: string;
        };
    };
    progress: {
        latestWeight?: number;
        weightChange?: number;
        totalMeasurements: number;
        totalNutritionLogs: number;
    };
    recentMeasurements: any[];
    recentNutritionLogs: any[];
    fitnessGoals: {
        total: number;
        achieved: number;
        upcoming: any[];
    };
    upcomingAppointments?: any[];
}

export interface TrainerDashboard {
    profile: {
        firstName: string;
        lastName: string;
        department: string;
        specialization?: string;
    };
    clients: {
        total: number;
        active: number;
        newThisMonth: number;
    };
    clientProgress: {
        clientsWithRecentMeasurements: number;
        clientsWithGoals: number;
        averageClientAge?: number;
    };
    recentClientActivity: any[];
    upcomingSessions: any[];
    performanceMetrics: {
        clientSatisfaction?: number;
        averageGoalCompletion?: number;
        busiestDay?: string;
    };
}

export interface AdminDashboard {
    systemOverview: {
        totalUsers: number;
        totalClients: number;
        totalTrainers: number;
        totalAdmins: number;
        verifiedUsers: number;
    };
    platformStats: {
        totalMeasurements: number;
        totalNutritionLogs: number;
        totalMedicalRecords: number;
        averageMeasurementsPerClient: number;
    };
    growthMetrics: {
        userGrowth: { month: string; count: number }[];
        revenue?: { month: string; amount: number }[];
        engagement: { month: string; logins: number }[];
    };
    systemHealth: {
        databaseSize: string;
        uptime: number;
        activeSessions: number;
        errorRate: number;
    };
    recentRegistrations: any[];
    topTrainers: any[];
}

export class DashboardService {
    async getRoleBasedDashboard(userId: string, role: Role): Promise<any> {
        switch (role) {
            case Role.ADMIN:
                return await this.getAdminDashboard();
            case Role.TRAINER:
                return await this.getTrainerDashboard(userId);
            case Role.CLIENT:
                return await this.getClientDashboard(userId);
            default:
                throw new Error("Invalid role");
        }
    }

    async getAdminDashboard(): Promise<AdminDashboard> {
        // Get current date for calculations
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

        // Fetch all data in parallel for performance
        const [
            totalUsers,
            totalClients,
            totalTrainers,
            totalAdmins,
            verifiedUsers,
            totalMeasurements,
            totalNutritionLogs,
            totalMedicalRecords,
            recentRegistrations,
            userGrowth
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: Role.CLIENT } }),
            prisma.user.count({ where: { role: Role.TRAINER } }),
            prisma.user.count({ where: { role: Role.ADMIN } }),
            prisma.user.count({ where: { isVerified: true } }),
            prisma.measurement.count(),
            prisma.nutritionLog.count(),
            prisma.$transaction([
                prisma.medicalCondition.count(),
                prisma.allergy.count(),
                prisma.medication.count(),
                prisma.injury.count()
            ]).then(([conditions, allergies, medications, injuries]) =>
                conditions + allergies + medications + injuries
            ),
            prisma.user.findMany({
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

        // Calculate average measurements per client
        const averageMeasurementsPerClient = totalClients > 0
            ? Math.round((totalMeasurements / totalClients) * 100) / 100
            : 0;

        // Get top trainers by number of clients
        const topTrainers = await prisma.staff.findMany({
            where: {
                isActive: true,
                user: { role: Role.TRAINER }
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

        // Create admin dashboard response matching the interface
        const adminDashboard: AdminDashboard = {
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
                uptime: process.uptime(), // In seconds
                activeSessions: await this.getActiveSessionsCount(),
                errorRate: 0.05 // Placeholder - implement error tracking
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

    async getTrainerDashboard(trainerUserId: string): Promise<TrainerDashboard> {
        // Get trainer profile
        const trainer = await prisma.staff.findUnique({
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

        // Get trainer's clients
        const clients = await prisma.clientProfile.findMany({
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

        // Calculate various metrics
        const activeClients = clients.filter(client => {
            // Active = has had activity in the last 30 days
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const latestMeasurement = client.measurements[0];
            return latestMeasurement && latestMeasurement.date >= thirtyDaysAgo;
        });

        const newClientsThisMonth = clients.filter(client =>
            new Date(client.createdAt) >= startOfMonth
        ).length;

        // Get recent client activity
        const recentClientActivity = await this.getTrainerClientActivity(trainer.id);

        // Calculate client age statistics
        const clientAges = clients
            .filter(client => client.dateOfBirth)
            .map(client => {
                const birthDate = new Date(client.dateOfBirth!);
                const age = now.getFullYear() - birthDate.getFullYear();
                const monthDiff = now.getMonth() - birthDate.getMonth();
                return monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())
                    ? age - 1
                    : age;
            });

        const averageClientAge = clientAges.length > 0
            ? Math.round(clientAges.reduce((a, b) => a + b, 0) / clientAges.length)
            : undefined;

        // Get upcoming sessions (you might need to add a sessions model)
        const upcomingSessions: any[] = []; // Placeholder - implement when you have sessions

        // Create trainer dashboard response matching the interface
        const trainerDashboard: TrainerDashboard = {
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

    async getClientDashboard(clientUserId: string): Promise<ClientDashboard> {
        // Get client profile
        const clientProfile = await prisma.clientProfile.findUnique({
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

        // Calculate weight progress
        let latestWeight: number | undefined;
        let weightChange: number | undefined;

        if (clientProfile.measurements.length > 1) {
            const sortedMeasurements = [...clientProfile.measurements].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            if (sortedMeasurements[0].weight && sortedMeasurements[1].weight) {
                latestWeight = sortedMeasurements[0].weight;
                weightChange = latestWeight - sortedMeasurements[1].weight;
            }
        } else if (clientProfile.measurements.length === 1) {
            latestWeight = clientProfile.measurements[0].weight || undefined;
        }

        // Get total counts
        const [totalMeasurements, totalNutritionLogs, totalGoals] = await Promise.all([
            prisma.measurement.count({ where: { clientId: clientProfile.id } }),
            prisma.nutritionLog.count({ where: { clientId: clientProfile.id } }),
            prisma.fitnessGoal.count({ where: { clientId: clientProfile.id } })
        ]);

        // Get achieved goals count
        const achievedGoals = await prisma.fitnessGoal.count({
            where: {
                clientId: clientProfile.id,
                achieved: true
            }
        });

        // Get upcoming goals (within next 30 days)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcomingGoals = await prisma.fitnessGoal.findMany({
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

        // Create client dashboard response matching the interface
        const clientDashboard: ClientDashboard = {
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
            upcomingAppointments: [] // Placeholder - implement when you have appointments/sessions
        };

        return clientDashboard;
    }

    // Helper methods
    private async calculateUserGrowth(startDate: Date, endDate: Date): Promise<{ month: string; count: number }[]> {
        const growth = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

            const count = await prisma.user.count({
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

    private async calculateEngagement(startDate: Date, endDate: Date): Promise<{ month: string; logins: number }[]> {
        // Placeholder - implement when you have login tracking
        // For now, return empty array
        return [];
    }

    private async estimateDatabaseSize(): Promise<string> {
        // Placeholder - implement database size estimation
        // This could be a PostgreSQL query or use your hosting provider's API
        return "~500 MB";
    }

    private async getActiveSessionsCount(): Promise<number> {
        // Placeholder - implement session tracking
        // Could be based on active refresh tokens or your session management
        return await prisma.refreshToken.count({
            where: {
                expiresAt: { gt: new Date() },
                revoked: false
            }
        });
    }

    private async getTrainerClientActivity(trainerId: string): Promise<any[]> {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const clients = await prisma.clientProfile.findMany({
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
        })).filter(activity =>
            activity.lastMeasurement || activity.lastNutritionLog
        ).sort((a, b) => {
            // Sort by most recent activity
            const aDate = a.lastMeasurement?.date || a.lastNutritionLog?.date;
            const bDate = b.lastMeasurement?.date || b.lastNutritionLog?.date;
            return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime();
        }).slice(0, 10); // Return top 10
    }

    private async calculateTrainerSatisfaction(trainerId: string): Promise<number> {
        // Placeholder - implement when you have feedback/rating system
        // For now, return a placeholder or calculate based on goal completion
        const clients = await prisma.clientProfile.findMany({
            where: { assignedTrainerId: trainerId },
            include: {
                fitnessGoals: true
            }
        });

        if (clients.length === 0) return 0;

        let totalGoals = 0;
        let achievedGoals = 0;

        clients.forEach(client => {
            totalGoals += client.fitnessGoals.length;
            achievedGoals += client.fitnessGoals.filter(g => g.achieved).length;
        });

        return totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;
    }

    private async calculateAverageGoalCompletion(trainerId: string): Promise<number> {
        const clients = await prisma.clientProfile.findMany({
            where: { assignedTrainerId: trainerId },
            include: {
                fitnessGoals: true
            }
        });

        if (clients.length === 0) return 0;

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

    private async getBusiestDay(trainerId: string): Promise<string> {
        // Placeholder - implement when you have session scheduling
        // For now, return a placeholder
        return "Monday";
    }
}