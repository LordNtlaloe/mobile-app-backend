// controllers/staff-controller.ts
import { Request, Response } from "express";
import { StaffService, StaffData } from "../services/staff-services";
import { Department } from "@prisma/client";;

const staffService = new StaffService();

export const createStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;
        const data: StaffData = req.body;

        if (!userId || !data.firstName || !data.lastName || !data.department || !data.contactInfo) {
            res.status(400).json({
                error: "User ID, first name, last name, department, and contact info are required"
            });
            return;
        }

        const staff = await staffService.createStaff(userId, data);
        res.status(201).json(staff);
    } catch (error: any) {
        console.error("Create staff error:", error);

        if (error.message.includes("already exists") || error.message.includes("not found")) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        // Add type assertion here
        const staff = await staffService.getStaff(id as string);
        res.json(staff);
    } catch (error: any) {
        console.error("Get staff error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const { department, activeOnly } = req.query;

        const staff = await staffService.getAllStaff(
            department as Department,
            activeOnly !== 'false'
        );
        res.json(staff);
    } catch (error) {
        console.error("Get all staff error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data: Partial<StaffData> = req.body;

        // Add type assertion here
        const staff = await staffService.updateStaff(id as string, data);
        res.json(staff);
    } catch (error: any) {
        console.error("Update staff error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const deactivateStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        // Add type assertion here
        const staff = await staffService.deactivateStaff(id as string);
        res.json(staff);
    } catch (error: any) {
        console.error("Deactivate staff error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

export const getStaffClients = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        // Add type assertion here
        const clients = await staffService.getStaffClients(id as string);
        res.json(clients);
    } catch (error: any) {
        console.error("Get staff clients error:", error);

        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Internal server error" });
    }
};