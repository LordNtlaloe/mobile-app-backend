// controllers/user-controller.ts
import { Request, Response } from "express";
import { UserService } from "../services/user-services";
import { Role } from "@prisma/client"

const userService = new UserService();

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, verified } = req.query;

        const users = await userService.getAllUsers(
            role as Role,
            verified === 'true' ? true : verified === 'false' ? false : undefined
        );
        res.json(users);
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id as string);
        res.json(user);
    } catch (error: any) {
        console.error("Get user by ID error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body;

        const user = await userService.updateUser(id as string, data);
        res.json(user);
    } catch (error: any) {
        console.error("Update user error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id as string);
        res.json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.error("Delete user error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await userService.getUserStats();
        res.json(stats);
    } catch (error) {
        console.error("Get user stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const revokeUserRefreshTokens = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await userService.revokeUserRefreshTokens(id as string);
        res.json(result);
    } catch (error: any) {
        console.error("Revoke refresh tokens error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

// controllers/user-controller.ts (add this export)
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.query;

        if (!query || typeof query !== 'string') {
            res.status(400).json({ error: "Search query is required" });
            return;
        }

        const users = await userService.searchUsers(query);
        res.json(users);
    } catch (error) {
        console.error("Search users error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};