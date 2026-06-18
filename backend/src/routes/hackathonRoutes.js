const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, hackathonController.getHackathons);

module.exports = router;
