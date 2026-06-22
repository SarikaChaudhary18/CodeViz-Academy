const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');
const checkAiQuota = require('../middleware/aiQuotaMiddleware');

router.post('/audit', authenticate, checkAiQuota, resumeController.auditResume);
router.get('/load', authenticate, resumeController.loadResume);
router.post('/save', authenticate, resumeController.saveResume);

module.exports = router;
