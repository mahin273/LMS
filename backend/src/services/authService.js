const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * Generate access and refresh tokens
 */
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpires }
    );

    const refreshToken = jwt.sign(
        { userId },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpires }
    );

    return { accessToken, refreshToken };
};

/**
 * Register a new user
 */
const register = async (userData) => {
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw ApiError.conflict('Email already registered');
    }

    // Create user
    const user = await User.create(userData);

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, tokens };
};

/**
 * Login user
 */
const login = async (email, password) => {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if instructor is approved
    if (user.role === 'instructor' && !user.isApproved) {
        throw ApiError.forbidden('Your instructor account is pending approval');
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Remove password from response
    user.password = undefined;

    return { user, tokens };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

        // Find user with matching refresh token
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        // Update refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return tokens;
    } catch (error) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }
};

/**
 * Logout user
 */
const logout = async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return true;
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    generateTokens,
};
