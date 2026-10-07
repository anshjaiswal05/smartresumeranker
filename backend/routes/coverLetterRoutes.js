const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { handleCoverLetter } = require('../controllers/aiController');

router.post('/cover-letter', requireAuth, handleCoverLetter);

module.exports = router;
