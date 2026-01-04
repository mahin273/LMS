import { Router } from 'express';
import { getAssignments, createAssignment, deleteAssignment, getSubmissions, gradeSubmission } from '../controllers/assignment.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// Mounted at /courses/:courseId/assignments
const assignmentRoutes = Router();

// /api/courses/:courseId/assignments
router.get('/', authenticateToken, authorizeRoles('instructor', 'admin', 'student'), getAssignments);
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), createAssignment);
router.get('/:id/submissions', authenticateToken, authorizeRoles('instructor', 'admin'), getSubmissions);

// /api/assignments
assignmentRoutes.delete('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), deleteAssignment);
assignmentRoutes.put('/submissions/:id/grade', authenticateToken, authorizeRoles('instructor', 'admin'), gradeSubmission);

export { router as courseAssignmentRoutes, assignmentRoutes };
