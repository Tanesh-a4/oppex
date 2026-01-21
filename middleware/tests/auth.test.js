import request from 'supertest';
import express from 'express';
import session from 'express-session';
import authRoutes from '../src/routes/auth.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

// Mock the services
const mockQuarkusService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(),
    getVerificationToken: jest.fn(),
};

const mockEmailService = {
    sendVerificationEmail: jest.fn(),
};

// Mock the modules
jest.unstable_mockModule('../src/services/quarkusService.js', () => ({
    quarkusService: mockQuarkusService,
}));

jest.unstable_mockModule('../src/services/emailService.js', () => ({
    emailService: mockEmailService,
}));

// Create test app
function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use(session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
    }));
    app.use('/api', authRoutes);
    app.use(errorHandler);
    return app;
}

describe('Auth Routes', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
        jest.clearAllMocks();
    });

    describe('POST /api/signup', () => {
        it('should return 400 if email is missing', async () => {
            const response = await request(app)
                .post('/api/signup')
                .send({ password: 'password123' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email and password are required');
        });

        it('should return 400 if password is missing', async () => {
            const response = await request(app)
                .post('/api/signup')
                .send({ email: 'test@example.com' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/login', () => {
        it('should return 400 if credentials are missing', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/me', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Not authenticated');
        });
    });

    describe('POST /api/logout', () => {
        it('should successfully logout', async () => {
            const response = await request(app)
                .post('/api/logout');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Logout successful');
        });
    });
});
