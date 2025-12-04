const { Lesson, Course, Enrollment } = require('../models');
const { progressService } = require('../services');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get lessons for a course
 * @route   GET /api/courses/:courseId/lessons
 * @access  Enrolled / Instructor
 */
exports.getLessons = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        throw ApiError.notFound('Course not found');
    }

    // Check access
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
        const enrollment = await Enrollment.findOne({
            userId: req.user._id,
            courseId: course._id,
        });

        if (!enrollment) {
            throw ApiError.forbidden('Must be enrolled to view lessons');
        }
    }

    const lessons = await Lesson.find({ courseId: course._id })
        .sort({ order: 1 });

    // Get user progress
    const progress = await progressService.getProgress(req.user._id, course._id);

    res.json({
        success: true,
        data: {
            lessons,
            progress,
        },
    });
});

/**
 * @desc    Get single lesson
 * @route   GET /api/lessons/:id
 * @access  Enrolled / Instructor
 */
exports.getLesson = asyncHandler(async (req, res) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        throw ApiError.notFound('Lesson not found');
    }

    const course = await Course.findById(lesson.courseId);

    // Check access
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
        const enrollment = await Enrollment.findOne({
            userId: req.user._id,
            courseId: course._id,
        });

        if (!enrollment && !lesson.isFree) {
            throw ApiError.forbidden('Must be enrolled to view this lesson');
        }
    }

    // Get adjacent lessons for navigation
    const [prevLesson, nextLesson] = await Promise.all([
        Lesson.findOne({ courseId: lesson.courseId, order: { $lt: lesson.order } })
            .sort({ order: -1 })
            .select('_id title order'),
        Lesson.findOne({ courseId: lesson.courseId, order: { $gt: lesson.order } })
            .sort({ order: 1 })
            .select('_id title order'),
    ]);

    res.json({
        success: true,
        data: {
            lesson,
            course: { _id: course._id, title: course.title },
            navigation: { prev: prevLesson, next: nextLesson },
        },
    });
});

/**
 * @desc    Create lesson
 * @route   POST /api/courses/:courseId/lessons
 * @access  Instructor (owner)
 */
exports.createLesson = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        throw ApiError.notFound('Course not found');
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to add lessons to this course');
    }

    const lesson = await Lesson.create({
        ...req.body,
        courseId: course._id,
    });

    res.status(201).json({
        success: true,
        data: { lesson },
    });
});

/**
 * @desc    Update lesson
 * @route   PUT /api/lessons/:id
 * @access  Instructor (owner)
 */
exports.updateLesson = asyncHandler(async (req, res) => {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        throw ApiError.notFound('Lesson not found');
    }

    const course = await Course.findById(lesson.courseId);

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to update this lesson');
    }

    lesson = await Lesson.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: { lesson },
    });
});

/**
 * @desc    Delete lesson
 * @route   DELETE /api/lessons/:id
 * @access  Instructor (owner)
 */
exports.deleteLesson = asyncHandler(async (req, res) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        throw ApiError.notFound('Lesson not found');
    }

    const course = await Course.findById(lesson.courseId);

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to delete this lesson');
    }

    await Lesson.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'Lesson deleted successfully',
    });
});

/**
 * @desc    Mark lesson as complete
 * @route   POST /api/lessons/:id/complete
 * @access  Enrolled Student
 */
exports.markComplete = asyncHandler(async (req, res) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        throw ApiError.notFound('Lesson not found');
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: lesson.courseId,
    });

    if (!enrollment) {
        throw ApiError.forbidden('Must be enrolled to complete lessons');
    }

    // Mark complete and update progress
    const progress = await progressService.markLessonComplete(
        req.user._id,
        lesson.courseId,
        lesson._id
    );

    res.json({
        success: true,
        data: { progress },
        message: 'Lesson marked as complete',
    });
});

/**
 * @desc    Reorder lessons
 * @route   PUT /api/courses/:courseId/lessons/reorder
 * @access  Instructor (owner)
 */
exports.reorderLessons = asyncHandler(async (req, res) => {
    const { lessonOrder } = req.body; // Array of { lessonId, order }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
        throw ApiError.notFound('Course not found');
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to reorder lessons');
    }

    // Update order for each lesson
    await Promise.all(
        lessonOrder.map(({ lessonId, order }) =>
            Lesson.findByIdAndUpdate(lessonId, { order })
        )
    );

    const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });

    res.json({
        success: true,
        data: { lessons },
    });
});
