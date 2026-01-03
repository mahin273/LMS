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

        const user = await User.create({
            email: validatedData.email,
            name: validatedData.name,
            password_hash: passwordHash,
            role: validatedData.role as any || 'student',
        });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.status(201).json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
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

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
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
