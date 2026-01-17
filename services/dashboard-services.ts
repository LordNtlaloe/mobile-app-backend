// services/dashboard-services.ts
import { prisma } from "../lib/prisma";
import { Department, Role, Gender, MealType } from "@prisma/client";

export interface DashboardStats {
    overview: OverviewStats;
    users: UserStats;
    clients: ClientStats;
    staff: StaffStats;
    healthMetrics: HealthMetrics;
    engagement: EngagementStats;
    charts: ChartData;
    recentActivities: RecentActivity[];
    topPerforming: TopPerformingStats;
    kpis: KPI[];
}

export interface OverviewStats {
    totalUsers: number;
    totalClients: number;
    totalStaff: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
}

export interface UserStats {
    byRole: {
        client: number;
        trainer: number;
        admin: number;
    };
    byVerification: {
        verified: number;
        unverified: number;
    };
    byGender: {
        male: number;
        female: number;
        other: number;
    };
    registrationTrend: MonthlyTrend[];
}

export interface ClientStats {
    totalClients: number;
    clientsWithTrainers: number;
    avgTargetWeight: number;
    demographics: {
        byAgeGroup: AgeGroupStats[];
        byGender: GenderStats[];
    };
    lifestyle: {
        smokers: number;
        alcoholConsumers: number;
    };
    progress: {
        clientsWithMeasurements: number;
        avgMeasurementsPerClient: number;
    };
}

export interface StaffStats {
    totalStaff: number;
    byDepartment: DepartmentStats[];
    activeTrainers: number;
    avgClientsPerTrainer: number;
    staffLoad: TrainerLoad[];
}

export interface HealthMetrics {
    medicalConditions: {
        total: number;
        topConditions: ConditionStats[];
    };
    allergies: {
        total: number;
        topAllergens: AllergenStats[];
    };
    medications: {
        total: number;
    };
    injuries: {
        total: number;
        active: number;
    };
}

interface MealTypeStats {
    mealType: string;
    count: number;
    percentage: number;
}

export interface EngagementStats {
    avgNutritionLogs: number;
    clientsWithGoals: number;
    goalsAchieved: number;
    goalCompletionRate: number;
    activeClients: number;
    retentionRate: number;
}

export interface ChartData {
    userGrowth: TimeSeriesData[];
    clientEnrollment: TimeSeriesData[];
    departmentDistribution: DepartmentStats[];
    genderDistribution: GenderStats[];
    ageDistribution: BarChartData[];
    mealTypeDistribution: MealTypeStats[];
    measurementTrend: LineChartData[];
    trainerPerformance: BarChartData[];
}

export interface RecentActivity {
    id: string;
    type: 'user_registration' | 'client_created' | 'measurement_logged' | 'goal_achieved' | 'staff_assigned';
    description: string;
    timestamp: Date;
    userId?: string;
    clientName?: string;
    staffName?: string;
}

export interface TopPerformingStats {
    topTrainers: TopTrainer[];
    mostImprovedClients: ImprovedClient[];
    mostActiveClients: ActiveClient[];
}

export interface KPI {
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
}

export interface MonthlyTrend {
    month: string;
    count: number;
    growth: number;
}

export interface AgeGroupStats {
    group: string;
    count: number;
    percentage: number;
}

export interface GenderStats {
    gender: string;
    count: number;
    percentage: number;
}

export interface DepartmentStats {
    department: string;
    count: number;
    percentage: number;
}

export interface TrainerLoad {
    trainerId: string;
    trainerName: string;
    clientCount: number;
    department: string;
}

export interface ConditionStats {
    condition: string;
    count: number;
}

export interface AllergenStats {
    allergen: string;
    count: number;
}

export interface TimeSeriesData {
    date: string;
    value: number;
}

export interface PieChartData {
    name: string;
    value: number;
    percentage: number;
}

export interface BarChartData {
    name: string;
    value: number;
}

export interface LineChartData {
    date: string;
    weight: number;
    waist: number;
    chest: number;
}

export interface TopTrainer {
    id: string;
    name: string;
    department: string;
    clientCount: number;
    avgClientProgress: number;
    satisfactionScore: number;
}

export interface ImprovedClient {
    id: string;
    name: string;
    weightLoss: number;
    measurements: number;
    trainerName: string;
}

export interface ActiveClient {
    id: string;
    name: string;
    logsCount: number;
    lastActive: Date;
}

export class DashboardService {
    async getDashboardStats(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<DashboardStats> {
        const [
            overview,
            userStats,
            clientStats,
            staffStats,
            healthMetrics,
            engagementStats,
            charts,
            recentActivities,
            topPerforming,
            kpis
        ] = await Promise.all([
            this.getOverviewStats(timeframe),
            this.getUserStats(timeframe),
            this.getClientStats(),
            this.getStaffStats(),
            this.getHealthMetrics(),
            this.getEngagementStats(timeframe),
            this.getChartData(timeframe),
            this.getRecentActivities(10),
            this.getTopPerformingStats(),
            this.getKPIs()
        ]);

        return {
            overview,
            users: userStats,
            clients: clientStats,
            staff: staffStats,
            healthMetrics,
            engagement: engagementStats,
            charts,
            recentActivities,
            topPerforming,
            kpis
        };
    }

    async getOverviewStats(timeframe: string): Promise<OverviewStats> {
        const [totalUsers, totalClients, totalStaff] = await Promise.all([
            prisma.user.count(),
            prisma.clientProfile.count(),
            prisma.staff.count()
        ]);

        const activeUsers = await this.getActiveUsersCount(timeframe);
        const newUsersThisMonth = await this.getNewUsersCount(timeframe);
        const previousPeriodCount = await this.getPreviousPeriodUsers(timeframe);

        const userGrowthRate = previousPeriodCount > 0
            ? ((newUsersThisMonth / previousPeriodCount) * 100)
            : newUsersThisMonth > 0 ? 100 : 0;

        return {
            totalUsers,
            totalClients,
            totalStaff,
            activeUsers,
            newUsersThisMonth,
            userGrowthRate
        };
    }

    async getUserStats(timeframe: string): Promise<UserStats> {
        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: true
        });

        const usersByVerification = await prisma.user.groupBy({
            by: ['isVerified'],
            _count: true
        });

        const genderStats = await prisma.clientProfile.groupBy({
            by: ['gender'],
            _count: true,
            where: { gender: { not: null } }
        });

        const registrationTrend = await this.getRegistrationTrend(timeframe);

        return {
            byRole: {
                client: usersByRole.find(r => r.role === 'CLIENT')?._count || 0,
                trainer: usersByRole.find(r => r.role === 'TRAINER')?._count || 0,
                admin: usersByRole.find(r => r.role === 'ADMIN')?._count || 0
            },
            byVerification: {
                verified: usersByVerification.find(v => v.isVerified)?._count || 0,
                unverified: usersByVerification.find(v => !v.isVerified)?._count || 0
            },
            byGender: {
                male: genderStats.find(g => g.gender === 'MALE')?._count || 0,
                female: genderStats.find(g => g.gender === 'FEMALE')?._count || 0,
                other: genderStats.filter(g => !['MALE', 'FEMALE'].includes(g.gender || '')).reduce((sum, g) => sum + g._count, 0)
            },
            registrationTrend
        };
    }

    async getClientStats(): Promise<ClientStats> {
        const [totalClients, clientsWithTrainers, clientProfiles] = await Promise.all([
            prisma.clientProfile.count(),
            prisma.clientProfile.count({ where: { assignedTrainerId: { not: null } } }),
            prisma.clientProfile.findMany({
                select: {
                    dateOfBirth: true,
                    gender: true,
                    smokingStatus: true,
                    alcoholConsumption: true,
                    targetWeight: true,
                    measurements: { select: { id: true } }
                }
            })
        ]);

        const ageGroups = clientProfiles.reduce((acc, client) => {
            if (!client.dateOfBirth) return acc;

            const age = this.calculateAge(client.dateOfBirth);
            let group = '';

            if (age < 20) group = 'Under 20';
            else if (age < 30) group = '20-29';
            else if (age < 40) group = '30-39';
            else if (age < 50) group = '40-49';
            else if (age < 60) group = '50-59';
            else group = '60+';

            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const avgTargetWeight = clientProfiles
            .filter(c => c.targetWeight)
            .reduce((sum, c) => sum + (c.targetWeight || 0), 0) /
            (clientProfiles.filter(c => c.targetWeight).length || 1);

        const smokers = clientProfiles.filter(c => c.smokingStatus).length;
        const alcoholConsumers = clientProfiles.filter(c => c.alcoholConsumption).length;

        const clientsWithMeasurements = clientProfiles.filter(c => c.measurements.length > 0).length;
        const totalMeasurements = clientProfiles.reduce((sum, c) => sum + c.measurements.length, 0);
        const avgMeasurementsPerClient = totalMeasurements / (totalClients || 1);

        return {
            totalClients,
            clientsWithTrainers,
            avgTargetWeight,
            demographics: {
                byAgeGroup: Object.entries(ageGroups).map(([group, count]) => ({
                    group,
                    count,
                    percentage: (count / totalClients) * 100
                })),
                byGender: await this.getGenderDistribution()
            },
            lifestyle: {
                smokers,
                alcoholConsumers
            },
            progress: {
                clientsWithMeasurements,
                avgMeasurementsPerClient
            }
        };
    }

    async getStaffStats(): Promise<StaffStats> {
        const [totalStaff, staffByDepartment, staffWithClients] = await Promise.all([
            prisma.staff.count(),
            prisma.staff.groupBy({
                by: ['department'],
                _count: true
            }),
            prisma.staff.findMany({
                include: {
                    clientProfiles: {
                        select: { id: true }
                    }
                },
                where: { isActive: true }
            })
        ]);

        const activeTrainers = staffWithClients.length;
        const totalClients = staffWithClients.reduce((sum, staff) => sum + staff.clientProfiles.length, 0);
        const avgClientsPerTrainer = totalClients / (activeTrainers || 1);

        return {
            totalStaff,
            byDepartment: staffByDepartment.map(dept => ({
                department: dept.department,
                count: dept._count,
                percentage: (dept._count / totalStaff) * 100
            })),
            activeTrainers,
            avgClientsPerTrainer,
            staffLoad: staffWithClients.map(staff => ({
                trainerId: staff.id,
                trainerName: `${staff.firstName} ${staff.lastName}`,
                clientCount: staff.clientProfiles.length,
                department: staff.department
            }))
        };
    }

    async getHealthMetrics(): Promise<HealthMetrics> {
        const [medicalConditions, allergies, medications, injuries] = await Promise.all([
            prisma.medicalCondition.findMany(),
            prisma.allergy.findMany(),
            prisma.medication.findMany(),
            prisma.injury.findMany()
        ]);

        const conditionCounts = medicalConditions.reduce((acc, condition) => {
            acc[condition.condition] = (acc[condition.condition] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const allergenCounts = allergies.reduce((acc, allergy) => {
            acc[allergy.allergen] = (acc[allergy.allergen] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const activeInjuries = injuries.filter(i => i.status === 'Active' || !i.recoveryDate).length;

        return {
            medicalConditions: {
                total: medicalConditions.length,
                topConditions: Object.entries(conditionCounts)
                    .map(([condition, count]) => ({ condition, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
            },
            allergies: {
                total: allergies.length,
                topAllergens: Object.entries(allergenCounts)
                    .map(([allergen, count]) => ({ allergen, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
            },
            medications: {
                total: medications.length
            },
            injuries: {
                total: injuries.length,
                active: activeInjuries
            }
        };
    }

    async getEngagementStats(timeframe: string): Promise<EngagementStats> {
        const [nutritionLogs, fitnessGoals, clients] = await Promise.all([
            prisma.nutritionLog.count(),
            prisma.fitnessGoal.findMany(),
            prisma.clientProfile.findMany({
                include: {
                    measurements: true,
                    nutritionLogs: {
                        orderBy: { date: 'desc' },
                        take: 1
                    }
                }
            })
        ]);

        const totalClients = clients.length;
        const clientsWithGoals = fitnessGoals.filter(g => g.clientId).length;
        const goalsAchieved = fitnessGoals.filter(g => g.achieved).length;
        const goalCompletionRate = clientsWithGoals > 0 ? (goalsAchieved / clientsWithGoals) * 100 : 0;

        const activeClients = clients.filter(c =>
            c.nutritionLogs.length > 0 ||
            c.measurements.length > 0 ||
            fitnessGoals.some(g => g.clientId === c.id && !g.achieved)
        ).length;

        const avgNutritionLogs = nutritionLogs / (totalClients || 1);
        const retentionRate = this.calculateRetentionRate(clients);

        return {
            avgNutritionLogs,
            clientsWithGoals,
            goalsAchieved,
            goalCompletionRate,
            activeClients,
            retentionRate
        };
    }

    async getChartData(timeframe: string): Promise<ChartData> {
        const [
            userGrowth,
            clientEnrollment,
            departmentDistribution,
            genderDistribution,
            ageDistribution,
            mealTypeDistribution,
            measurementTrend,
            trainerPerformance
        ] = await Promise.all([
            this.getUserGrowthData(timeframe),
            this.getClientEnrollmentData(timeframe),
            this.getDepartmentStatsForChart(),
            this.getGenderStatsForChart(),
            this.getAgeDistribution(),
            this.getMealTypeStatsForChart(),
            this.getMeasurementTrend(),
            this.getTrainerPerformance()
        ]);

        return {
            userGrowth,
            clientEnrollment,
            departmentDistribution,
            genderDistribution,
            ageDistribution,
            mealTypeDistribution,
            measurementTrend,
            trainerPerformance
        };
    }

    async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
        const recentUsers = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                clientProfile: {
                    select: { firstName: true, lastName: true }
                },
                staffProfile: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        const recentMeasurements = await prisma.measurement.findMany({
            orderBy: { createdAt: 'desc' },
            take: Math.floor(limit / 2),
            include: {
                client: {
                    select: { firstName: true, lastName: true, userId: true }
                }
            }
        });

        const recentGoals = await prisma.fitnessGoal.findMany({
            where: { achieved: true },
            orderBy: { achievedAt: 'desc' },
            take: Math.floor(limit / 2),
            include: {
                client: {
                    select: { firstName: true, lastName: true, userId: true }
                }
            }
        });

        const activities: RecentActivity[] = [
            ...recentUsers.map(user => ({
                id: user.id,
                type: 'user_registration' as const,
                description: `${user.clientProfile ? 'Client' : user.staffProfile ? 'Staff' : 'User'} registered`,
                timestamp: user.createdAt,
                userId: user.id,
                clientName: user.clientProfile ? `${user.clientProfile.firstName} ${user.clientProfile.lastName}` : undefined,
                staffName: user.staffProfile ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}` : undefined
            })),
            ...recentMeasurements.map(measurement => ({
                id: measurement.id,
                type: 'measurement_logged' as const,
                description: `New measurement logged`,
                timestamp: measurement.createdAt,
                userId: measurement.client.userId,
                clientName: `${measurement.client.firstName} ${measurement.client.lastName}`
            })),
            ...recentGoals.map(goal => ({
                id: goal.id,
                type: 'goal_achieved' as const,
                description: `Goal achieved: ${goal.goal}`,
                timestamp: goal.achievedAt!,
                userId: goal.clientId,
                clientName: `${goal.client.firstName} ${goal.client.lastName}`
            }))
        ];

        return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
    }

    async getTopPerformingStats(): Promise<TopPerformingStats> {
        const trainers = await prisma.staff.findMany({
            include: {
                clientProfiles: {
                    include: {
                        measurements: {
                            orderBy: { date: 'desc' },
                            take: 2
                        }
                    }
                }
            },
            where: { isActive: true }
        });

        const topTrainers = trainers.map(trainer => {
            const clientCount = trainer.clientProfiles.length;
            const avgProgress = trainer.clientProfiles.reduce((sum, client) => {
                if (client.measurements.length >= 2) {
                    const latest = client.measurements[0];
                    const previous = client.measurements[1];
                    return sum + ((previous.weight || 0) - (latest.weight || 0));
                }
                return sum;
            }, 0) / (clientCount || 1);

            return {
                id: trainer.id,
                name: `${trainer.firstName} ${trainer.lastName}`,
                department: trainer.department,
                clientCount,
                avgClientProgress: avgProgress,
                satisfactionScore: 0
            };
        }).sort((a, b) => b.avgClientProgress - a.avgClientProgress)
            .slice(0, 5);

        const clientsWithMeasurements = await prisma.clientProfile.findMany({
            include: {
                measurements: {
                    orderBy: { date: 'desc' },
                    take: 2
                },
                assignedTrainer: {
                    select: { firstName: true, lastName: true }
                }
            },
            where: {
                measurements: {
                    some: {}
                }
            }
        });

        const mostImprovedClients = clientsWithMeasurements
            .filter(client => client.measurements.length >= 2)
            .map(client => {
                const latest = client.measurements[0];
                const previous = client.measurements[1];
                const weightLoss = (previous.weight || 0) - (latest.weight || 0);

                return {
                    id: client.id,
                    name: `${client.firstName} ${client.lastName}`,
                    weightLoss,
                    measurements: client.measurements.length,
                    trainerName: client.assignedTrainer
                        ? `${client.assignedTrainer.firstName} ${client.assignedTrainer.lastName}`
                        : 'No Trainer'
                };
            })
            .filter(client => client.weightLoss > 0)
            .sort((a, b) => b.weightLoss - a.weightLoss)
            .slice(0, 5);

        const mostActiveClients = await prisma.clientProfile.findMany({
            include: {
                nutritionLogs: {
                    select: { id: true },
                    orderBy: { date: 'desc' }
                },
                measurements: {
                    select: { id: true },
                    orderBy: { date: 'desc' }
                }
            }
        }).then(clients =>
            clients.map(client => ({
                id: client.id,
                name: `${client.firstName} ${client.lastName}`,
                logsCount: client.nutritionLogs.length + client.measurements.length,
                lastActive: client.createdAt
            }))
                .sort((a, b) => b.logsCount - a.logsCount)
                .slice(0, 5)
        );

        return {
            topTrainers,
            mostImprovedClients,
            mostActiveClients
        };
    }

    async getKPIs(): Promise<KPI[]> {
        const [
            totalClients,
            activeClients,
            avgGoalCompletion,
            retentionRate,
            avgClientProgress
        ] = await Promise.all([
            prisma.clientProfile.count(),
            this.getActiveUsersCount('monthly'),
            this.getAverageGoalCompletion(),
            this.getRetentionRate(),
            this.getAverageClientProgress()
        ]);

        return [
            {
                name: "Client Retention",
                value: retentionRate,
                target: 85,
                unit: "%",
                trend: retentionRate >= 85 ? 'up' : 'down',
                change: 2.5
            },
            {
                name: "Active Clients",
                value: activeClients,
                target: totalClients * 0.8,
                unit: "",
                trend: activeClients >= totalClients * 0.8 ? 'up' : 'down',
                change: 5
            },
            {
                name: "Goal Completion",
                value: avgGoalCompletion,
                target: 75,
                unit: "%",
                trend: avgGoalCompletion >= 75 ? 'up' : 'down',
                change: 3.2
            },
            {
                name: "Avg Weight Loss",
                value: avgClientProgress,
                target: 2,
                unit: "kg",
                trend: avgClientProgress >= 2 ? 'up' : 'down',
                change: 0.5
            },
            {
                name: "Trainer Utilization",
                value: await this.getTrainerUtilization(),
                target: 90,
                unit: "%",
                trend: 'stable',
                change: 0
            }
        ];
    }

    async getUserGrowthData(timeframe: string): Promise<TimeSeriesData[]> {
        const period = timeframe === 'yearly' ? 12 : 30;
        const data: TimeSeriesData[] = [];

        for (let i = period - 1; i >= 0; i--) {
            const endDate = new Date();
            const startDate = new Date(endDate);

            if (timeframe === 'yearly') {
                endDate.setMonth(endDate.getMonth() - i);
                startDate.setMonth(startDate.getMonth() - i - 1);
            } else {
                endDate.setDate(endDate.getDate() - i);
                startDate.setDate(startDate.getDate() - i - 1);
            }

            const count = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            });

            data.push({
                date: endDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: timeframe === 'yearly' ? undefined : 'numeric',
                    year: timeframe === 'yearly' ? 'numeric' : undefined
                }),
                value: count
            });
        }

        return data;
    }

    async getClientEnrollmentData(timeframe: string): Promise<TimeSeriesData[]> {
        const period = timeframe === 'yearly' ? 12 : 30;
        const data: TimeSeriesData[] = [];

        for (let i = period - 1; i >= 0; i--) {
            const endDate = new Date();
            const startDate = new Date(endDate);

            if (timeframe === 'yearly') {
                endDate.setMonth(endDate.getMonth() - i);
                startDate.setMonth(startDate.getMonth() - i - 1);
            } else {
                endDate.setDate(endDate.getDate() - i);
                startDate.setDate(startDate.getDate() - i - 1);
            }

            const count = await prisma.clientProfile.count({
                where: {
                    createdAt: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            });

            data.push({
                date: endDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: timeframe === 'yearly' ? undefined : 'numeric',
                    year: timeframe === 'yearly' ? 'numeric' : undefined
                }),
                value: count
            });
        }

        return data;
    }

    async getClientAnalytics(clientId: string) {
        const client = await prisma.clientProfile.findUnique({
            where: { id: clientId },
            include: {
                measurements: {
                    orderBy: { date: 'asc' }
                },
                nutritionLogs: {
                    orderBy: { date: 'desc' },
                    take: 30
                },
                fitnessGoals: {
                    orderBy: { targetDate: 'asc' }
                },
                medicalConditions: true,
                allergies: true,
                medications: true,
                injuries: true,
                assignedTrainer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                }
            }
        });

        if (!client) {
            throw new Error("Client not found");
        }

        const progressMetrics = this.calculateClientProgress(client.measurements);
        const goalMetrics = this.calculateGoalMetrics(client.fitnessGoals);
        const nutritionInsights = this.analyzeNutritionLogs(client.nutritionLogs);

        return {
            profile: client,
            progress: progressMetrics,
            goals: goalMetrics,
            nutrition: nutritionInsights,
            healthSummary: {
                medicalConditions: client.medicalConditions.length,
                allergies: client.allergies.length,
                medications: client.medications.length,
                injuries: client.injuries.length
            }
        };
    }

    async getTrainerAnalytics(trainerId: string) {
        const trainer = await prisma.staff.findUnique({
            where: { id: trainerId },
            include: {
                clientProfiles: {
                    include: {
                        measurements: {
                            orderBy: { date: 'desc' },
                            take: 2
                        },
                        fitnessGoals: {
                            where: { achieved: true }
                        }
                    }
                }
            }
        });

        if (!trainer) {
            throw new Error("Trainer not found");
        }

        const clientStats = trainer.clientProfiles.map(client => {
            const progress = client.measurements.length >= 2
                ? (client.measurements[1].weight || 0) - (client.measurements[0].weight || 0)
                : 0;

            return {
                id: client.id,
                name: `${client.firstName} ${client.lastName}`,
                goalsAchieved: client.fitnessGoals.length,
                progress,
                lastMeasurement: client.measurements[0]?.date
            };
        });

        const totalProgress = clientStats.reduce((sum, stat) => sum + stat.progress, 0);
        const avgProgress = trainer.clientProfiles.length > 0
            ? totalProgress / trainer.clientProfiles.length
            : 0;

        const goalsAchieved = clientStats.reduce((sum, stat) => sum + stat.goalsAchieved, 0);

        return {
            trainer,
            stats: {
                totalClients: trainer.clientProfiles.length,
                avgClientProgress: avgProgress,
                totalGoalsAchieved: goalsAchieved,
                clientRetention: 0,
                satisfactionScore: 0
            },
            clientStats,
            performanceTrend: await this.getTrainerPerformanceTrend(trainerId)
        };
    }

    // Public helper methods for charts
    async getGenderDistribution(): Promise<GenderStats[]> {
        const stats = await prisma.clientProfile.groupBy({
            by: ['gender'],
            _count: true,
            where: { gender: { not: null } }
        });

        const total = stats.reduce((sum, stat) => sum + stat._count, 0);

        return stats.map(stat => ({
            gender: stat.gender || 'Not Specified',
            count: stat._count,
            percentage: total > 0 ? (stat._count / total) * 100 : 0
        }));
    }

    // Private methods for charts (returning correct types for ChartData interface)
    private async getDepartmentStatsForChart(): Promise<DepartmentStats[]> {
        const stats = await prisma.staff.groupBy({
            by: ['department'],
            _count: true
        });

        const total = stats.reduce((sum, stat) => sum + stat._count, 0);

        return stats.map(stat => ({
            department: stat.department,
            count: stat._count,
            percentage: total > 0 ? (stat._count / total) * 100 : 0
        }));
    }

    private async getGenderStatsForChart(): Promise<GenderStats[]> {
        const stats = await prisma.clientProfile.groupBy({
            by: ['gender'],
            _count: true,
            where: { gender: { not: null } }
        });

        const total = stats.reduce((sum, stat) => sum + stat._count, 0);

        return stats.map(stat => ({
            gender: stat.gender || 'Not Specified',
            count: stat._count,
            percentage: total > 0 ? (stat._count / total) * 100 : 0
        }));
    }

    private async getMealTypeStatsForChart(): Promise<MealTypeStats[]> {
        const stats = await prisma.nutritionLog.groupBy({
            by: ['mealType'],
            _count: true
        });

        const total = stats.reduce((sum, stat) => sum + stat._count, 0);

        return stats.map(stat => ({
            mealType: stat.mealType,
            count: stat._count,
            percentage: total > 0 ? (stat._count / total) * 100 : 0
        }));
    }

    // Private helper methods
    private async getActiveUsersCount(timeframe: string): Promise<number> {
        const date = new Date();
        let startDate: Date;

        switch (timeframe) {
            case 'daily':
                startDate = new Date(date.setDate(date.getDate() - 1));
                break;
            case 'weekly':
                startDate = new Date(date.setDate(date.getDate() - 7));
                break;
            case 'monthly':
                startDate = new Date(date.setMonth(date.getMonth() - 1));
                break;
            default:
                startDate = new Date(date.setFullYear(date.getFullYear() - 1));
        }

        return await prisma.user.count({
            where: {
                OR: [
                    {
                        clientProfile: {
                            measurements: {
                                some: {
                                    createdAt: { gte: startDate }
                                }
                            }
                        }
                    },
                    {
                        clientProfile: {
                            nutritionLogs: {
                                some: {
                                    createdAt: { gte: startDate }
                                }
                            }
                        }
                    }
                ]
            }
        });
    }

    private async getNewUsersCount(timeframe: string): Promise<number> {
        const date = new Date();
        let startDate: Date;

        switch (timeframe) {
            case 'daily':
                startDate = new Date(date.setHours(0, 0, 0, 0));
                break;
            case 'weekly':
                startDate = new Date(date.setDate(date.getDate() - 7));
                break;
            case 'monthly':
                startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                break;
            default:
                startDate = new Date(date.getFullYear(), 0, 1);
        }

        return await prisma.user.count({
            where: {
                createdAt: { gte: startDate }
            }
        });
    }

    private async getPreviousPeriodUsers(timeframe: string): Promise<number> {
        const date = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (timeframe) {
            case 'daily':
                endDate = new Date(date);
                endDate.setDate(endDate.getDate() - 1);
                startDate = new Date(endDate);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                endDate = new Date(date);
                endDate.setDate(endDate.getDate() - 7);
                startDate = new Date(endDate);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'monthly':
                endDate = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
                startDate = new Date(date.getFullYear(), date.getMonth() - 2, date.getDate());
                break;
            default:
                endDate = new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());
                startDate = new Date(date.getFullYear() - 2, date.getMonth(), date.getDate());
        }

        return await prisma.user.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lt: endDate
                }
            }
        });
    }

    private async getRegistrationTrend(timeframe: string): Promise<MonthlyTrend[]> {
        const date = new Date();
        let period: number;

        switch (timeframe) {
            case 'daily':
                period = 30;
                break;
            case 'weekly':
                period = 12;
                break;
            case 'monthly':
                period = 12;
                break;
            default:
                period = 5;
        }

        const trends: MonthlyTrend[] = [];

        for (let i = period - 1; i >= 0; i--) {
            const endDate = new Date();
            let startDate: Date;
            let label: string;

            switch (timeframe) {
                case 'daily':
                    endDate.setDate(endDate.getDate() - i);
                    startDate = new Date(endDate);
                    startDate.setDate(startDate.getDate() - 1);
                    label = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    break;
                case 'weekly':
                    endDate.setDate(endDate.getDate() - (i * 7));
                    startDate = new Date(endDate);
                    startDate.setDate(startDate.getDate() - 7);
                    label = `Week ${i + 1}`;
                    break;
                case 'monthly':
                    endDate.setMonth(endDate.getMonth() - i);
                    startDate = new Date(endDate);
                    startDate.setMonth(startDate.getMonth() - 1);
                    label = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    break;
                default:
                    endDate.setFullYear(endDate.getFullYear() - i);
                    startDate = new Date(endDate);
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    label = endDate.getFullYear().toString();
            }

            const count = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            });

            const previousCount = i < period - 1 ? trends[trends.length - 1].count : 0;
            const growth = previousCount > 0 ? ((count - previousCount) / previousCount) * 100 : 0;

            trends.push({
                month: label,
                count,
                growth
            });
        }

        return trends;
    }

    private async getAgeDistribution(): Promise<BarChartData[]> {
        const clients = await prisma.clientProfile.findMany({
            select: { dateOfBirth: true }
        });

        const ageGroups = {
            'Under 20': 0,
            '20-29': 0,
            '30-39': 0,
            '40-49': 0,
            '50-59': 0,
            '60+': 0
        };

        clients.forEach(client => {
            if (!client.dateOfBirth) return;

            const age = this.calculateAge(client.dateOfBirth);
            if (age < 20) ageGroups['Under 20']++;
            else if (age < 30) ageGroups['20-29']++;
            else if (age < 40) ageGroups['30-39']++;
            else if (age < 50) ageGroups['40-49']++;
            else if (age < 60) ageGroups['50-59']++;
            else ageGroups['60+']++;
        });

        return Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
    }

    private async getMeasurementTrend(): Promise<LineChartData[]> {
        const measurements = await prisma.measurement.findMany({
            where: {
                date: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
                }
            },
            orderBy: { date: 'asc' }
        });

        const grouped = measurements.reduce((acc, measurement) => {
            const dateKey = measurement.date.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = { weight: 0, waist: 0, chest: 0, count: 0 };
            }
            acc[dateKey].weight += measurement.weight || 0;
            acc[dateKey].waist += measurement.waist || 0;
            acc[dateKey].chest += measurement.chest || 0;
            acc[dateKey].count++;
            return acc;
        }, {} as Record<string, { weight: number; waist: number; chest: number; count: number }>);

        return Object.entries(grouped).map(([date, data]) => ({
            date,
            weight: data.count > 0 ? data.weight / data.count : 0,
            waist: data.count > 0 ? data.waist / data.count : 0,
            chest: data.count > 0 ? data.chest / data.count : 0
        }));
    }

    private async getTrainerPerformance(): Promise<BarChartData[]> {
        const trainers = await prisma.staff.findMany({
            include: {
                clientProfiles: {
                    include: {
                        fitnessGoals: {
                            where: { achieved: true }
                        }
                    }
                }
            },
            where: { isActive: true }
        });

        return trainers.map(trainer => ({
            name: `${trainer.firstName} ${trainer.lastName}`,
            value: trainer.clientProfiles.reduce((sum, client) => sum + client.fitnessGoals.length, 0)
        })).sort((a, b) => b.value - a.value).slice(0, 10);
    }

    private calculateAge(dateOfBirth: Date): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    private calculateRetentionRate(clients: any[]): number {
        const activeClients = clients.filter(client =>
            client.measurements.length > 0 ||
            client.nutritionLogs.length > 0
        ).length;

        return clients.length > 0 ? (activeClients / clients.length) * 100 : 0;
    }

    private async getAverageGoalCompletion(): Promise<number> {
        const goals = await prisma.fitnessGoal.findMany();
        const totalGoals = goals.length;
        const achievedGoals = goals.filter(g => g.achieved).length;

        return totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0;
    }

    private async getRetentionRate(): Promise<number> {
        const clients = await prisma.clientProfile.findMany({
            include: {
                measurements: { take: 1 },
                nutritionLogs: { take: 1 }
            }
        });

        const activeClients = clients.filter(client =>
            client.measurements.length > 0 ||
            client.nutritionLogs.length > 0
        ).length;

        return clients.length > 0 ? (activeClients / clients.length) * 100 : 0;
    }

    private async getAverageClientProgress(): Promise<number> {
        const clientsWithMeasurements = await prisma.clientProfile.findMany({
            include: {
                measurements: {
                    orderBy: { date: 'desc' },
                    take: 2
                }
            },
            where: {
                measurements: {
                    some: {}
                }
            }
        });

        let totalProgress = 0;
        let count = 0;

        clientsWithMeasurements.forEach(client => {
            if (client.measurements.length >= 2) {
                const latest = client.measurements[0];
                const previous = client.measurements[1];
                const progress = (previous.weight || 0) - (latest.weight || 0);
                if (progress > 0) {
                    totalProgress += progress;
                    count++;
                }
            }
        });

        return count > 0 ? totalProgress / count : 0;
    }

    private async getTrainerUtilization(): Promise<number> {
        const trainers = await prisma.staff.findMany({
            include: {
                clientProfiles: true
            },
            where: { isActive: true }
        });

        if (trainers.length === 0) return 0;

        const totalCapacity = trainers.length * 15;
        const totalClients = trainers.reduce((sum, trainer) => sum + trainer.clientProfiles.length, 0);

        return (totalClients / totalCapacity) * 100;
    }

    private calculateClientProgress(measurements: any[]) {
        if (measurements.length < 2) {
            return {
                weightChange: 0,
                measurementChanges: {},
                consistency: 0
            };
        }

        const latest = measurements[measurements.length - 1];
        const earliest = measurements[0];

        const weightChange = earliest.weight && latest.weight
            ? earliest.weight - latest.weight
            : 0;

        const measurementChanges = {
            chest: earliest.chest && latest.chest ? earliest.chest - latest.chest : 0,
            waist: earliest.waist && latest.waist ? earliest.waist - latest.waist : 0,
            hips: earliest.hips && latest.hips ? earliest.hips - latest.hips : 0
        };

        const totalDays = (latest.date.getTime() - earliest.date.getTime()) / (1000 * 3600 * 24);
        const expectedMeasurements = Math.floor(totalDays / 7);
        const consistency = measurements.length / expectedMeasurements;

        return {
            weightChange,
            measurementChanges,
            consistency: Math.min(consistency * 100, 100)
        };
    }

    private calculateGoalMetrics(goals: any[]) {
        const totalGoals = goals.length;
        const achievedGoals = goals.filter(g => g.achieved).length;
        const inProgressGoals = goals.filter(g => !g.achieved && g.targetDate).length;
        const upcomingDeadlines = goals
            .filter(g => !g.achieved && g.targetDate && new Date(g.targetDate) > new Date())
            .slice(0, 5);

        return {
            totalGoals,
            achievedGoals,
            achievementRate: totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0,
            inProgressGoals,
            upcomingDeadlines
        };
    }

    private analyzeNutritionLogs(logs: any[]) {
        const mealTypeCount = logs.reduce((acc, log) => {
            acc[log.mealType] = (acc[log.mealType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const recentLogs = logs.slice(0, 7);
        const logFrequency = recentLogs.length / 7;

        return {
            totalLogs: logs.length,
            mealTypeDistribution: mealTypeCount,
            recentActivity: recentLogs,
            logFrequency,
            consistency: (logFrequency / 3) * 100
        };
    }

    private async getTrainerPerformanceTrend(trainerId: string) {
        const clients = await prisma.clientProfile.findMany({
            where: { assignedTrainerId: trainerId },
            include: {
                measurements: {
                    orderBy: { date: 'asc' }
                }
            }
        });

        const monthlyProgress: Record<string, number> = {};

        clients.forEach(client => {
            client.measurements.forEach((measurement, index) => {
                if (index === 0) return;

                const month = measurement.date.toISOString().slice(0, 7);
                const previous = client.measurements[index - 1];
                const progress = (previous.weight || 0) - (measurement.weight || 0);

                monthlyProgress[month] = (monthlyProgress[month] || 0) + progress;
            });
        });

        return Object.entries(monthlyProgress)
            .map(([month, progress]) => ({ month, progress }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }
}