import { Router } from 'express';
import {
    getPublicCourses,
    getEnrolledCourses,
    getInstructorCourses,
    createCourse,
    enrollCourse,
    deleteCourse
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

// Admin/Instructor
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'instructor'), deleteCourse);

export default router;
