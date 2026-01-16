import { Router } from 'express';
import { register, login, getMe, googleCallback, sendMagicLink, verifyMagicLink, forgotPassword, resetPassword } from '../controllers/auth.controller';
import passport from 'passport';

import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

// Magic Link
router.post('/magic-link', sendMagicLink);
router.get('/magic-link/verify', verifyMagicLink);


// Forgot Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
