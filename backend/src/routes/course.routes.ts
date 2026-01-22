import { Router } from 'express';
import {
    getPublicCourses,
    getEnrolledCourses,
    getInstructorCourses,
    createCourse,
    enrollCourse,
    unenrollCourse,
    rateCourse,
    deleteCourse,
    updateCourse,
    getCourseAnalytics,
    updateCourseStatus,
    submitCourse,
    getInstructorStats,
    getCourseById,
    getAllCoursesAdmin,
    bulkCourseAction
} from '../controllers/course.controller';
import { getLessons, createLesson } from '../controllers/lesson.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getPublicCourses);

// Student
router.get('/enrolled', authenticateToken, authorizeRoles('student'), getEnrolledCourses);
router.post('/:courseId/enroll', authenticateToken, authorizeRoles('student'), enrollCourse);
router.delete('/:courseId/enroll', authenticateToken, authorizeRoles('student'), unenrollCourse);
router.post('/:courseId/rate', authenticateToken, authorizeRoles('student'), rateCourse);



// Instructor
router.get('/instructor/stats', authenticateToken, authorizeRoles('instructor'), getInstructorStats);
router.get('/instructor', authenticateToken, authorizeRoles('instructor'), getInstructorCourses);
router.post('/', authenticateToken, authorizeRoles('instructor'), createCourse);
router.put('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), updateCourse);
router.get('/:id/analytics', authenticateToken, authorizeRoles('instructor', 'admin'), getCourseAnalytics);

// Course Lessons
router.get('/:courseId/lessons', authenticateToken, getLessons);
router.post('/:courseId/lessons', authenticateToken, authorizeRoles('instructor'), createLesson);

// Admin
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), getAllCoursesAdmin);
router.post('/admin/bulk-action', authenticateToken, authorizeRoles('admin'), bulkCourseAction);
router.put('/:id/status', authenticateToken, authorizeRoles('admin'), updateCourseStatus);

// Instructor Actions
router.post('/:id/submit', authenticateToken, authorizeRoles('instructor'), submitCourse);

// Admin/Instructor
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'instructor'), deleteCourse);

// Public - Specific ID route (Must be last to avoid capturing specific paths like /instructor, /stats)
router.get('/:id', getCourseById as any);

export default router;
