import { Request, Response } from 'express';
import { User, Badge } from '../models';
import sequelize from '../config/database';
import { BADGE_POINTS } from '../services/gamification.service';

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        // Get all students with their badges
        const students = await User.findAll({
            where: { role: 'student' },
            attributes: ['id', 'name'],
            include: [
                {
                    model: Badge,
                    as: 'badges',
                    attributes: ['type']
                }
            ]
        });

        // Calculate points for each student
        const leaderboard = students.map((student: any) => {
            const badges = student.badges || [];
            const badgeCount = badges.length;
            const totalPoints = badges.reduce((sum: number, badge: any) => {
                return sum + (BADGE_POINTS[badge.type as keyof typeof BADGE_POINTS] || 0);
            }, 0);

            // Count badges by type
            const badgeBreakdown = badges.reduce((acc: any, badge: any) => {
                acc[badge.type] = (acc[badge.type] || 0) + 1;
                return acc;
            }, {});

            return {
                id: student.id,
                name: student.name,
                badgeCount,
                totalPoints,
                badgeBreakdown
            };
        });

        // Sort by total points (descending), then by badge count
        leaderboard.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            return b.badgeCount - a.badgeCount;
        });

        // Return top 20
        res.json(leaderboard.slice(0, 20));
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
