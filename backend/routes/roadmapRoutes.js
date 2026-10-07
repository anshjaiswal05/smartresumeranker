const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  listRoadmaps,
  getRoadmapDetails,
  saveRoadmapProgress,
  getRoadmapProgress
} = require('../controllers/roadmapController');

router.get('/roadmaps', requireAuth, listRoadmaps);
router.get('/roadmaps/:role', requireAuth, getRoadmapDetails);
router.post('/roadmaps/progress', requireAuth, saveRoadmapProgress);
router.get('/roadmaps/progress/:role', requireAuth, getRoadmapProgress);

module.exports = router;
