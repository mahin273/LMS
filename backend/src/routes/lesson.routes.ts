import { Router } from 'express';
import { getLessons, createLesson, completeLesson, updateLesson, deleteLesson } from '../controllers/lesson.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true }); // Enable access to parent params check (courseId) if needed

// Routes
// Note: We might structure routes as /courses/:courseId/lessons
// or flat /lessons/:lessonId

// Let's use nested structure in index.ts for creation, but completion can be flat.

router.get('/:courseId/lessons', authenticateToken, getLessons);
router.post('/:courseId/lessons', authenticateToken, authorizeRoles('instructor'), createLesson);
router.put('/lessons/:lessonId', authenticateToken, authorizeRoles('instructor', 'admin'), updateLesson);
router.delete('/lessons/:lessonId', authenticateToken, authorizeRoles('instructor', 'admin'), deleteLesson);

// Progress route
router.post('/lessons/:lessonId/complete', authenticateToken, completeLesson);

export default router;
