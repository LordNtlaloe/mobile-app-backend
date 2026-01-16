"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const mail_1 = require("../lib/mail");
const prisma_2 = require("@prisma/client";);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
class AuthService {
    generateVerificationCode() {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        }, JWT_SECRET, { expiresIn: "15m" });
    }
    async generateRefreshToken(userId) {
        const refreshToken = crypto_1.default.randomBytes(40).toString("hex");
        const refreshHash = await bcrypt_1.default.hash(refreshToken, 10);
        await prisma_1.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: refreshHash,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        return refreshToken;
    }
    async registerUser(data) {
        const { email, password, firstName, lastName, role = prisma_2.Role.CLIENT, department, specialization, contactInfo } = data;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const verificationCode = this.generateVerificationCode();
        const userData = {
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            role,
            isVerified: role !== prisma_2.Role.CLIENT,
            verificationCode: {
                create: {
                    code: verificationCode,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            }
        };
        if (role === prisma_2.Role.CLIENT && firstName && lastName) {
            userData.clientProfile = {
                create: { firstName, lastName }
            };
        }
        else if ((role === prisma_2.Role.TRAINER || role === prisma_2.Role.ADMIN) && firstName && lastName && department && contactInfo) {
            userData.staffProfile = {
                create: {
                    firstName,
                    lastName,
                    department,
                    specialization,
                    contactInfo
                }
            };
        }
        const user = await prisma_1.prisma.user.create({
            data: userData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                createdAt: true,
                clientProfile: role === prisma_2.Role.CLIENT ? {
                    select: { firstName: true, lastName: true }
                } : false,
                staffProfile: (role === prisma_2.Role.TRAINER || role === prisma_2.Role.ADMIN) ? {
                    select: { firstName: true, lastName: true, department: true }
                } : false
            }
        });
        if (firstName && lastName && role === prisma_2.Role.CLIENT) {
            const fullName = `${firstName} ${lastName}`;
            await (0, mail_1.sendWelcomeEmail)(email, fullName, verificationCode);
        }
        return user;
    }
    async verifyUser(email, code) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid email");
        }
        const record = await prisma_1.prisma.verificationCode.findFirst({
            where: { userId: user.id, code, used: false },
            orderBy: { createdAt: "desc" }
        });
        if (!record || record.expiresAt < new Date()) {
            throw new Error("Invalid or expired code");
        }
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
            prisma_1.prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } })
        ]);
        return { message: "User verification successful" };
    }
    async loginUser(email, password) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid email or password");
        }
        if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
        }
        if (!user.passwordHash) {
            throw new Error("Selected user has no password set");
        }
        const validPassword = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!validPassword) {
            throw new Error("Invalid email or password");
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
        };
    }
    async requestPasswordReset(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { message: "If an account exists with this email, a reset link has been sent" };
        }
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const tokenHash = await bcrypt_1.default.hash(token, 10);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await prisma_1.prisma.passwordReset.create({
            data: { userId: user.id, tokenHash, expiresAt }
        });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
        await (0, mail_1.sendPasswordResetEmail)(email, "Reset Your Password", `Click here to reset: ${resetUrl}`);
        return { message: "Password reset email sent" };
    }
    async resetPassword(email, token, newPassword) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid email");
        }
        const record = await prisma_1.prisma.passwordReset.findFirst({
            where: { userId: user.id, used: false },
            orderBy: { createdAt: "desc" }
        });
        if (!record || record.expiresAt < new Date()) {
            throw new Error("Invalid or expired token");
        }
        const isValidToken = await bcrypt_1.default.compare(token, record.tokenHash);
        if (!isValidToken) {
            throw new Error("Invalid token");
        }
        const newHash = await bcrypt_1.default.hash(newPassword, 12);
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } }),
            prisma_1.prisma.passwordReset.update({ where: { id: record.id }, data: { used: true } })
        ]);
        return { message: "Password update successful" };
    }
    async refreshAccessToken(refreshToken) {
        const records = await prisma_1.prisma.refreshToken.findMany({
            where: { expiresAt: { gt: new Date() } },
            include: { user: true }
        });
        let validRecord = null;
        for (const record of records) {
            const isValid = await bcrypt_1.default.compare(refreshToken, record.tokenHash);
            if (isValid) {
                validRecord = record;
                break;
            }
        }
        if (!validRecord) {
            throw new Error("Invalid or expired refresh token");
        }
        const user = validRecord.user;
        const newAccessToken = this.generateAccessToken(user);
        const newRefreshToken = crypto_1.default.randomBytes(40).toString("hex");
        const newRefreshHash = await bcrypt_1.default.hash(newRefreshToken, 10);
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.refreshToken.delete({ where: { id: validRecord.id } }),
            prisma_1.prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    tokenHash: newRefreshHash,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            })
        ]);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }
    validateToken(token) {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth-services.js.map