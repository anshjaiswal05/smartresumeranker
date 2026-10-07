const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  startInterview,
  evaluateInterview,
  getInterviewHistory
} = require('../controllers/interviewController');

router.post('/interview/start', requireAuth, startInterview);
router.post('/interview/evaluate', requireAuth, evaluateInterview);
router.get('/interview/history', requireAuth, getInterviewHistory);

module.exports = router;
