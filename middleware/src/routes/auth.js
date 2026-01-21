import express from 'express';
import { quarkusService } from '../services/quarkusService.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

/**
 * POST /api/signup
 * Register a new user and send verification email
 */
router.post('/signup', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        // Register user via Quarkus
        const result = await quarkusService.register(email, password);
        console.log('[DEBUG] Registration result:', JSON.stringify(result, null, 2));

        if (result.success) {
            // Use token from registration response directly (more reliable)
            const token = result.data?.verificationToken;
            console.log('[DEBUG] Verification token from registration:', token);
            
            // Send verification email
            if (token) {
                try {
                    await emailService.sendVerificationEmail(email, token);
                } catch (emailError) {
                    console.error('Failed to send verification email:', emailError.message);
                    // Don't fail registration if email fails
                }
            } else {
                console.error('[ERROR] No verification token in registration response!');
            }

            return res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email to verify your account.',
                data: result.data,
            });
        }

        return res.status(400).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/login
 * Authenticate user and create session
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        // Authenticate via Quarkus
        const result = await quarkusService.login(email, password);

        if (result.success) {
            // Create session
            req.session.user = {
                id: result.data.id,
                email: result.data.email,
                isVerified: result.data.isVerified,
            };

            return res.json({
                success: true,
                message: 'Login successful',
                data: req.session.user,
            });
        }

        return res.status(401).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/logout
 * Destroy session and log out user
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to logout',
            });
        }

        res.clearCookie('connect.sid');
        return res.json({
            success: true,
            message: 'Logout successful',
        });
    });
});

/**
 * GET /api/me
 * Get current session user
 */
router.get('/me', (req, res) => {
    if (req.session.user) {
        return res.json({
            success: true,
            data: req.session.user,
        });
    }

    return res.status(401).json({
        success: false,
        message: 'Not authenticated',
    });
});

/**
 * GET /api/verify/:token
 * Verify email and update session
 */
router.get('/verify/:token', async (req, res, next) => {
    try {
        const { token } = req.params;

        // Verify via Quarkus
        const result = await quarkusService.verifyEmail(token);

        if (result.success) {
            // Update session if user is logged in
            if (req.session.user && req.session.user.email === result.data.email) {
                req.session.user.isVerified = true;
            }

            return res.json({
                success: true,
                message: 'Email verified successfully',
                data: result.data,
            });
        }

        return res.status(400).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        if (req.session.user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified',
            });
        }

        // Get verification token
        const tokenResult = await quarkusService.getVerificationToken(req.session.user.email);
        
        // Send verification email
        await emailService.sendVerificationEmail(req.session.user.email, tokenResult.data);

        return res.json({
            success: true,
            message: 'Verification email sent',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
