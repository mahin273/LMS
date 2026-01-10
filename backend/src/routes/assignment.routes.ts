import { Router } from 'express';
import { getAssignments, createAssignment, deleteAssignment, getSubmissions, gradeSubmission, submitAssignment } from '../controllers/assignment.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });


const assignmentRoutes = Router();

router.get('/:courseId/assignments', authenticateToken, authorizeRoles('instructor', 'student', 'admin'), getAssignments);
router.post('/:courseId/assignments', authenticateToken, authorizeRoles('instructor', 'admin'), createAssignment);

router.get('/:courseId/assignments/:id/submissions', authenticateToken, authorizeRoles('instructor', 'admin'), getSubmissions);
router.post('/:courseId/assignments/:id/submit', authenticateToken, authorizeRoles('student'), submitAssignment);

assignmentRoutes.delete('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), deleteAssignment);
assignmentRoutes.put('/submissions/:id/grade', authenticateToken, authorizeRoles('instructor', 'admin'), gradeSubmission);

export { router as courseAssignmentRoutes, assignmentRoutes };
