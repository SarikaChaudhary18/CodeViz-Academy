const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');

router.post('/audit', authenticate, resumeController.auditResume);
router.get('/load', authenticate, resumeController.loadResume);
router.post('/save', authenticate, resumeController.saveResume);

module.exports = router;
