const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Role-based access control middleware
 * @param  {...string} roles - Allowed roles
 */
const roleCheck = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw ApiError.unauthorized('Authentication required');
        }

        if (!roles.includes(req.user.role)) {
            throw ApiError.forbidden(`Access denied. Required roles: ${roles.join(', ')}`);
        }

        // Check if instructor is approved
        if (req.user.role === config.roles.INSTRUCTOR && !req.user.isApproved) {
            throw ApiError.forbidden('Your instructor account is pending approval');
        }

        next();
    };
};

/**
 * Require student role
 */
const isStudent = roleCheck(config.roles.STUDENT);

/**
 * Require instructor role (approved)
 */
const isInstructor = roleCheck(config.roles.INSTRUCTOR);

/**
 * Require admin role
 */
const isAdmin = roleCheck(config.roles.ADMIN);

/**
 * Require instructor or admin
 */
const isInstructorOrAdmin = roleCheck(config.roles.INSTRUCTOR, config.roles.ADMIN);

/**
 * Any authenticated user
 */
const isAuthenticated = roleCheck(config.roles.STUDENT, config.roles.INSTRUCTOR, config.roles.ADMIN);

module.exports = {
    roleCheck,
    isStudent,
    isInstructor,
    isAdmin,
    isInstructorOrAdmin,
    isAuthenticated,
};
