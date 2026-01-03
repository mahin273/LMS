
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { getAllUsers, deleteUser } from '../controllers/user.controller';

const router = Router();

router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);

export default router;
