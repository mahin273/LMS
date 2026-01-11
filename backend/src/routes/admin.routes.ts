
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { getSystemStats, getSystemLogs, resetDatabase, clearCache } from '../controllers/admin.controller';

const router = Router();

router.get('/stats', authenticateToken, authorizeRoles('admin'), getSystemStats);
router.get('/logs', authenticateToken, authorizeRoles('admin'), getSystemLogs);

router.post('/reset-db', authenticateToken, authorizeRoles('admin'), resetDatabase);
router.post('/clear-cache', authenticateToken, authorizeRoles('admin'), clearCache);

import { getAllUsers, updateUserStatus, updateUserRole, resetUserPassword } from '../controllers/admin.controller';

router.get('/users', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.patch('/users/:id/status', authenticateToken, authorizeRoles('admin'), updateUserStatus);
router.patch('/users/:id/role', authenticateToken, authorizeRoles('admin'), updateUserRole);
router.post('/users/:id/reset-password', authenticateToken, authorizeRoles('admin'), resetUserPassword);

export default router;
