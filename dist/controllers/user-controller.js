"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeUserRefreshTokens = exports.getUserStats = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const user_services_1 = require("../services/user-services");
const userService = new user_services_1.UserService();
const getAllUsers = async (req, res) => {
    try {
        const { role, verified } = req.query;
        const users = await userService.getAllUsers(role, verified === 'true' ? true : verified === 'false' ? false : undefined);
        res.json(users);
    }
    catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.json(user);
    }
    catch (error) {
        console.error("Get user by ID error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const user = await userService.updateUser(id, data);
        res.json(user);
    }
    catch (error) {
        console.error("Update user error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Delete user error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteUser = deleteUser;
const getUserStats = async (req, res) => {
    try {
        const stats = await userService.getUserStats();
        res.json(stats);
    }
    catch (error) {
        console.error("Get user stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getUserStats = getUserStats;
const revokeUserRefreshTokens = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.revokeUserRefreshTokens(id);
        res.json(result);
    }
    catch (error) {
        console.error("Revoke refresh tokens error:", error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.revokeUserRefreshTokens = revokeUserRefreshTokens;
//# sourceMappingURL=user-controller.js.map