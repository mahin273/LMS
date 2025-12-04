const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

/**
 * Authentication middleware - verifies JWT access token
 */
const auth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.accessSecret);

        const user = await User.findById(decoded.userId).select('-password -refreshToken');

        if (!user) {
            throw ApiError.unauthorized('User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Access token expired');
        }
        throw ApiError.unauthorized('Invalid access token');
    }
});

/**
 * Optional auth - attaches user if token present, but doesn't require it
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, config.jwt.accessSecret);
            const user = await User.findById(decoded.userId).select('-password -refreshToken');
            if (user) {
                req.user = user;
            }
        } catch (error) {
            // Token invalid, but that's okay for optional auth
        }
    }

    next();
});

module.exports = { auth, optionalAuth };
