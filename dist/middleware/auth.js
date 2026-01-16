"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeSelfOrAdmin = exports.authorizeRoles = exports.authorize = exports.authenticate = void 0;
const auth_services_1 = require("../services/auth-services");
const authService = new auth_services_1.AuthService();
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.replace('Bearer ', '');
        const decoded = authService.validateToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const authorizeRoles = (roles) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!roleArray.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const authorizeSelfOrAdmin = (paramName = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const requestedUserId = req.params[paramName] || req.body.userId;
        if (req.user.role !== 'ADMIN' && req.user.userId !== requestedUserId) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.authorizeSelfOrAdmin = authorizeSelfOrAdmin;
//# sourceMappingURL=auth.js.map