"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getQuickStats = exports.getClientDashboard = exports.getTrainerDashboard = exports.getAdminDashboard = exports.getDashboard = void 0;
const dashboard_services_1 = require("../services/dashboard-services");
const prisma_1 = require("../lib/prisma");
const dashboardService = new dashboard_services_1.DashboardService();
const getDashboard = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { userId, role } = req.user;
        const dashboard = await dashboardService.getRoleBasedDashboard(userId, role);
        res.json({
            success: true,
            data: dashboard,
            role
        });
    }
    catch (error) {
        console.error("Get dashboard error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
};
exports.getDashboard = getDashboard;
const getAdminDashboard = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: "Admin access required" });
            return;
        }
        const dashboard = await dashboardService.getAdminDashboard();
        res.json({
            success: true,
            data: dashboard,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Get admin dashboard error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
};
exports.getAdminDashboard = getAdminDashboard;
const getTrainerDashboard = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'TRAINER' && req.user.role !== 'ADMIN')) {
            res.status(403).json({ error: "Trainer access required" });
            return;
        }
        const dashboard = await dashboardService.getTrainerDashboard(req.user.userId);
        res.json({
            success: true,
            data: dashboard,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Get trainer dashboard error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
};
exports.getTrainerDashboard = getTrainerDashboard;
const getClientDashboard = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'CLIENT' && req.user.role !== 'ADMIN')) {
            res.status(403).json({ error: "Client access required" });
            return;
        }
        const dashboard = await dashboardService.getClientDashboard(req.user.userId);
        res.json({
            success: true,
            data: dashboard,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Get client dashboard error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
};
exports.getClientDashboard = getClientDashboard;
const getQuickStats = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { userId, role } = req.user;
        let stats = {};
        switch (role) {
            case 'ADMIN':
                stats = await getAdminQuickStats();
                break;
            case 'TRAINER':
                stats = await getTrainerQuickStats(userId);
                break;
            case 'CLIENT':
                stats = await getClientQuickStats(userId);
                break;
            default:
                res.status(400).json({ error: "Invalid role" });
                return;
        }
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error("Get quick stats error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
};
exports.getQuickStats = getQuickStats;
const getRecentActivity = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { userId, role } = req.user;
        let activity = [];
        switch (role) {
            case 'ADMIN':
                activity = await getAdminRecentActivity();
                break;
            case 'TRAINER':
                activity = await getTrainerRecentActivity(userId);
                break;
            case 'CLIENT':
                activity = await getClientRecentActivity(userId);
                break;
        }
        res.json({
            success: true,
            data: activity
        });
    }
    catch (error) {
        console.error("Get recent activity error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
};
exports.getRecentActivity = getRecentActivity;
async function getAdminQuickStats() {
    const [totalUsers, newUsersToday, totalMeasurements, totalNutritionLogs] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        }),
        prisma_1.prisma.measurement.count(),
        prisma_1.prisma.nutritionLog.count()
    ]);
    return {
        totalUsers,
        newUsersToday,
        totalMeasurements,
        totalNutritionLogs,
        activeTrainers: await prisma_1.prisma.staff.count({ where: { isActive: true } })
    };
}
async function getTrainerQuickStats(trainerUserId) {
    const trainer = await prisma_1.prisma.staff.findUnique({
        where: { userId: trainerUserId }
    });
    if (!trainer)
        return {};
    const [totalClients, activeClients, recentMeasurements, upcomingGoals] = await Promise.all([
        prisma_1.prisma.clientProfile.count({ where: { assignedTrainerId: trainer.id } }),
        prisma_1.prisma.clientProfile.count({
            where: {
                assignedTrainerId: trainer.id,
                measurements: {
                    some: {
                        date: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                }
            }
        }),
        prisma_1.prisma.measurement.count({
            where: {
                client: {
                    assignedTrainerId: trainer.id
                },
                date: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        }),
        prisma_1.prisma.fitnessGoal.count({
            where: {
                client: {
                    assignedTrainerId: trainer.id
                },
                achieved: false,
                targetDate: {
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            }
        })
    ]);
    return {
        totalClients,
        activeClients,
        recentMeasurements,
        upcomingGoals,
        clientSatisfaction: 85
    };
}
async function getClientQuickStats(clientUserId) {
    const clientProfile = await prisma_1.prisma.clientProfile.findUnique({
        where: { userId: clientUserId }
    });
    if (!clientProfile)
        return {};
    const [totalMeasurements, recentMeasurements, totalNutritionLogs, upcomingGoals] = await Promise.all([
        prisma_1.prisma.measurement.count({ where: { clientId: clientProfile.id } }),
        prisma_1.prisma.measurement.count({
            where: {
                clientId: clientProfile.id,
                date: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        }),
        prisma_1.prisma.nutritionLog.count({ where: { clientId: clientProfile.id } }),
        prisma_1.prisma.fitnessGoal.count({
            where: {
                clientId: clientProfile.id,
                achieved: false,
                targetDate: {
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            }
        })
    ]);
    const latestMeasurement = await prisma_1.prisma.measurement.findFirst({
        where: { clientId: clientProfile.id },
        orderBy: { date: 'desc' }
    });
    return {
        totalMeasurements,
        recentMeasurements,
        totalNutritionLogs,
        upcomingGoals,
        latestWeight: latestMeasurement?.weight,
        hasTrainer: !!clientProfile.assignedTrainerId
    };
}
async function getAdminRecentActivity() {
    const [recentUsers, recentMeasurements, recentLogs] = await Promise.all([
        prisma_1.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true
            }
        }),
        prisma_1.prisma.measurement.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        }),
        prisma_1.prisma.nutritionLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })
    ]);
    return [
        ...recentUsers.map(user => ({
            type: 'USER_REGISTERED',
            user: `${user.firstName} ${user.lastName}`,
            role: user.role,
            timestamp: user.createdAt
        })),
        ...recentMeasurements.map(measurement => ({
            type: 'MEASUREMENT_ADDED',
            client: `${measurement.client.firstName} ${measurement.client.lastName}`,
            weight: measurement.weight,
            timestamp: measurement.createdAt
        })),
        ...recentLogs.map(log => ({
            type: 'NUTRITION_LOG_ADDED',
            client: `${log.client.firstName} ${log.client.lastName}`,
            mealType: log.mealType,
            timestamp: log.createdAt
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
}
async function getTrainerRecentActivity(trainerUserId) {
    const trainer = await prisma_1.prisma.staff.findUnique({
        where: { userId: trainerUserId }
    });
    if (!trainer)
        return [];
    const [clientMeasurements, clientLogs, goalUpdates] = await Promise.all([
        prisma_1.prisma.measurement.findMany({
            where: {
                client: {
                    assignedTrainerId: trainer.id
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        }),
        prisma_1.prisma.nutritionLog.findMany({
            where: {
                client: {
                    assignedTrainerId: trainer.id
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        }),
        prisma_1.prisma.fitnessGoal.findMany({
            where: {
                client: {
                    assignedTrainerId: trainer.id
                },
                updatedAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })
    ]);
    return [
        ...clientMeasurements.map(m => ({
            type: 'CLIENT_MEASUREMENT',
            client: `${m.client.firstName} ${m.client.lastName}`,
            action: 'added measurement',
            weight: m.weight,
            timestamp: m.createdAt
        })),
        ...clientLogs.map(l => ({
            type: 'CLIENT_NUTRITION_LOG',
            client: `${l.client.firstName} ${l.client.lastName}`,
            action: 'logged meal',
            mealType: l.mealType,
            timestamp: l.createdAt
        })),
        ...goalUpdates.map(g => ({
            type: 'GOAL_UPDATE',
            client: `${g.client.firstName} ${g.client.lastName}`,
            action: g.achieved ? 'achieved goal' : 'updated goal',
            goal: g.goal,
            timestamp: g.updatedAt
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);
}
async function getClientRecentActivity(clientUserId) {
    const clientProfile = await prisma_1.prisma.clientProfile.findUnique({
        where: { userId: clientUserId }
    });
    if (!clientProfile)
        return [];
    const [measurements, nutritionLogs, goalUpdates] = await Promise.all([
        prisma_1.prisma.measurement.findMany({
            where: { clientId: clientProfile.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        }),
        prisma_1.prisma.nutritionLog.findMany({
            where: { clientId: clientProfile.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        }),
        prisma_1.prisma.fitnessGoal.findMany({
            where: {
                clientId: clientProfile.id,
                updatedAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 10
        })
    ]);
    return [
        ...measurements.map(m => ({
            type: 'MEASUREMENT',
            action: 'Recorded measurements',
            details: `Weight: ${m.weight || 'N/A'}kg`,
            timestamp: m.createdAt
        })),
        ...nutritionLogs.map(l => ({
            type: 'NUTRITION',
            action: `Logged ${l.mealType.toLowerCase()} meal`,
            details: l.notes || 'No notes',
            timestamp: l.createdAt
        })),
        ...goalUpdates.map(g => ({
            type: 'GOAL',
            action: g.achieved ? 'Achieved goal' : 'Updated goal',
            details: g.goal,
            timestamp: g.updatedAt
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
}
//# sourceMappingURL=dashboard-controller.js.map