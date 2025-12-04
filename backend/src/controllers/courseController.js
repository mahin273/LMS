const { Course, Enrollment, Lesson, Progress } = require('../models');
const { progressService, badgeService } = require('../services');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all published courses
 * @route   GET /api/courses
 * @access  Public
 */
exports.getAllCourses = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };

    // Search
    if (req.query.search) {
        filter.$text = { $search: req.query.search };
    }

    // Category filter
    if (req.query.category) {
        filter.category = req.query.category;
    }

    // Difficulty filter
    if (req.query.difficulty) {
        filter.difficulty = req.query.difficulty;
    }

    const [courses, total] = await Promise.all([
        Course.find(filter)
            .populate('instructor', 'name avatar')
            .populate('lessonsCount')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        Course.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: {
            courses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        },
    });
});

/**
 * @desc    Get single course
 * @route   GET /api/courses/:id
 * @access  Public
 */
exports.getCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'name avatar')
        .populate('lessonsCount');

    if (!course) {
        throw ApiError.notFound('Course not found');
    }

    // Get lessons (basic info only for non-enrolled)
    const lessons = await Lesson.find({ courseId: course._id })
        .select('title order duration contentType isFree')
        .sort({ order: 1 });

    // Check if user is enrolled
    let isEnrolled = false;
    let progress = null;
    let badges = [];

    if (req.user) {
        const enrollment = await Enrollment.findOne({
            userId: req.user._id,
            courseId: course._id,
        });
        isEnrolled = !!enrollment;

        if (isEnrolled) {
            progress = await progressService.getProgress(req.user._id, course._id);
            badges = await badgeService.getCourseBadges(req.user._id, course._id);
        }
    }

    res.json({
        success: true,
        data: {
            course,
            lessons,
            isEnrolled,
            progress,
            badges,
        },
    });
});

/**
 * @desc    Create course
 * @route   POST /api/courses
 * @access  Instructor
 */
exports.createCourse = asyncHandler(async (req, res) => {
    const course = await Course.create({
        ...req.body,
        instructor: req.user._id,
    });

    res.status(201).json({
        success: true,
        data: { course },
    });
});

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Instructor (owner)
 */
exports.updateCourse = asyncHandler(async (req, res) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        throw ApiError.notFound('Course not found');
    }

    // Check ownership (admin can edit any)
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to update this course');
    }

    course = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('instructor', 'name avatar');

    res.json({
        success: true,
        data: { course },
    });
});

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Instructor (owner) / Admin
 */
exports.deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        throw ApiError.notFound('Course not found');
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to delete this course');
    }

    await Course.findByIdAndDelete(req.params.id);

    // Also delete related data
    await Promise.all([
        Lesson.deleteMany({ courseId: req.params.id }),
        Enrollment.deleteMany({ courseId: req.params.id }),
        Progress.deleteMany({ courseId: req.params.id }),
    ]);

    res.json({
        success: true,
        message: 'Course deleted successfully',
    });
});

/**
 * @desc    Enroll in course
 * @route   POST /api/courses/:id/enroll
 * @access  Student
 */
exports.enrollCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        throw ApiError.notFound('Course not found');
    }

    if (course.status !== 'published') {
        throw ApiError.badRequest('Cannot enroll in unpublished course');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: course._id,
    });

    if (existingEnrollment) {
        throw ApiError.conflict('Already enrolled in this course');
    }

    const enrollment = await Enrollment.create({
        userId: req.user._id,
        courseId: course._id,
    });

    // Initialize progress
    await progressService.getOrCreateProgress(req.user._id, course._id);

    res.status(201).json({
        success: true,
        data: { enrollment },
        message: 'Successfully enrolled in course',
    });
});

/**
 * @desc    Get user's enrolled courses
 * @route   GET /api/courses/enrolled
 * @access  Private
 */
exports.getEnrolledCourses = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ userId: req.user._id })
        .populate({
            path: 'courseId',
            populate: { path: 'instructor', select: 'name avatar' },
        })
        .sort({ enrolledAt: -1 });

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
            const progress = await progressService.getProgress(req.user._id, enrollment.courseId._id);
            const highestBadge = await badgeService.getHighestBadge(req.user._id, enrollment.courseId._id);

            return {
                course: enrollment.courseId,
                enrolledAt: enrollment.enrolledAt,
                progress,
                highestBadge,
            };
        })
    );

    res.json({
        success: true,
        data: { courses: coursesWithProgress },
    });
});

/**
 * @desc    Get instructor's courses
 * @route   GET /api/courses/teaching
 * @access  Instructor
 */
exports.getTeachingCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ instructor: req.user._id })
        .populate('lessonsCount')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: { courses },
    });
});

/**
 * @desc    Get course progress
 * @route   GET /api/courses/:id/progress
 * @access  Enrolled Student
 */
exports.getCourseProgress = asyncHandler(async (req, res) => {
    const progress = await progressService.getProgress(req.user._id, req.params.id);
    const badges = await badgeService.getCourseBadges(req.user._id, req.params.id);

    res.json({
        success: true,
        data: { progress, badges },
    });
});
