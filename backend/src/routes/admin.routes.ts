
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { getSystemStats, getSystemLogs } from '../controllers/admin.controller';

const router = Router();

router.get('/stats', authenticateToken, authorizeRoles('admin'), getSystemStats);
router.get('/logs', authenticateToken, authorizeRoles('admin'), getSystemLogs);

export default router;
