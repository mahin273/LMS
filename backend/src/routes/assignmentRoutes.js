const express = require('express');
const router = express.Router();
const { assignmentController, submissionController } = require('../controllers');
const { auth, isInstructor, isStudent, isAuthenticated } = require('../middlewares');
const validate = require('../middlewares/validate');
const { schemas } = require('../utils/validators');
const upload = require('../middlewares/upload');

// Assignment routes
router.get('/:id', auth, isAuthenticated, assignmentController.getAssignment);
router.put('/:id', auth, isInstructor, upload.single('attachment'), assignmentController.updateAssignment);
router.delete('/:id', auth, isInstructor, assignmentController.deleteAssignment);

// Submissions
router.post('/:id/submit', auth, isStudent, upload.single('file'), submissionController.submitAssignment);
router.get('/:id/submissions', auth, isInstructor, submissionController.getSubmissions);

module.exports = router;
