// controllers/dashboard-controller.ts
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { DashboardService, DashboardStats } from "../services/dashboard-services";

const dashboardService = new DashboardService();

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: "Access denied. Admin only." });
            return;
        }

        const timeframe = (req.query.timeframe as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'monthly';
        const stats = await dashboardService.getDashboardStats(timeframe);

        res.json(stats);
    } catch (error: any) {
        console.error("Get dashboard stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getClientAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: "Access denied. Admin only." });
            return;
        }

        const { clientId } = req.params;
        if (!clientId) {
            res.status(400).json({ error: "Client ID is required" });
            return;
        }

        const analytics = await dashboardService.getClientAnalytics(clientId as string);
        res.json(analytics);
    } catch (error: any) {
        console.error("Get client analytics error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTrainerAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: "Access denied. Admin only." });
            return;
        }

        const { trainerId } = req.params;
        if (!trainerId) {
            res.status(400).json({ error: "Trainer ID is required" });
            return;
        }

        const analytics = await dashboardService.getTrainerAnalytics(trainerId as string);
        res.json(analytics);
    } catch (error: any) {
        console.error("Get trainer analytics error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const exportDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: "Access denied. Admin only." });
            return;
        }

        const format = req.query.format as 'csv' | 'json' | 'pdf' || 'json';
        const timeframe = req.query.timeframe as string || 'monthly';

        const stats = await dashboardService.getDashboardStats(timeframe as any);

        switch (format) {
            case 'csv':
                const csvData = convertToCSV(stats);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="dashboard-stats.csv"');
                res.send(csvData);
                break;

            case 'pdf':
                res.status(501).json({ error: "PDF export not yet implemented" });
                break;

            case 'json':
            default:
                res.json(stats);
                break;
        }
    } catch (error: any) {
        console.error("Export dashboard data error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

function convertToCSV(stats: DashboardStats): string {
    const rows: string[] = [];

    rows.push('Category,Statistic,Value');
    rows.push(`Overview,Total Users,${stats.overview.totalUsers}`);
    rows.push(`Overview,Total Clients,${stats.overview.totalClients}`);
    rows.push(`Overview,Total Staff,${stats.overview.totalStaff}`);
    rows.push(`Overview,Active Users,${stats.overview.activeUsers}`);
    rows.push(`Overview,New Users This Month,${stats.overview.newUsersThisMonth}`);
    rows.push(`Overview,User Growth Rate,${stats.overview.userGrowthRate.toFixed(2)}%`);

    rows.push(`Users,Clients,${stats.users.byRole.client}`);
    rows.push(`Users,Trainers,${stats.users.byRole.trainer}`);
    rows.push(`Users,Admins,${stats.users.byRole.admin}`);
    rows.push(`Users,Verified,${stats.users.byVerification.verified}`);
    rows.push(`Users,Unverified,${stats.users.byVerification.unverified}`);

    rows.push(`Clients,Total,${stats.clients.totalClients}`);
    rows.push(`Clients,With Trainers,${stats.clients.clientsWithTrainers}`);
    rows.push(`Clients,Avg Target Weight,${stats.clients.avgTargetWeight.toFixed(2)}`);
    rows.push(`Clients,Smokers,${stats.clients.lifestyle.smokers}`);
    rows.push(`Clients,Alcohol Consumers,${stats.clients.lifestyle.alcoholConsumers}`);

    rows.push(`Staff,Total,${stats.staff.totalStaff}`);
    rows.push(`Staff,Active Trainers,${stats.staff.activeTrainers}`);
    rows.push(`Staff,Avg Clients Per Trainer,${stats.staff.avgClientsPerTrainer.toFixed(2)}`);

    rows.push(`Health,Medical Conditions,${stats.healthMetrics.medicalConditions.total}`);
    rows.push(`Health,Allergies,${stats.healthMetrics.allergies.total}`);
    rows.push(`Health,Medications,${stats.healthMetrics.medications.total}`);
    rows.push(`Health,Injuries,${stats.healthMetrics.injuries.total}`);
    rows.push(`Health,Active Injuries,${stats.healthMetrics.injuries.active}`);

    rows.push(`Engagement,Avg Nutrition Logs,${stats.engagement.avgNutritionLogs.toFixed(2)}`);
    rows.push(`Engagement,Clients With Goals,${stats.engagement.clientsWithGoals}`);
    rows.push(`Engagement,Goals Achieved,${stats.engagement.goalsAchieved}`);
    rows.push(`Engagement,Goal Completion Rate,${stats.engagement.goalCompletionRate.toFixed(2)}%`);
    rows.push(`Engagement,Active Clients,${stats.engagement.activeClients}`);
    rows.push(`Engagement,Retention Rate,${stats.engagement.retentionRate.toFixed(2)}%`);

    return rows.join('\n');
}

export const getDashboardWidgets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: "Access denied. Admin only." });
            return;
        }

        const widgets = req.query.widgets as string;
        const widgetList = widgets ? widgets.split(',') : ['overview', 'kpis', 'recent', 'charts'];

        const results: any = {};

        if (widgetList.includes('overview')) {
            const overview = await dashboardService.getOverviewStats('monthly');
            results.overview = overview;
        }

        if (widgetList.includes('kpis')) {
            const kpis = await dashboardService.getKPIs();
            results.kpis = kpis;
        }

        if (widgetList.includes('recent')) {
            const recent = await dashboardService.getRecentActivities(5);
            results.recent = recent;
        }

        if (widgetList.includes('topPerformers')) {
            const top = await dashboardService.getTopPerformingStats();
            results.topPerformers = top;
        }

        res.json(results);
    } catch (error: any) {
        console.error("Get dashboard widgets error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTimeSeriesData = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: "Access denied. Admin only." });
            return;
        }

        const metric = req.query.metric as string;
        const timeframe = req.query.timeframe as string;

        const validMetrics = ['users', 'clients', 'measurements', 'nutrition'];
        const validTimeframes = ['daily', 'weekly', 'monthly', 'yearly'];

        if (!metric || !validMetrics.includes(metric)) {
            res.status(400).json({
                error: "Valid metric required",
                validMetrics
            });
            return;
        }

        const selectedTimeframe = timeframe || 'monthly';
        if (!validTimeframes.includes(selectedTimeframe)) {
            res.status(400).json({
                error: "Valid timeframe required",
                validTimeframes
            });
            return;
        }

        let data;
        switch (metric) {
            case 'users':
                data = await dashboardService.getUserGrowthData(selectedTimeframe);
                break;
            case 'clients':
                data = await dashboardService.getClientEnrollmentData(selectedTimeframe);
                break;
            default:
                data = await dashboardService.getUserGrowthData(selectedTimeframe);
        }

        res.json({
            metric,
            timeframe: selectedTimeframe,
            data
        });
    } catch (error: any) {
        console.error("Get time series data error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getFilteredDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: "Access denied. Admin only." });
            return;
        }

        const filters = {
            timeframe: req.query.timeframe as string || 'monthly',
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            departments: req.query.departments ? (req.query.departments as string).split(',') : undefined,
            gender: req.query.gender ? (req.query.gender as string).split(',') : undefined
        };

        const stats = await dashboardService.getDashboardStats(filters.timeframe as any);

        res.json({
            ...stats,
            filtersApplied: filters
        });
    } catch (error: any) {
        console.error("Get filtered dashboard stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};