const express = require('express');
const router = express.Router();
const { lessonController } = require('../controllers');
const { auth, isInstructor, isAuthenticated } = require('../middlewares');
const validate = require('../middlewares/validate');
const { schemas } = require('../utils/validators');

// Lesson routes
router.get('/:id', auth, isAuthenticated, lessonController.getLesson);
router.put('/:id', auth, isInstructor, validate(schemas.updateLesson), lessonController.updateLesson);
router.delete('/:id', auth, isInstructor, lessonController.deleteLesson);
router.post('/:id/complete', auth, isAuthenticated, lessonController.markComplete);

module.exports = router;
