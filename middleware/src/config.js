import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root project directory (parent of middleware)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also try middleware folder for local overrides
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    session: {
        secret: process.env.SESSION_SECRET || 'default-secret-change-me',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    
    quarkus: {
        url: process.env.QUARKUS_URL || 'http://localhost:8081',
    },
    
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
    },
    
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
};
