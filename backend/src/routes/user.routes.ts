
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { getAllUsers, deleteUser, getProfile, updateProfile } from '../controllers/user.controller';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);

export default router;
