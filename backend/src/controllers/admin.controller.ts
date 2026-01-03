
import { Request, Response } from 'express';
import { User, Course, Enrollment } from '../models';
import sequelize from '../config/database';

export const getSystemStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.count();
        const totalCourses = await Course.count();
        const totalEnrollments = await Enrollment.count();

        // Simple mock data for chart (last 7 days activity)
        // In a real app, we'd query this with GROUP BY createdAt
        const activityData = [
            { name: 'Mon', users: 4, courses: 1 },
            { name: 'Tue', users: 3, courses: 0 },
            { name: 'Wed', users: 2, courses: 2 },
            { name: 'Thu', users: 7, courses: 1 },
            { name: 'Fri', users: 5, courses: 3 },
            { name: 'Sat', users: 10, courses: 0 },
            { name: 'Sun', users: totalUsers > 120 ? 12 : 6, courses: 2 }, // Dynamic-ish
        ];

        res.json({
            counts: {
                users: totalUsers,
                courses: totalCourses,
                enrollments: totalEnrollments
            },
            chartData: activityData,
            systemStatus: 'Operational',
            dbVersion: 'MySQL 8.0'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getSystemLogs = async (req: Request, res: Response) => {
    try {
        // Fetch recent users and courses as "logs"
        const recentUsers = await User.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            attributes: ['name', 'email', 'role', 'createdAt']
        });

        const recentCourses = await Course.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            attributes: ['title', 'createdAt'],
            include: [{ model: User, as: 'instructor', attributes: ['name'] }]
        });

        // Combine and sort
        const logs = [
            ...recentUsers.map(u => ({
                id: `user-${u.email}`,
                type: 'USER_REGISTERED',
                message: `New ${u.role}: ${u.name} (${u.email})`,
                timestamp: u.createdAt
            })),
            ...recentCourses.map(c => ({
                id: `course-${c.title}`,
                type: 'COURSE_CREATED',
                message: `New Course: ${c.title} by ${(c as any).instructor?.name}`,
                timestamp: c.createdAt
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
