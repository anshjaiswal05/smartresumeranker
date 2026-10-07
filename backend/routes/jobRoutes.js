const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  getJobs,
  saveJob,
  getSavedJobs,
  removeSavedJob
} = require('../controllers/jobController');

router.get('/jobs', requireAuth, getJobs);
router.post('/jobs/save', requireAuth, saveJob);
router.get('/jobs/saved', requireAuth, getSavedJobs);
router.delete('/jobs/saved/:jobId', requireAuth, removeSavedJob);

module.exports = router;
