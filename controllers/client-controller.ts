// controllers/client-controller.ts
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ClientService, ClientProfileData } from "../services/client-services";

const clientService = new ClientService();

export const createClientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const data: ClientProfileData = req.body;
        
        if (!data.firstName || !data.lastName) {
            res.status(400).json({ error: "First name and last name are required" });
            return;
        }

        const profile = await clientService.createClientProfile(userId, data);
        res.status(201).json(profile);
    } catch (error: any) {
        console.error("Create client profile error:", error);

        if (error.message.includes("already exists") || error.message.includes("not found")) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getClientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const profile = await clientService.getClientProfile(userId);
        res.json(profile);
    } catch (error: any) {
        console.error("Get client profile error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateClientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const data: Partial<ClientProfileData> = req.body;
        const profile = await clientService.updateClientProfile(userId, data);
        res.json(profile);
    } catch (error: any) {
        console.error("Update client profile error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllClients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        
        const result = await clientService.getAllClients(page, limit);
        res.json(result);
    } catch (error) {
        console.error("Get all clients error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const searchClients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { query } = req.query;
        
        if (!query || typeof query !== 'string') {
            res.status(400).json({ error: "Search query is required" });
            return;
        }

        const clients = await clientService.searchClients(query);
        res.json(clients);
    } catch (error) {
        console.error("Search clients error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};