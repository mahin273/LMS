const express = require('express');
const router = express.Router();
const { submissionController } = require('../controllers');
const { auth, isInstructor, isStudent, isAuthenticated } = require('../middlewares');
const validate = require('../middlewares/validate');
const { schemas } = require('../utils/validators');

// Submission routes
router.get('/my', auth, isStudent, submissionController.getMySubmissions);
router.get('/:id', auth, isAuthenticated, submissionController.getSubmission);
router.put('/:id/grade', auth, isInstructor, validate(schemas.gradeSubmission), submissionController.gradeSubmission);

module.exports = router;
