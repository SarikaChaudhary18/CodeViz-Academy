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
router.post('/translate-layout', authenticate, roadmapController.translateLayout);
router.post('/mentor-query', authenticate, roadmapController.mentorQuery);
router.post('/generate-career-plan', authenticate, roadmapController.generateCareerPlan);

module.exports = router;
