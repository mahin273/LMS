import { Router } from 'express';
import { completeLesson, updateLesson, deleteLesson } from '../controllers/lesson.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();


router.put('/:lessonId', authenticateToken, authorizeRoles('instructor', 'admin'), updateLesson);
router.delete('/:lessonId', authenticateToken, authorizeRoles('instructor', 'admin'), deleteLesson);

router.post('/:lessonId/complete', authenticateToken, completeLesson);

export default router;
