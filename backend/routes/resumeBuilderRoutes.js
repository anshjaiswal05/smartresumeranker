const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  saveResumeBuilderDocument,
  getResumeBuilderDocument
} = require('../controllers/resumeBuilderController');

router.post('/resume-builder/save', requireAuth, saveResumeBuilderDocument);
router.get('/resume-builder', requireAuth, getResumeBuilderDocument);

module.exports = router;
