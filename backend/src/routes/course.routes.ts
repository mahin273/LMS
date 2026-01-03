import { Router } from 'express';
import {
    getPublicCourses,
    getEnrolledCourses,
    getInstructorCourses,
    createCourse,
    enrollCourse
} from '../controllers/course.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getPublicCourses);

// Student
router.get('/enrolled', authenticateToken, getEnrolledCourses);
router.post('/:courseId/enroll', authenticateToken, enrollCourse);

// Instructor
router.get('/managed', authenticateToken, authorizeRoles('instructor'), getInstructorCourses);
router.post('/', authenticateToken, authorizeRoles('instructor'), createCourse);

export default router;
