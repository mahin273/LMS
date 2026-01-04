import { Router } from 'express';
import { getLeaderboard } from '../controllers/gamification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/leaderboard', authenticateToken, getLeaderboard);

export default router;
