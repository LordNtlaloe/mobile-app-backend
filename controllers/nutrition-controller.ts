import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface NutritionRequest extends Request {
    body: {
        clientId: string;
        date?: string;
        mealType: string;
        imageUrl: string;
        notes?: string;
    }
}

export const createNutritionLog = async (req: NutritionRequest, res: Response): Promise<void> => {
    try {
        const { clientId, date, mealType, imageUrl, notes } = req.body;

        if (!clientId || !mealType || !imageUrl) {
            res.status(400).json({ error: "Client ID, meal type, and image URL are required" });
            return;
        }

        // Validate meal type
        const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
        if (!validMealTypes.includes(mealType.toUpperCase())) {
            res.status(400).json({ error: "Invalid meal type. Must be BREAKFAST, LUNCH, DINNER, or SNACK" });
            return;
        }

        // Verify client exists
        const client = await prisma.clientProfile.findUnique({
            where: { id: clientId }
        });

        if (!client) {
            res.status(404).json({ error: "Client not found" });
            return;
        }

        const nutritionLog = await prisma.nutritionLog.create({
            data: {
                clientId,
                date: date ? new Date(date) : new Date(),
                mealType: mealType.toUpperCase() as any,
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getNutritionLogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const nutritionLog = await prisma.nutritionLog.findUnique({
            where: { id: id as string },
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getClientNutritionLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const {
            startDate,
            endDate,
            mealType,
            page = "1",
            limit = "20"
        } = req.query;

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 20;
        const skip = (pageNum - 1) * limitNum;

        const where: any = { clientId: clientId as string };

        // Date filtering
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate as string);
            }
            if (endDate) {
                where.date.lte = new Date(endDate as string);
            }
        }

        // Meal type filtering
        if (mealType) {
            const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
            if (validMealTypes.includes((mealType as string).toUpperCase())) {
                where.mealType = (mealType as string).toUpperCase();
            }
        }

        const [nutritionLogs, total] = await Promise.all([
            prisma.nutritionLog.findMany({
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
            prisma.nutritionLog.count({ where })
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getNutritionLogsByDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, date } = req.params;

        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const nutritionLogs = await prisma.nutritionLog.findMany({
            where: {
                clientId: clientId as string,
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

        // Group by meal type
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateNutritionLog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { date, mealType, imageUrl, notes } = req.body;

        // Check if nutrition log exists
        const existingLog = await prisma.nutritionLog.findUnique({
            where: { id: id as string }
        });

        if (!existingLog) {
            res.status(404).json({ error: "Nutrition log not found" });
            return;
        }

        // Validate meal type if provided
        if (mealType) {
            const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
            if (!validMealTypes.includes(mealType.toUpperCase())) {
                res.status(400).json({ error: "Invalid meal type" });
                return;
            }
        }

        const updatedLog = await prisma.nutritionLog.update({
            where: { id: id as string },
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteNutritionLog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if nutrition log exists
        const existingLog = await prisma.nutritionLog.findUnique({
            where: { id: id as string }
        });

        if (!existingLog) {
            res.status(404).json({ error: "Nutrition log not found" });
            return;
        }

        await prisma.nutritionLog.delete({
            where: { id: id as string }
        });

        res.status(200).json({
            message: "Nutrition log deleted successfully",
            deletedLog: {
                id: existingLog.id,
                date: existingLog.date,
                mealType: existingLog.mealType
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getNutritionSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const { period = "week" } = req.query; // week, month, year

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
            prisma.nutritionLog.count({
                where: {
                    clientId: clientId as string,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            }),
            prisma.nutritionLog.groupBy({
                by: ['mealType'],
                where: {
                    clientId: clientId as string,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _count: {
                    mealType: true
                }
            }),
            prisma.nutritionLog.findMany({
                where: { clientId: clientId as string },
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
            period: period as string,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            totalLogs: logs,
            mealTypeBreakdown: mealTypeCounts.reduce((acc: any, item) => {
                acc[item.mealType] = item._count.mealType;
                return acc;
            }, {}),
            recentLogs,
            averagePerDay: period === "week" ? (logs / 7).toFixed(1) :
                period === "month" ? (logs / 30).toFixed(1) :
                    (logs / 365).toFixed(1)
        };

        res.status(200).json(summary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const bulkCreateNutritionLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, logs } = req.body;

        if (!clientId || !Array.isArray(logs) || logs.length === 0) {
            res.status(400).json({ error: "Client ID and logs array are required" });
            return;
        }

        // Verify client exists
        const client = await prisma.clientProfile.findUnique({
            where: { id: clientId as string }
        });

        if (!client) {
            res.status(404).json({ error: "Client not found" });
            return;
        }

        // Validate each log
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
                mealType: log.mealType.toUpperCase() as any,
                imageUrl: log.imageUrl,
                notes: log.notes
            };
        });

        const createdLogs = await prisma.$transaction(
            validatedLogs.map(log =>
                prisma.nutritionLog.create({
                    data: log,
                    select: {
                        id: true,
                        date: true,
                        mealType: true,
                        imageUrl: true
                    }
                })
            )
        );

        res.status(201).json({
            message: `${createdLogs.length} nutrition logs created successfully`,
            logs: createdLogs
        });
    } catch (error: any) {
        console.error(error);
        if (error.message.includes("required fields") || error.message.includes("invalid meal type")) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};