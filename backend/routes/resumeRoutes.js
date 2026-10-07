const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');
const { uploadAndAnalyzeResume, getLatestResume } = require('../controllers/resumeController');

// Upload resume & run ATS analysis (temporarily processed, deleted immediately)
router.post('/resume/analyze', requireAuth, uploadResume, uploadAndAnalyzeResume);

// Get latest structured resume analysis
router.get('/resume/latest', requireAuth, getLatestResume);

module.exports = router;
