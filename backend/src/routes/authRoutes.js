const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth } = require('../middlewares');
const validate = require('../middlewares/validate');
const { schemas } = require('../utils/validators');

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', auth, authController.logout);

module.exports = router;
