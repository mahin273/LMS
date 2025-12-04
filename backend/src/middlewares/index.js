const { auth, optionalAuth } = require('./auth');
const { roleCheck, isStudent, isInstructor, isAdmin, isInstructorOrAdmin, isAuthenticated } = require('./roleCheck');
const validate = require('./validate');
const errorHandler = require('./errorHandler');
const upload = require('./upload');

module.exports = {
    auth,
    optionalAuth,
    roleCheck,
    isStudent,
    isInstructor,
    isAdmin,
    isInstructorOrAdmin,
    isAuthenticated,
    validate,
    errorHandler,
    upload,
};
