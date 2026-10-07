const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { verifyUser, getUserProfile, updateUserProfile } = require('../controllers/userController');

// Verification endpoint for Google Sign Up / Login flows
router.post('/auth/verify', requireAuth, verifyUser);

// Profile management
router.get('/user/profile', requireAuth, getUserProfile);
router.put('/user/profile', requireAuth, updateUserProfile);

module.exports = router;
