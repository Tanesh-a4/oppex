import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
}));

// Session configuration (in-memory store)
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.nodeEnv === 'production',
        httpOnly: true,
        maxAge: config.session.maxAge,
        sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    },
}));

// Routes
app.use('/api', authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'oppex-middleware' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 Middleware server running on http://localhost:${PORT}`);
    console.log(`📧 SMTP configured for: ${config.smtp.host}`);
    console.log(`🔗 Quarkus backend: ${config.quarkus.url}`);
});

export default app;
