const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { handleRecruiterOutreach } = require('../controllers/aiController');

router.post('/recruiter-outreach', requireAuth, handleRecruiterOutreach);

module.exports = router;
