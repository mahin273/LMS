const { authService } = require('../services');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
    const { user, tokens } = await authService.register(req.body);

    res.status(201).json({
        success: true,
        data: { user, tokens },
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);

    res.json({
        success: true,
        data: { user, tokens },
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.json({
        success: true,
        data: { tokens },
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user._id);

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});
