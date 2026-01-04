import { Router } from 'express';
import {
    getPublicCourses,
    getEnrolledCourses,
    getInstructorCourses,
    createCourse,
    enrollCourse,
    deleteCourse,
    updateCourse,
    getCourseAnalytics
} from '../controllers/course.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getPublicCourses);

// Student
router.get('/enrolled', authenticateToken, authorizeRoles('student'), getEnrolledCourses);
router.post('/:courseId/enroll', authenticateToken, authorizeRoles('student'), enrollCourse);

// Instructor
router.get('/instructor', authenticateToken, authorizeRoles('instructor'), getInstructorCourses);
router.post('/', authenticateToken, authorizeRoles('instructor'), createCourse);
router.put('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), updateCourse);
router.get('/:id/analytics', authenticateToken, authorizeRoles('instructor', 'admin'), getCourseAnalytics);

// Admin/Instructor
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'instructor'), deleteCourse);

export default router;
