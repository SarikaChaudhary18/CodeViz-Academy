const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, questController.getQuests);
router.post('/claim', authenticate, questController.claimQuestReward);

module.exports = router;
