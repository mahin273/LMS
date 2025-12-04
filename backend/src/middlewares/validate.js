const ApiError = require('../utils/ApiError');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema
 * @param {string} property - Request property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const messages = error.details.map(detail => detail.message);
            throw ApiError.badRequest('Validation failed', messages);
        }

        // Replace with validated/sanitized values
        req[property] = value;
        next();
    };
};

module.exports = validate;
