import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { registerSchema, loginSchema } from '../utils/validation';

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        // Check if user exists
        const existingUser = await User.findOne({ where: { email: validatedData.email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const passwordHash = await bcrypt.hash(validatedData.password, 10);

        const status = validatedData.role === 'instructor' ? 'pending' : 'active';

        const user = await User.create({
            email: validatedData.email,
            name: validatedData.name,
            password_hash: passwordHash,
            role: validatedData.role as any || 'student',
            status
        });

        if (status === 'pending') {
            return res.status(201).json({
                message: 'Registration successful. Your account is pending approval by an administrator.',
                user: { id: user.id, name: user.name, email: user.email, role: user.role, status }
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.status(201).json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role, status },
            token,
            refreshToken
        });
    } catch (error: any) {
        if (error.errors) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await User.findOne({ where: { email: validatedData.email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(validatedData.password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Your account is pending approval.' });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ error: 'Your account has been rejected.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
            token,
            refreshToken
        });
    } catch (error: any) {
        if (error.errors) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    // req.user is set by authenticateToken middleware
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
};

// Google Callback
export const googleCallback = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'Authentication failed' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        // Redirect to frontend with token
        // Assuming frontend is running on process.env.FRONTEND_URL or localhost:5173
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Magic Link
import crypto from 'crypto';
import { sendEmail } from '../utils/email.service';
import { Op } from 'sequelize';

export const sendMagicLink = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Option: Auto-register or return error. 
            // For now, auto-register as pending/student if not found, or maybe just error to prevent spam?
            // Let's create a new user with random password/setup
            user = await User.create({
                email,
                name: email.split('@')[0], // Default name
                password_hash: '', // No password
                role: 'student',
                status: 'active'
            } as any);
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        user.magicLinkToken = token;
        user.magicLinkExpiresAt = expiresAt;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const link = `${process.env.BACKEND_URL || 'http://localhost:4000/api'}/auth/magic-link/verify?token=${token}&email=${email}`;

        await sendEmail(email, 'Your Magic Link', `<p>Click <a href="${link}">here</a> to login to LMS.</p>`);

        res.json({ message: 'Magic link sent' });
    } catch (error) {
        console.error('Magic link error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const verifyMagicLink = async (req: Request, res: Response) => {
    try {
        const { token, email } = req.query;
        if (!token || !email) return res.status(400).json({ error: 'Invalid link' });

        const user = await User.findOne({
            where: {
                email: email as string,
                magicLinkToken: token as string,
                magicLinkExpiresAt: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Clear token
        user.magicLinkToken = null as any;
        user.magicLinkExpiresAt = null as any;
        await user.save();

        const jwtToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}&refreshToken=${refreshToken}`);

    } catch (error) {
        console.error('Verify magic link error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
