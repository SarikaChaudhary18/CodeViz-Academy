const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');

router.post('/audit', authenticate, resumeController.auditResume);

module.exports = router;
