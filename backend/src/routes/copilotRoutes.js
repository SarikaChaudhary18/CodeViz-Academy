const express = require('express');
const router = express.Router();
const copilotController = require('../controllers/copilotController');
const { authenticate } = require('../middleware/auth');
const checkAiQuota = require('../middleware/aiQuotaMiddleware');

router.post('/chat', authenticate, checkAiQuota, copilotController.chat);

module.exports = router;
