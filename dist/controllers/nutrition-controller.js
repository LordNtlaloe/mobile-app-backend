"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateNutritionLogs = exports.getNutritionSummary = exports.deleteNutritionLog = exports.updateNutritionLog = exports.getNutritionLogsByDate = exports.getClientNutritionLogs = exports.getNutritionLogById = exports.createNutritionLog = void 0;
const prisma_1 = require("../lib/prisma");
const createNutritionLog = async (req, res) => {
    try {
        const { clientId, date, mealType, imageUrl, notes } = req.body;
        if (!clientId || !mealType || !imageUrl) {
            res.status(400).json({ error: "Client ID, meal type, and image URL are required" });
            return;
        }
        const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
        if (!validMealTypes.includes(mealType.toUpperCase())) {
            res.status(400).json({ error: "Invalid meal type. Must be BREAKFAST, LUNCH, DINNER, or SNACK" });
            return;
        }
        const client = await prisma_1.prisma.clientProfile.findUnique({
            where: { id: clientId }
        });
        if (!client) {
            res.status(404).json({ error: "Client not found" });
            return;
        }
        const nutritionLog = await prisma_1.prisma.nutritionLog.create({
            data: {
                clientId,
                date: date ? new Date(date) : new Date(),
                mealType: mealType.toUpperCase(),
                imageUrl,
                notes
            },
            select: {
                id: true,
                date: true,
                mealType: true,
                imageUrl: true,
                notes: true,
                client: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.status(201).json(nutritionLog);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.createNutritionLog = createNutritionLog;
const getNutritionLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const nutritionLog = await prisma_1.prisma.nutritionLog.findUnique({
            where: { id },
            include: {
                client: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            }
        });
        if (!nutritionLog) {
            res.status(404).json({ error: "Nutrition log not found" });
            return;
        }
        res.status(200).json(nutritionLog);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getNutritionLogById = getNutritionLogById;
const getClientNutritionLogs = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { startDate, endDate, mealType, page = "1", limit = "20" } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;
        const where = { clientId };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }
        if (mealType) {
            const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
            if (validMealTypes.includes(mealType.toUpperCase())) {
                where.mealType = mealType.toUpperCase();
            }
        }
        const [nutritionLogs, total] = await Promise.all([
            prisma_1.prisma.nutritionLog.findMany({
                where,
                select: {
                    id: true,
                    date: true,
                    mealType: true,
                    imageUrl: true,
                    notes: true
                },
                orderBy: { date: 'desc' },
                skip,
                take: limitNum
            }),
            prisma_1.prisma.nutritionLog.count({ where })
        ]);
        res.status(200).json({
            nutritionLogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNextPage: pageNum * limitNum < total,
                hasPreviousPage: pageNum > 1
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getClientNutritionLogs = getClientNutritionLogs;
const getNutritionLogsByDate = async (req, res) => {
    try {
        const { clientId, date } = req.params;
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nutritionLogs = await prisma_1.prisma.nutritionLog.findMany({
            where: {
                clientId,
                date: {
                    gte: targetDate,
                    lt: nextDay
                }
            },
            select: {
                id: true,
                mealType: true,
                imageUrl: true,
                notes: true
            },
            orderBy: { mealType: 'asc' }
        });
        const groupedLogs = {
            BREAKFAST: nutritionLogs.filter(log => log.mealType === "BREAKFAST"),
            LUNCH: nutritionLogs.filter(log => log.mealType === "LUNCH"),
            DINNER: nutritionLogs.filter(log => log.mealType === "DINNER"),
            SNACK: nutritionLogs.filter(log => log.mealType === "SNACK")
        };
        res.status(200).json({
            date: targetDate.toISOString().split('T')[0],
            logs: groupedLogs,
            total: nutritionLogs.length
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getNutritionLogsByDate = getNutritionLogsByDate;
const updateNutritionLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, mealType, imageUrl, notes } = req.body;
        const existingLog = await prisma_1.prisma.nutritionLog.findUnique({
            where: { id }
        });
        if (!existingLog) {
            res.status(404).json({ error: "Nutrition log not found" });
            return;
        }
        if (mealType) {
            const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
            if (!validMealTypes.includes(mealType.toUpperCase())) {
                res.status(400).json({ error: "Invalid meal type" });
                return;
            }
        }
        const updatedLog = await prisma_1.prisma.nutritionLog.update({
            where: { id },
            data: {
                date: date ? new Date(date) : undefined,
                mealType: mealType ? mealType.toUpperCase() : undefined,
                imageUrl,
                notes
            },
            select: {
                id: true,
                date: true,
                mealType: true,
                imageUrl: true,
                notes: true,
                client: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.status(200).json(updatedLog);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.updateNutritionLog = updateNutritionLog;
const deleteNutritionLog = async (req, res) => {
    try {
        const { id } = req.params;
        const existingLog = await prisma_1.prisma.nutritionLog.findUnique({
            where: { id }
        });
        if (!existingLog) {
            res.status(404).json({ error: "Nutrition log not found" });
            return;
        }
        await prisma_1.prisma.nutritionLog.delete({
            where: { id }
        });
        res.status(200).json({
            message: "Nutrition log deleted successfully",
            deletedLog: {
                id: existingLog.id,
                date: existingLog.date,
                mealType: existingLog.mealType
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.deleteNutritionLog = deleteNutritionLog;
const getNutritionSummary = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { period = "week" } = req.query;
        let startDate = new Date();
        const endDate = new Date();
        switch (period) {
            case "week":
                startDate.setDate(startDate.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case "year":
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }
        const [logs, mealTypeCounts, recentLogs] = await Promise.all([
            prisma_1.prisma.nutritionLog.count({
                where: {
                    clientId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            }),
            prisma_1.prisma.nutritionLog.groupBy({
                by: ['mealType'],
                where: {
                    clientId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _count: {
                    mealType: true
                }
            }),
            prisma_1.prisma.nutritionLog.findMany({
                where: { clientId },
                select: {
                    date: true,
                    mealType: true,
                    imageUrl: true
                },
                orderBy: { date: 'desc' },
                take: 5
            })
        ]);
        const summary = {
            period: period,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            totalLogs: logs,
            mealTypeBreakdown: mealTypeCounts.reduce((acc, item) => {
                acc[item.mealType] = item._count.mealType;
                return acc;
            }, {}),
            recentLogs,
            averagePerDay: period === "week" ? (logs / 7).toFixed(1) :
                period === "month" ? (logs / 30).toFixed(1) :
                    (logs / 365).toFixed(1)
        };
        res.status(200).json(summary);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getNutritionSummary = getNutritionSummary;
const bulkCreateNutritionLogs = async (req, res) => {
    try {
        const { clientId, logs } = req.body;
        if (!clientId || !Array.isArray(logs) || logs.length === 0) {
            res.status(400).json({ error: "Client ID and logs array are required" });
            return;
        }
        const client = await prisma_1.prisma.clientProfile.findUnique({
            where: { id: clientId }
        });
        if (!client) {
            res.status(404).json({ error: "Client not found" });
            return;
        }
        const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
        const validatedLogs = logs.map((log, index) => {
            if (!log.mealType || !log.imageUrl) {
                throw new Error(`Log at index ${index} is missing required fields`);
            }
            if (!validMealTypes.includes(log.mealType.toUpperCase())) {
                throw new Error(`Log at index ${index} has invalid meal type`);
            }
            return {
                clientId,
                date: log.date ? new Date(log.date) : new Date(),
                mealType: log.mealType.toUpperCase(),
                imageUrl: log.imageUrl,
                notes: log.notes
            };
        });
        const createdLogs = await prisma_1.prisma.$transaction(validatedLogs.map(log => prisma_1.prisma.nutritionLog.create({
            data: log,
            select: {
                id: true,
                date: true,
                mealType: true,
                imageUrl: true
            }
        })));
        res.status(201).json({
            message: `${createdLogs.length} nutrition logs created successfully`,
            logs: createdLogs
        });
    }
    catch (error) {
        console.error(error);
        if (error.message.includes("required fields") || error.message.includes("invalid meal type")) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};
exports.bulkCreateNutritionLogs = bulkCreateNutritionLogs;
//# sourceMappingURL=nutrition-controller.js.map