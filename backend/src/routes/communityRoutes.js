const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, communityController.createCommunity);
router.get('/', authenticate, communityController.getCommunities);
router.post('/:id/join', authenticate, communityController.joinCommunity);
router.get('/:id/messages', authenticate, communityController.getMessageHistory);

module.exports = router;
