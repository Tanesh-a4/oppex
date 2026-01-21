import axios from 'axios';
import { config } from '../config.js';

const quarkusClient = axios.create({
    baseURL: config.quarkus.url,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const quarkusService = {
    /**
     * Register a new user via Quarkus backend
     */
    async register(email, password) {
        const response = await quarkusClient.post('/api/users/register', {
            email,
            password,
        });
        return response.data;
    },

    /**
     * Authenticate user via Quarkus backend
     */
    async login(email, password) {
        const response = await quarkusClient.post('/api/users/login', {
            email,
            password,
        });
        return response.data;
    },

    /**
     * Verify email token via Quarkus backend
     */
    async verifyEmail(token) {
        const response = await quarkusClient.get(`/api/users/verify/${token}`);
        return response.data;
    },

    /**
     * Get verification token for a user
     */
    async getVerificationToken(email) {
        const response = await quarkusClient.get(`/api/users/token/${email}`);
        return response.data;
    },

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const response = await quarkusClient.get(`/api/users/${userId}`);
        return response.data;
    },

    /**
     * Health check
     */
    async healthCheck() {
        const response = await quarkusClient.get('/api/users/health');
        return response.data;
    },
};
