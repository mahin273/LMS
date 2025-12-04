const { Assignment, Submission, Course, Enrollment } = require('../models');
const { fileService } = require('../services');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get assignments for a course
 * @route   GET /api/courses/:courseId/assignments
 * @access  Enrolled / Instructor
 */
exports.getAssignments = asyncHandler(async (req, res) => {
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
            throw ApiError.forbidden('Must be enrolled to view assignments');
        }
    }

    const assignments = await Assignment.find({ courseId: course._id })
        .populate('submissionCount')
        .sort({ createdAt: -1 });

    // For students, include their submission status
    if (!isInstructor && !isAdmin) {
        const assignmentsWithStatus = await Promise.all(
            assignments.map(async (assignment) => {
                const submission = await Submission.findOne({
                    assignmentId: assignment._id,
                    studentId: req.user._id,
                }).select('status grade submittedAt');

                return {
                    ...assignment.toObject(),
                    mySubmission: submission,
                };
            })
        );

        return res.json({
            success: true,
            data: { assignments: assignmentsWithStatus },
        });
    }

    res.json({
        success: true,
        data: { assignments },
    });
});

/**
 * @desc    Get single assignment
 * @route   GET /api/assignments/:id
 * @access  Enrolled / Instructor
 */
exports.getAssignment = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id)
        .populate('submissionCount');

    if (!assignment) {
        throw ApiError.notFound('Assignment not found');
    }

    const course = await Course.findById(assignment.courseId);

    // Include submission for students
    let mySubmission = null;
    if (req.user.role === 'student') {
        mySubmission = await Submission.findOne({
            assignmentId: assignment._id,
            studentId: req.user._id,
        });
    }

    res.json({
        success: true,
        data: {
            assignment,
            course: { _id: course._id, title: course.title },
            mySubmission,
        },
    });
});

/**
 * @desc    Create assignment
 * @route   POST /api/courses/:courseId/assignments
 * @access  Instructor (owner)
 */
exports.createAssignment = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        throw ApiError.notFound('Course not found');
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to add assignments to this course');
    }

    let attachmentUrl = '';
    if (req.file) {
        attachmentUrl = fileService.getFileUrl(req.file.path);
    }

    const assignment = await Assignment.create({
        ...req.body,
        courseId: course._id,
        attachmentUrl,
    });

    res.status(201).json({
        success: true,
        data: { assignment },
    });
});

/**
 * @desc    Update assignment
 * @route   PUT /api/assignments/:id
 * @access  Instructor (owner)
 */
exports.updateAssignment = asyncHandler(async (req, res) => {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        throw ApiError.notFound('Assignment not found');
    }

    const course = await Course.findById(assignment.courseId);

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to update this assignment');
    }

    const updates = { ...req.body };

    if (req.file) {
        // Delete old file
        if (assignment.attachmentUrl) {
            await fileService.deleteFile(assignment.attachmentUrl);
        }
        updates.attachmentUrl = fileService.getFileUrl(req.file.path);
    }

    assignment = await Assignment.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: { assignment },
    });
});

/**
 * @desc    Delete assignment
 * @route   DELETE /api/assignments/:id
 * @access  Instructor (owner)
 */
exports.deleteAssignment = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        throw ApiError.notFound('Assignment not found');
    }

    const course = await Course.findById(assignment.courseId);

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to delete this assignment');
    }

    // Delete attachment
    if (assignment.attachmentUrl) {
        await fileService.deleteFile(assignment.attachmentUrl);
    }

    // Delete submissions
    const submissions = await Submission.find({ assignmentId: assignment._id });
    for (const sub of submissions) {
        if (sub.fileUrl) {
            await fileService.deleteFile(sub.fileUrl);
        }
    }
    await Submission.deleteMany({ assignmentId: assignment._id });

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'Assignment deleted successfully',
    });
});
