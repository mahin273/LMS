const { Submission, Assignment, Course, Enrollment } = require('../models');
const { fileService } = require('../services');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Submit assignment
 * @route   POST /api/assignments/:id/submit
 * @access  Enrolled Student
 */
exports.submitAssignment = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        throw ApiError.notFound('Assignment not found');
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: assignment.courseId,
    });

    if (!enrollment) {
        throw ApiError.forbidden('Must be enrolled to submit assignments');
    }

    // Check if file uploaded
    if (!req.file) {
        throw ApiError.badRequest('Submission file is required');
    }

    // Check due date
    if (assignment.dueDate && new Date() > assignment.dueDate) {
        throw ApiError.badRequest('Assignment submission deadline has passed');
    }

    // Check if already submitted
    let submission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user._id,
    });

    if (submission) {
        // Update existing submission
        if (submission.status === 'graded') {
            throw ApiError.badRequest('Cannot update a graded submission');
        }

        // Delete old file
        if (submission.fileUrl) {
            await fileService.deleteFile(submission.fileUrl);
        }

        submission.fileUrl = fileService.getFileUrl(req.file.path);
        submission.fileName = req.file.originalname;
        submission.submittedAt = new Date();
        await submission.save();
    } else {
        // Create new submission
        submission = await Submission.create({
            assignmentId: assignment._id,
            studentId: req.user._id,
            fileUrl: fileService.getFileUrl(req.file.path),
            fileName: req.file.originalname,
        });
    }

    res.status(201).json({
        success: true,
        data: { submission },
        message: 'Assignment submitted successfully',
    });
});

/**
 * @desc    Get submissions for an assignment (Instructor)
 * @route   GET /api/assignments/:id/submissions
 * @access  Instructor (course owner)
 */
exports.getSubmissions = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        throw ApiError.notFound('Assignment not found');
    }

    const course = await Course.findById(assignment.courseId);

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to view submissions');
    }

    const submissions = await Submission.find({ assignmentId: assignment._id })
        .populate('studentId', 'name email avatar')
        .sort({ submittedAt: -1 });

    // Stats
    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        graded: submissions.filter(s => s.status === 'graded').length,
        averageGrade: 0,
    };

    const gradedSubmissions = submissions.filter(s => s.status === 'graded' && s.grade !== null);
    if (gradedSubmissions.length > 0) {
        stats.averageGrade = Math.round(
            gradedSubmissions.reduce((acc, s) => acc + s.grade, 0) / gradedSubmissions.length
        );
    }

    res.json({
        success: true,
        data: { submissions, stats },
    });
});

/**
 * @desc    Get single submission
 * @route   GET /api/submissions/:id
 * @access  Owner / Instructor
 */
exports.getSubmission = asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id)
        .populate('studentId', 'name email avatar')
        .populate('gradedBy', 'name');

    if (!submission) {
        throw ApiError.notFound('Submission not found');
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    const course = await Course.findById(assignment.courseId);

    // Check access
    const isOwner = submission.studentId._id.toString() === req.user._id.toString();
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isInstructor && !isAdmin) {
        throw ApiError.forbidden('Not authorized to view this submission');
    }

    res.json({
        success: true,
        data: {
            submission,
            assignment: { _id: assignment._id, title: assignment.title },
            course: { _id: course._id, title: course.title },
        },
    });
});

/**
 * @desc    Grade submission
 * @route   PUT /api/submissions/:id/grade
 * @access  Instructor (course owner)
 */
exports.gradeSubmission = asyncHandler(async (req, res) => {
    const { grade, feedback } = req.body;

    let submission = await Submission.findById(req.params.id);

    if (!submission) {
        throw ApiError.notFound('Submission not found');
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    const course = await Course.findById(assignment.courseId);

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('Not authorized to grade submissions');
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    await submission.save();

    submission = await Submission.findById(req.params.id)
        .populate('studentId', 'name email avatar')
        .populate('gradedBy', 'name');

    res.json({
        success: true,
        data: { submission },
        message: 'Submission graded successfully',
    });
});

/**
 * @desc    Get my submissions
 * @route   GET /api/submissions/my
 * @access  Student
 */
exports.getMySubmissions = asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ studentId: req.user._id })
        .populate({
            path: 'assignmentId',
            select: 'title courseId dueDate',
            populate: { path: 'courseId', select: 'title' },
        })
        .sort({ submittedAt: -1 });

    res.json({
        success: true,
        data: { submissions },
    });
});
