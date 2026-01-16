"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.refreshAccessToken = exports.resetPassword = exports.requestPasswordReset = exports.login = exports.verify = exports.register = void 0;
const auth_services_1 = require("../services/auth-services");
const authService = new auth_services_1.AuthService();
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const user = await authService.registerUser({ email, password, firstName, lastName, role });
        res.status(201).json(user);
    }
    catch (error) {
        console.error("Registration error:", error);
        if (error.message === "User already exists") {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.register = register;
const verify = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            res.status(400).json({ error: "Email and code are required" });
            return;
        }
        const result = await authService.verifyUser(email, code);
        res.json(result);
    }
    catch (error) {
        console.error("Verification error:", error);
        if (error.message.includes("Invalid") || error.message.includes("expired")) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.verify = verify;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const result = await authService.loginUser(email, password);
        res.json(result);
    }
    catch (error) {
        console.error("Login error:", error);
        if (error.message.includes("Invalid") || error.message.includes("verify")) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.login = login;
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }
        const result = await authService.requestPasswordReset(email);
        res.json(result);
    }
    catch (error) {
        console.error("Password reset request error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            res.status(400).json({ error: "Email, token and password are required" });
            return;
        }
        const result = await authService.resetPassword(email, token, newPassword);
        res.json(result);
    }
    catch (error) {
        console.error("Password reset error:", error);
        if (error.message.includes("Invalid") || error.message.includes("expired")) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.resetPassword = resetPassword;
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }
        const result = await authService.refreshAccessToken(refreshToken);
        res.json(result);
    }
    catch (error) {
        console.error("Token refresh error:", error);
        if (error.message.includes("Invalid") || error.message.includes("expired")) {
            res.status(401).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.refreshAccessToken = refreshAccessToken;
const validateToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.replace('Bearer ', '');
        const decoded = authService.validateToken(token);
        res.json(decoded);
    }
    catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.validateToken = validateToken;
//# sourceMappingURL=auth-controller.js.map