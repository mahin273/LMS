
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { getAllUsers, deleteUser, getProfile, updateProfile, updateUserStatus, getStudentActivity, getStudentDeadlines } from '../controllers/user.controller';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/activity', authenticateToken, getStudentActivity);
router.get('/deadlines', authenticateToken, getStudentDeadlines);

router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);
router.put('/:id/status', authenticateToken, authorizeRoles('admin'), updateUserStatus);

export default router;
