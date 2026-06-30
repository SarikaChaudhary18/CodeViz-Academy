const express = require('express');
const router = express.Router();
const forgettingController = require('../controllers/forgettingController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, forgettingController.getPredictions);
router.post('/boost', authenticate, forgettingController.boostTopic);

module.exports = router;
