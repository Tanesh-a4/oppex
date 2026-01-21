import nodemailer from 'nodemailer';
import { config } from '../config.js';

// Create reusable transporter for Gmail
const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // true for 465, false for 587
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
    // Required for Gmail with port 587
    ...(config.smtp.port === 587 && { requireTLS: true }),
});

export const emailService = {
    /**
     * Send verification email to user
     */
    async sendVerificationEmail(email, verificationToken) {
        const verificationUrl = `${config.frontendUrl}/verify/${verificationToken}`;

        const mailOptions = {
            from: `"Oppex" <${config.smtp.from}>`,
            to: email,
            subject: 'Verify your email - Oppex',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f9f9f9; }
                        .button { 
                            display: inline-block; 
                            background: #4F46E5; 
                            color: white; 
                            padding: 12px 24px; 
                            text-decoration: none; 
                            border-radius: 4px;
                            margin: 20px 0;
                        }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to Oppex!</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p>Thank you for registering with Oppex. Please verify your email address by clicking the button below:</p>
                            <p style="text-align: center;">
                                <a href="${verificationUrl}" class="button">Verify Email</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
                            <p>If you didn't create an account, you can safely ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} Oppex. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Welcome to Oppex!
                
                Please verify your email address by visiting the following link:
                ${verificationUrl}
                
                If you didn't create an account, you can safely ignore this email.
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`📧 Verification email sent to ${email}: ${result.messageId}`);
        return result;
    },

    /**
     * Verify SMTP connection
     */
    async verifyConnection() {
        try {
            await transporter.verify();
            console.log('✅ SMTP connection verified');
            return true;
        } catch (error) {
            console.error('❌ SMTP connection failed:', error.message);
            return false;
        }
    },
};
