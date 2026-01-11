
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { getSystemStats, getSystemLogs, resetDatabase, clearCache } from '../controllers/admin.controller';

const router = Router();

router.get('/stats', authenticateToken, authorizeRoles('admin'), getSystemStats);
router.get('/logs', authenticateToken, authorizeRoles('admin'), getSystemLogs);

router.post('/reset-db', authenticateToken, authorizeRoles('admin'), resetDatabase);
router.post('/clear-cache', authenticateToken, authorizeRoles('admin'), clearCache);

export default router;
