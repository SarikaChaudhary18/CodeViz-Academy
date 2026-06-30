const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const checkAiQuota = require('../middleware/aiQuotaMiddleware');

router.post('/tool', authenticate, checkAiQuota, aiController.processAiTool);

module.exports = router;
