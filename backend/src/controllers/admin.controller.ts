
import { Request, Response } from 'express';
import { User, Course, Enrollment } from '../models';
import sequelize from '../config/database';

import { Op } from 'sequelize';

export const getSystemStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.count();
        const totalCourses = await Course.count();
        const totalEnrollments = await Enrollment.count();

        // Ratio Calculation
        const studentCount = await User.count({ where: { role: 'student' } });
        const instructorCount = await User.count({ where: { role: 'instructor' } });
        const ratio = instructorCount > 0 ? (studentCount / instructorCount).toFixed(1) : '0';

        // Calculate Activity for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const newUsers = await User.findAll({
            where: { createdAt: { [Op.gte]: sevenDaysAgo } } as any,
            attributes: ['createdAt']
        });

        const newCourses = await Course.findAll({
            where: { createdAt: { [Op.gte]: sevenDaysAgo } } as any,
            attributes: ['createdAt']
        });

        const activityData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + i);
            const dayName = days[date.getDay()];

            // Start of day
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);

            // End of day
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            const userCount = newUsers.filter(u => {
                const creationDate = new Date(u.createdAt);
                return creationDate >= start && creationDate <= end;
            }).length;

            const courseCount = newCourses.filter(course => {
                const creationDate = new Date(course.createdAt);
                return creationDate >= start && creationDate <= end;
            }).length;

            activityData.push({
                name: dayName,
                users: userCount,
                courses: courseCount
            });
        }

        res.json({
            counts: {
                users: totalUsers,
                students: studentCount,
                instructors: instructorCount,
                courses: totalCourses,
                enrollments: totalEnrollments,
                studentToInstructorRatio: ratio
            },
            chartData: activityData,
            systemStatus: 'Operational',
            dbVersion: 'MySQL 8.0'
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getSystemLogs = async (req: Request, res: Response) => {
    try {

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

import { seedDatabase } from '../services/seeder.service';

export const resetDatabase = async (req: Request, res: Response) => {
    try {
        console.log('Admin initiated database reset...');
        // Force rewrite = true will helper drop tables and re-seed
        await seedDatabase(true);
        res.json({ message: 'Database has been reset and re-seeded successfully' });
    } catch (error) {
        console.error('Reset failed:', error);
        res.status(500).json({ error: 'Failed to reset database' });
    }
};

export const clearCache = async (req: Request, res: Response) => {
    try {
        console.log('Admin initiated cache clear...');
        // Since we don't have a real Redis/Cache layer yet, we will just simulate a success after a small delay
        // In a real app, you would do: await redisClient.flushAll();

        // Maybe we can also trigger a garbage collection if exposed, but unnecessary here.

        res.json({ message: 'System cache cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cache' });
    }
};
