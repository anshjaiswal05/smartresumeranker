const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { handleCoverLetter, handleRecruiterOutreach } = require('../controllers/aiController');

// AI Cover Letter and Recruiter Outreach
router.post('/ai/cover-letter', requireAuth, handleCoverLetter);
router.post('/ai/recruiter-outreach', requireAuth, handleRecruiterOutreach);

// Direct alias routes matching Section 28
router.post('/cover-letter', requireAuth, handleCoverLetter);
router.post('/recruiter-outreach', requireAuth, handleRecruiterOutreach);

module.exports = router;
