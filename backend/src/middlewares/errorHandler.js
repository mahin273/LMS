const ApiError = require('../utils/ApiError');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = ApiError.badRequest('Invalid ID format');
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = ApiError.conflict(`${field} already exists`);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        error = ApiError.badRequest('Validation failed', messages);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = ApiError.unauthorized('Token expired');
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = ApiError.badRequest('File too large');
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = ApiError.badRequest('Unexpected file field');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(error.errors && { details: error.errors }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

module.exports = errorHandler;
