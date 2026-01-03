
import { Request, Response } from 'express';
import { User } from '../models';

export const getAllUsers = async (req: Request, res: Response) => {
    const { role } = req.query;
    try {
        const whereClause = role ? { role } : {};
        const users = await User.findAll({
            where: whereClause as any,
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
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
