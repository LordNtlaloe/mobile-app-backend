import nodemailer from 'nodemailer';
import { renderEmailComponent } from '../utils/render-email';
import WelcomeEmail from "../emails/welcome-email"
import * as React from 'react';

// Log environment variables (redact password)
console.log('=== EMAIL CONFIGURATION ===');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***configured***' : 'MISSING');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('==========================');

// Create transporter with proper SSL configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // TLS options
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
        minVersion: 'TLSv1.2'
    }
});

// Verify connection on startup
let isTransporterVerified = false;

const verifyTransporter = async (): Promise<boolean> => {
    if (isTransporterVerified) return true;

    try {
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');
        isTransporterVerified = true;
        return true;
    } catch (error) {
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

// Auto-verify on module load (non-blocking)
verifyTransporter().catch(console.error);

export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    component?: React.ReactElement;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        // Verify connection before sending
        const isVerified = await verifyTransporter();
        if (!isVerified && process.env.NODE_ENV === 'production') {
            throw new Error('SMTP connection not verified');
        }

        let html = options.html;
        let text = options.text;

        // If a React component is provided, render it
        if (options.component) {
            html = await renderEmailComponent(options.component);
            // Generate plain text from HTML if text not provided
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

        // const info = await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error('❌ Email error:', error);

        // Provide more detailed error information
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                code: (error as any).code,
                command: (error as any).command,
                responseCode: (error as any).responseCode
            });
        }

        // In development, log but don't throw
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️  Email failed in development mode - continuing...');
            return;
        }

        throw error;
    }
};

// Convenience functions for specific email types
export const sendWelcomeEmail = async (
    to: string,
    userName: string,
    verificationLink: string
): Promise<void> => {
    const component = React.createElement(WelcomeEmail, {
        userName,
        verificationLink,
    });

    await sendEmail({
        to,
        subject: `Welcome to New Moon Gym Plus, ${userName}!`,
        text: `Welcome ${userName}! Please verify your email: ${verificationLink}`,
        component,
    });
};

export const sendPasswordResetEmail = async (
    to: string,
    userName: string,
    resetLink: string
): Promise<void> => {
    await sendEmail({
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

// Export verify function for manual testing
export const testEmailConnection = verifyTransporter;