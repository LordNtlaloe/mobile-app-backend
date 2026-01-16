"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClients = exports.getAllClients = exports.updateClientProfile = exports.getClientProfile = exports.createClientProfile = void 0;
const client_services_1 = require("../services/client-services");
const clientService = new client_services_1.ClientService();
const createClientProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const data = req.body;
        if (!data.firstName || !data.lastName) {
            res.status(400).json({ error: "First name and last name are required" });
            return;
        }
        const profile = await clientService.createClientProfile(userId, data);
        res.status(201).json(profile);
    }
    catch (error) {
        console.error("Create client profile error:", error);
        if (error.message.includes("already exists") || error.message.includes("not found")) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createClientProfile = createClientProfile;
const getClientProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const profile = await clientService.getClientProfile(userId);
        res.json(profile);
    }
    catch (error) {
        console.error("Get client profile error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getClientProfile = getClientProfile;
const updateClientProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const data = req.body;
        const profile = await clientService.updateClientProfile(userId, data);
        res.json(profile);
    }
    catch (error) {
        console.error("Update client profile error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateClientProfile = updateClientProfile;
const getAllClients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await clientService.getAllClients(page, limit);
        res.json(result);
    }
    catch (error) {
        console.error("Get all clients error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getAllClients = getAllClients;
const searchClients = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            res.status(400).json({ error: "Search query is required" });
            return;
        }
        const clients = await clientService.searchClients(query);
        res.json(clients);
    }
    catch (error) {
        console.error("Search clients error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.searchClients = searchClients;
//# sourceMappingURL=client-controller.js.map