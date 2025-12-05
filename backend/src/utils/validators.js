const Joi = require('joi');

/**
 * Common validation patterns
 */
const patterns = {
    objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    password: Joi.string().min(8).max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        }),
};

/**
 * Validation schemas
 */
const schemas = {
    // Auth
    register: Joi.object({
        email: Joi.string().email().required(),
        password: patterns.password.required(),
        name: Joi.string().min(2).max(100).required(),
        role: Joi.string().valid('student', 'instructor').default('student'),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    // User
    updateUser: Joi.object({
        name: Joi.string().min(2).max(100),
        email: Joi.string().email(),
    }),

    // Course
    createCourse: Joi.object({
        title: Joi.string().min(3).max(200).required(),
        description: Joi.string().min(10).max(5000).required(),
        thumbnail: Joi.string().uri().allow(''),
        category: Joi.string().max(100),
        difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
    }),

    updateCourse: Joi.object({
        title: Joi.string().min(3).max(200),
        description: Joi.string().min(10).max(5000),
        thumbnail: Joi.string().uri().allow(''),
        category: Joi.string().max(100),
        difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
        status: Joi.string().valid('draft', 'published', 'archived'),
    }),

    // Lesson
    createLesson: Joi.object({
        title: Joi.string().min(3).max(200).required(),
        contentType: Joi.string().valid('video', 'pdf', 'text').required(),
        content: Joi.string().required(),
        order: Joi.number().integer().min(0),
        duration: Joi.number().integer().min(0),
    }),

    updateLesson: Joi.object({
        title: Joi.string().min(3).max(200),
        contentType: Joi.string().valid('video', 'pdf', 'text'),
        content: Joi.string(),
        order: Joi.number().integer().min(0),
        duration: Joi.number().integer().min(0),
    }),

    // Assignment
    createAssignment: Joi.object({
        title: Joi.string().min(3).max(200).required(),
        description: Joi.string().min(10).max(5000).required(),
        dueDate: Joi.date().iso().greater('now'),
    }),

    // Submission grading
    gradeSubmission: Joi.object({
        grade: Joi.number().integer().min(0).max(100).required(),
        feedback: Joi.string().max(2000).allow(''),
    }),

    // Pagination
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    }),

    // Object ID param
    objectId: Joi.object({
        id: patterns.objectId.required(),
    }),
};

module.exports = { schemas, patterns };
