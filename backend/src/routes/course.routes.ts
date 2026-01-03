import { Router } from 'express';
// import { } from '../controllers/course.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Public courses list
router.get('/', (req, res) => { res.json({ message: 'List courses' }) });

// Instructor only
router.post('/', authenticateToken, authorizeRoles('instructor'), (req, res) => { res.json({ message: 'Create course' }) });

export default router;
