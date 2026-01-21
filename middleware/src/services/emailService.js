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
            subject: '✨ Verify your email - Oppex',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6; 
                            color: #2d2d2d;
                            background: linear-gradient(135deg, #FCF9EA 0%, #BADFDB 100%);
                            padding: 40px 20px;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background: #ffffff;
                            border-radius: 24px;
                            overflow: hidden;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #BADFDB 0%, #FFA4A4 50%, #FFBDBD 100%);
                            padding: 50px 40px;
                            text-align: center;
                            position: relative;
                            overflow: hidden;
                        }
                        .header::before {
                            content: '';
                            position: absolute;
                            top: -50%;
                            left: -50%;
                            width: 200%;
                            height: 200%;
                            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
                        }
                        .header h1 { 
                            color: #2d2d2d;
                            font-size: 32px;
                            font-weight: 800;
                            margin-bottom: 8px;
                            position: relative;
                            z-index: 1;
                        }
                        .header p {
                            color: #666666;
                            font-size: 16px;
                            position: relative;
                            z-index: 1;
                        }
                        .content { 
                            padding: 50px 40px;
                            background: #ffffff;
                        }
                        .content p {
                            margin-bottom: 20px;
                            color: #2d2d2d;
                            font-size: 16px;
                        }
                        .emoji-icon {
                            font-size: 64px;
                            margin-bottom: 20px;
                            display: block;
                        }
                        .button-container {
                            text-align: center;
                            margin: 40px 0;
                        }
                        .button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, #BADFDB 0%, #FFBDBD 100%);
                            color: #2d2d2d;
                            padding: 16px 48px; 
                            text-decoration: none; 
                            border-radius: 12px;
                            font-weight: 700;
                            font-size: 16px;
                            box-shadow: 0 8px 20px rgba(186, 223, 219, 0.4);
                            transition: all 0.3s ease;
                            letter-spacing: 0.3px;
                        }
                        .button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 12px 30px rgba(186, 223, 219, 0.6);
                        }
                        .link-box {
                            background: linear-gradient(135deg, rgba(252, 249, 234, 0.8), rgba(186, 223, 219, 0.3));
                            padding: 20px;
                            border-radius: 12px;
                            border: 1px solid rgba(186, 223, 219, 0.3);
                            margin: 20px 0;
                        }
                        .link-box p {
                            margin-bottom: 10px;
                            font-size: 14px;
                            color: #666666;
                        }
                        .link-box a {
                            word-break: break-all; 
                            color: #2d7a73;
                            font-weight: 600;
                            text-decoration: none;
                        }
                        .info-box {
                            background: rgba(255, 189, 189, 0.15);
                            border-left: 4px solid #FFBDBD;
                            padding: 16px 20px;
                            border-radius: 8px;
                            margin: 30px 0;
                        }
                        .info-box p {
                            margin: 0;
                            font-size: 14px;
                            color: #666666;
                        }
                        .footer { 
                            background: linear-gradient(135deg, rgba(252, 249, 234, 0.5), rgba(186, 223, 219, 0.2));
                            text-align: center; 
                            padding: 30px 40px;
                            border-top: 1px solid rgba(186, 223, 219, 0.3);
                        }
                        .footer p {
                            color: #666666;
                            font-size: 13px;
                            margin-bottom: 8px;
                        }
                        .footer a {
                            color: #2d7a73;
                            text-decoration: none;
                            font-weight: 600;
                        }
                        @media only screen and (max-width: 600px) {
                            .header { padding: 40px 24px; }
                            .header h1 { font-size: 24px; }
                            .content { padding: 32px 24px; }
                            .footer { padding: 24px; }
                            .button { padding: 14px 32px; font-size: 15px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <span class="emoji-icon">🎯</span>
                            <h1>Welcome to Oppex!</h1>
                            <p>You're almost there</p>
                        </div>
                        <div class="content">
                            <p><strong>Hi there! 👋</strong></p>
                            <p>Thank you for joining Oppex! We're excited to have you on board. To complete your registration and unlock all features, please verify your email address.</p>
                            
                            <div class="button-container">
                                <a href="${verificationUrl}" class="button">✨ Verify My Email</a>
                            </div>
                            
                            <div class="link-box">
                                <p><strong>Or copy this link:</strong></p>
                                <a href="${verificationUrl}">${verificationUrl}</a>
                            </div>
                            
                            <div class="info-box">
                                <p><strong>📌 Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with Oppex, you can safely ignore this email.</p>
                            </div>
                            
                            <p>Need help? Feel free to reach out to our support team anytime.</p>
                            <p>Best regards,<br><strong>The Oppex Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} Oppex. All rights reserved.</p>
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Welcome to Oppex!
                
                Hi there!
                
                Thank you for joining Oppex! To complete your registration, please verify your email address by visiting the following link:
                
                ${verificationUrl}
                
                This verification link will expire in 24 hours.
                
                If you didn't create an account with Oppex, you can safely ignore this email.
                
                Best regards,
                The Oppex Team
                
                © ${new Date().getFullYear()} Oppex. All rights reserved.
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
