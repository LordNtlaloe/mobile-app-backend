"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailConnection = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const render_email_1 = require("../utils/render-email");
const welcome_email_1 = __importDefault(require("../emails/welcome-email"));
const React = __importStar(require("react"));
console.log('=== EMAIL CONFIGURATION ===');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***configured***' : 'MISSING');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('==========================');
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
        minVersion: 'TLSv1.2'
    }
});
let isTransporterVerified = false;
const verifyTransporter = async () => {
    if (isTransporterVerified)
        return true;
    try {
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');
        isTransporterVerified = true;
        return true;
    }
    catch (error) {
        console.error('❌ SMTP verification failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
        }
        return false;
    }
};
verifyTransporter().catch(console.error);
const sendEmail = async (options) => {
    try {
        const isVerified = await verifyTransporter();
        if (!isVerified && process.env.NODE_ENV === 'production') {
            throw new Error('SMTP connection not verified');
        }
        let html = options.html;
        let text = options.text;
        if (options.component) {
            html = await (0, render_email_1.renderEmailComponent)(options.component);
            if (!text) {
                text = html.replace(/<[^>]*>/g, '');
            }
        }
        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
        if (!fromEmail) {
            throw new Error('FROM_EMAIL or SMTP_USER must be configured');
        }
        const mailOptions = {
            from: `"New Moon Gym Plus" <${fromEmail}>`,
            to: options.to,
            subject: options.subject,
            text: text || '',
            html: html || `<p>${text}</p>`,
        };
    }
    catch (error) {
        console.error('❌ Email error:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                code: error.code,
                command: error.command,
                responseCode: error.responseCode
            });
        }
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️  Email failed in development mode - continuing...');
            return;
        }
        throw error;
    }
};
exports.sendEmail = sendEmail;
const sendWelcomeEmail = async (to, userName, verificationLink) => {
    const component = React.createElement(welcome_email_1.default, {
        userName,
        verificationLink,
    });
    await (0, exports.sendEmail)({
        to,
        subject: `Welcome to New Moon Gym Plus, ${userName}!`,
        text: `Welcome ${userName}! Please verify your email: ${verificationLink}`,
        component,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = async (to, userName, resetLink) => {
    await (0, exports.sendEmail)({
        to,
        subject: 'Reset Your Password',
        text: `Hello ${userName}, click here to reset your password: ${resetLink}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Reset Your Password</h1>
                <p>Hello ${userName},</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetLink}" style="
                    background-color: #0070f3;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                ">Reset Password</a>
                <p>Or copy and paste this link: ${resetLink}</p>
            </div>
        `,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.testEmailConnection = verifyTransporter;
//# sourceMappingURL=mail.js.map