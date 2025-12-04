const { User, Enrollment, Badge } = require('../models');
const { badgeService } = require('../services');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    // Get enrollment count
    const enrollmentCount = await Enrollment.countDocuments({ userId: req.user._id });

    // Get badge stats
    const badgeStats = await badgeService.getBadgeStats(req.user._id);

    res.json({
        success: true,
        data: {
            user,
            stats: {
                enrolledCourses: enrollmentCount,
                badges: badgeStats,
            },
        },
    });
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
exports.updateMe = asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'avatar'];
    const updates = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: { user },
    });
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) {
        filter.role = req.query.role;
    }
    if (req.query.isApproved !== undefined) {
        filter.isApproved = req.query.isApproved === 'true';
    }

    const [users, total] = await Promise.all([
        User.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        User.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: {
            users,
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
 * @desc    Get pending instructor approvals
 * @route   GET /api/users/pending-approvals
 * @access  Admin
 */
exports.getPendingApprovals = asyncHandler(async (req, res) => {
    const users = await User.find({
        role: 'instructor',
        isApproved: false,
    }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: { users },
    });
});

/**
 * @desc    Approve instructor
 * @route   PUT /api/users/:id/approve
 * @access  Admin
 */
exports.approveUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    if (user.role !== 'instructor') {
        throw ApiError.badRequest('Only instructors can be approved');
    }

    user.isApproved = true;
    await user.save();

    res.json({
        success: true,
        data: { user },
        message: 'Instructor approved successfully',
    });
});

/**
 * @desc    Reject/disapprove instructor
 * @route   PUT /api/users/:id/reject
 * @access  Admin
 */
exports.rejectUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Delete the user or mark as rejected
    await User.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'User rejected and removed',
    });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
        throw ApiError.forbidden('Cannot delete admin users');
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'User deleted successfully',
    });
});

/**
 * @desc    Get user badges
 * @route   GET /api/users/me/badges
 * @access  Private
 */
exports.getMyBadges = asyncHandler(async (req, res) => {
    const badges = await badgeService.getUserBadges(req.user._id);
    const stats = await badgeService.getBadgeStats(req.user._id);

    res.json({
        success: true,
        data: { badges, stats },
    });
});
