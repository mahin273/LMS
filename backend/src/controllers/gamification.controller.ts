import { Request, Response } from 'express';
import { User, Badge } from '../models';
import sequelize from '../config/database';

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const leaderboard = await User.findAll({
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('badges.id')), 'badgeCount']
            ],
            include: [
                {
                    model: Badge,
                    as: 'badges',
                    attributes: [] // We don't need the badge details, just the count
                }
            ],
            group: ['User.id'],
            order: [[sequelize.literal('badgeCount'), 'DESC']],
            limit: 10,
            subQuery: false // Important for limit with group by
        });

        res.json(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
