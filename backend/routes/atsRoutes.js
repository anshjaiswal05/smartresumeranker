const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { getLatestResume } = require('../controllers/resumeController');

router.get('/ats/status', requireAuth, getLatestResume);

module.exports = router;
