const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, roadmapController.getRoadmapsList);
router.get('/progress', authenticate, roadmapController.getRoadmapProgress);
router.get('/playlist-metadata', authenticate, roadmapController.getPlaylistMetadata);
router.get('/:roadmapId/node/:nodeIndex/quiz', authenticate, roadmapController.getNodeQuiz);
router.get('/:roadmapId', authenticate, roadmapController.getRoadmapDetails);
router.post('/submit-capstone', authenticate, roadmapController.submitCapstone);

module.exports = router;
