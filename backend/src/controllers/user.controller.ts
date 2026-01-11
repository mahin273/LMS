
import { Request, Response } from 'express';
import { User, Badge, LessonProgress, Course, Assignment, Enrollment } from '../models';

import { Op } from 'sequelize';

export const getAllUsers = async (req: Request, res: Response) => {
    const { role, search } = req.query;
    try {
        const whereClause: any = {};
        if (role) whereClause.role = role;

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = await User.destroy({
            where: { id }
        });

        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

import bcrypt from 'bcryptjs';

export const getProfile = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    try {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'role', 'createdAt', 'bio', 'avatarUrl'],
            include: [
                { model: Badge, as: 'badges', required: false }
            ]
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    const { name, password, bio, avatarUrl } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password_hash = hashedPassword;
        }

        await user.save();

        res.json({ message: 'Profile updated successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role, bio: user.bio, avatarUrl: user.avatarUrl } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'rejected' | 'pending'

    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.status = status;
        await user.save();

        res.json({ message: `User status updated to ${status}`, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

export const getStudentActivity = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentId = req.user?.id;

    try {
        const last7Days: any = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last7Days[dateStr] = 0;
        }

        const progress = await LessonProgress.findAll({
            where: {
                studentId,
                completedAt: {
                    [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7))
                }
            },
            attributes: ['completedAt']
        });

        progress.forEach((p: any) => {
            const dateStr = new Date(p.completedAt).toISOString().split('T')[0];
            if (last7Days[dateStr] !== undefined) {
                last7Days[dateStr]++;
            }
        });

        const chartData = Object.keys(last7Days).map(date => ({
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            date,
            lessons: last7Days[date]
        }));

        res.json(chartData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
};

export const getStudentDeadlines = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentId = req.user?.id;

    try {
        // Find assignments for courses the student is enrolled in
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const assignments = await Assignment.findAll({
            where: {
                dueDate: {
                    [Op.between]: [new Date(), nextWeek]
                }
            },
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['title'],
                    required: true,
                    include: [{
                        model: User,
                        as: 'students',
                        where: { id: studentId },
                        attributes: []
                    }]
                }
            ],
            order: [['dueDate', 'ASC']],
            limit: 5
        });

        res.json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch deadlines' });
    }
};
