const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { getTechnologyRoles, runSkillGapAnalysis } = require('../controllers/skillController');

router.get('/skills/roles', requireAuth, getTechnologyRoles);
router.post('/skills/analyze', requireAuth, runSkillGapAnalysis);

module.exports = router;
