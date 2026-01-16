"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffClients = exports.deactivateStaff = exports.updateStaff = exports.getAllStaff = exports.getStaff = exports.createStaff = void 0;
const staff_services_1 = require("../services/staff-services");
const staffService = new staff_services_1.StaffService();
const createStaff = async (req, res) => {
    try {
        const { userId } = req.body;
        const data = req.body;
        if (!userId || !data.firstName || !data.lastName || !data.department || !data.contactInfo) {
            res.status(400).json({
                error: "User ID, first name, last name, department, and contact info are required"
            });
            return;
        }
        const staff = await staffService.createStaff(userId, data);
        res.status(201).json(staff);
    }
    catch (error) {
        console.error("Create staff error:", error);
        if (error.message.includes("already exists") || error.message.includes("not found")) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createStaff = createStaff;
const getStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await staffService.getStaff(id);
        res.json(staff);
    }
    catch (error) {
        console.error("Get staff error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getStaff = getStaff;
const getAllStaff = async (req, res) => {
    try {
        const { department, activeOnly } = req.query;
        const staff = await staffService.getAllStaff(department, activeOnly !== 'false');
        res.json(staff);
    }
    catch (error) {
        console.error("Get all staff error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getAllStaff = getAllStaff;
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const staff = await staffService.updateStaff(id, data);
        res.json(staff);
    }
    catch (error) {
        console.error("Update staff error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateStaff = updateStaff;
const deactivateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await staffService.deactivateStaff(id);
        res.json(staff);
    }
    catch (error) {
        console.error("Deactivate staff error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deactivateStaff = deactivateStaff;
const getStaffClients = async (req, res) => {
    try {
        const { id } = req.params;
        const clients = await staffService.getStaffClients(id);
        res.json(clients);
    }
    catch (error) {
        console.error("Get staff clients error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getStaffClients = getStaffClients;
//# sourceMappingURL=staff-controller.js.map