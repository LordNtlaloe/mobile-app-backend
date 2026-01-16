import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../lib/mail";
import { Department, Role } from "../generated/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

interface RegisterUserData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: Role;
    department?: Department;
    specialization?: string;
    contactInfo?: string;
}

interface LoginResult {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: string;
        isVerified: boolean;
        createdAt: Date;
    };
}

export class AuthService {
    generateVerificationCode(): string {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    generateAccessToken(user: { id: string; email: string; role: string; firstName: string | null; lastName: string | null }): string {
        return jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            },
            JWT_SECRET,
            { expiresIn: "15m" }
        );
    }

    async generateRefreshToken(userId: string): Promise<string> {
        const refreshToken = crypto.randomBytes(40).toString("hex");
        const refreshHash = await bcrypt.hash(refreshToken, 10);

        await prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: refreshHash,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        return refreshToken;
    }

    async registerUser(data: RegisterUserData) {
        const { email, password, firstName, lastName, role = Role.CLIENT, department, specialization, contactInfo } = data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error("User already exists");
        }

        // Hash password and generate code
        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationCode = this.generateVerificationCode();

        // Create user based on role
        const userData: any = {
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            role,
            isVerified: role !== Role.CLIENT, // Auto-verify staff/admin
            verificationCode: {
                create: {
                    code: verificationCode,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            }
        };

        // Add role-specific profile
        if (role === Role.CLIENT && firstName && lastName) {
            userData.clientProfile = {
                create: { firstName, lastName }
            };
        } else if ((role === Role.TRAINER || role === Role.ADMIN) && firstName && lastName && department && contactInfo) {
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

        const user = await prisma.user.create({
            data: userData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                createdAt: true,
                clientProfile: role === Role.CLIENT ? {
                    select: { firstName: true, lastName: true }
                } : false,
                staffProfile: (role === Role.TRAINER || role === Role.ADMIN) ? {
                    select: { firstName: true, lastName: true, department: true }
                } : false
            }
        });

        // Send welcome email for clients
        if (firstName && lastName && role === Role.CLIENT) {
            const fullName = `${firstName} ${lastName}`;
            await sendWelcomeEmail(email, fullName, verificationCode);
        }

        return user;
    }

    async verifyUser(email: string, code: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid email");
        }

        const record = await prisma.verificationCode.findFirst({
            where: { userId: user.id, code, used: false },
            orderBy: { createdAt: "desc" }
        });

        if (!record || record.expiresAt < new Date()) {
            throw new Error("Invalid or expired code");
        }

        await prisma.$transaction([
            prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
            prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } })
        ]);

        return { message: "User verification successful" };
    }

    async loginUser(email: string, password: string): Promise<LoginResult> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid email or password");
        }

        if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
        }

        if (!user.passwordHash) {
            throw new Error("Selected user has no password set");
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
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

    async requestPasswordReset(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });

        // For security, always return success even if user doesn't exist
        if (!user) {
            return { message: "If an account exists with this email, a reset link has been sent" };
        }

        const token = crypto.randomBytes(32).toString("hex");
        const tokenHash = await bcrypt.hash(token, 10);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.passwordReset.create({
            data: { userId: user.id, tokenHash, expiresAt }
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
        await sendPasswordResetEmail(email, "Reset Your Password", `Click here to reset: ${resetUrl}`);

        return { message: "Password reset email sent" };
    }

    async resetPassword(email: string, token: string, newPassword: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid email");
        }

        const record = await prisma.passwordReset.findFirst({
            where: { userId: user.id, used: false },
            orderBy: { createdAt: "desc" }
        });

        if (!record || record.expiresAt < new Date()) {
            throw new Error("Invalid or expired token");
        }

        const isValidToken = await bcrypt.compare(token, record.tokenHash);
        if (!isValidToken) {
            throw new Error("Invalid token");
        }

        const newHash = await bcrypt.hash(newPassword, 12);

        await prisma.$transaction([
            prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } }),
            prisma.passwordReset.update({ where: { id: record.id }, data: { used: true } })
        ]);

        return { message: "Password update successful" };
    }

    async refreshAccessToken(refreshToken: string) {
        const records = await prisma.refreshToken.findMany({
            where: { expiresAt: { gt: new Date() } },
            include: { user: true }
        });

        let validRecord = null;
        for (const record of records) {
            const isValid = await bcrypt.compare(refreshToken, record.tokenHash);
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
        const newRefreshToken = crypto.randomBytes(40).toString("hex");
        const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);

        await prisma.$transaction([
            prisma.refreshToken.delete({ where: { id: validRecord.id } }),
            prisma.refreshToken.create({
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

    validateToken(token: string) {
        return jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
            firstName?: string;
            lastName?: string;
        };
    }
}