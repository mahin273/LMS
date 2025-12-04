const express = require('express');
const router = express.Router();
const { courseController, lessonController, assignmentController } = require('../controllers');
const { auth, optionalAuth, isInstructor, isStudent, isAuthenticated } = require('../middlewares');
const validate = require('../middlewares/validate');
const { schemas } = require('../utils/validators');
const upload = require('../middlewares/upload');

// Public routes
router.get('/', optionalAuth, courseController.getAllCourses);
router.get('/enrolled', auth, isAuthenticated, courseController.getEnrolledCourses);
router.get('/teaching', auth, isInstructor, courseController.getTeachingCourses);
router.get('/:id', optionalAuth, courseController.getCourse);

// Course CRUD (Instructor)
router.post('/', auth, isInstructor, validate(schemas.createCourse), courseController.createCourse);
router.put('/:id', auth, isInstructor, validate(schemas.updateCourse), courseController.updateCourse);
router.delete('/:id', auth, isInstructor, courseController.deleteCourse);

// Enrollment (Student)
router.post('/:id/enroll', auth, isStudent, courseController.enrollCourse);
router.get('/:id/progress', auth, isAuthenticated, courseController.getCourseProgress);

// Lessons
router.get('/:courseId/lessons', auth, isAuthenticated, lessonController.getLessons);
router.post('/:courseId/lessons', auth, isInstructor, validate(schemas.createLesson), lessonController.createLesson);
router.put('/:courseId/lessons/reorder', auth, isInstructor, lessonController.reorderLessons);

// Assignments
router.get('/:courseId/assignments', auth, isAuthenticated, assignmentController.getAssignments);
router.post('/:courseId/assignments',
    auth,
    isInstructor,
    upload.single('attachment'),
    validate(schemas.createAssignment),
    assignmentController.createAssignment
);

module.exports = router;
