import { Router } from 'express';
import { getAssignments, createAssignment, deleteAssignment, getSubmissions, gradeSubmission, submitAssignment } from '../controllers/assignment.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// Mounted at /courses/:courseId/assignments
const assignmentRoutes = Router();

// /api/courses/:courseId/assignments
// /api/courses/:courseId/assignments
router.get('/:courseId/assignments', authenticateToken, authorizeRoles('instructor', 'student', 'admin'), getAssignments);
router.post('/:courseId/assignments', authenticateToken, authorizeRoles('instructor', 'admin'), createAssignment);
// Note: These nested routes might be better mounted separately if we don't need courseId in controller, 
// but for consistency with frontend calls:
router.get('/:courseId/assignments/:id/submissions', authenticateToken, authorizeRoles('instructor', 'admin'), getSubmissions);
router.post('/:courseId/assignments/:id/submit', authenticateToken, authorizeRoles('student'), submitAssignment);

// /api/assignments
assignmentRoutes.delete('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), deleteAssignment);
assignmentRoutes.put('/submissions/:id/grade', authenticateToken, authorizeRoles('instructor', 'admin'), gradeSubmission);

export { router as courseAssignmentRoutes, assignmentRoutes };
