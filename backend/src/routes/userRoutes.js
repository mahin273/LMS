const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { auth, isAdmin, isAuthenticated } = require('../middlewares');

// Protected routes
router.get('/me', auth, isAuthenticated, userController.getMe);
router.put('/me', auth, isAuthenticated, userController.updateMe);
router.get('/me/badges', auth, isAuthenticated, userController.getMyBadges);

// Admin routes
router.get('/', auth, isAdmin, userController.getAllUsers);
router.get('/pending-approvals', auth, isAdmin, userController.getPendingApprovals);
router.put('/:id/approve', auth, isAdmin, userController.approveUser);
router.put('/:id/reject', auth, isAdmin, userController.rejectUser);
router.delete('/:id', auth, isAdmin, userController.deleteUser);

module.exports = router;
