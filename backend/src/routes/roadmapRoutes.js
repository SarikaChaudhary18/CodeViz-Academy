const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { authenticate } = require('../middleware/auth');

// List and playlist endpoints
router.get('/', authenticate, roadmapController.getRoadmapsList);
router.get('/playlist-metadata', authenticate, roadmapController.getPlaylistMetadata);

// Search & Bookmark endpoints (placed before /:roadmapId to prevent route param hijacking)
router.get('/search', authenticate, roadmapController.searchRoadmaps);
router.get('/bookmarks', authenticate, roadmapController.getBookmarks);
router.post('/bookmark', authenticate, roadmapController.bookmarkRoadmap);

// Progress endpoints
router.get('/progress', authenticate, roadmapController.getRoadmapProgress);
router.patch('/progress', authenticate, roadmapController.updateProgress);

// Mobile translations & AI helpers
router.post('/translate-layout', authenticate, roadmapController.translateLayout);
router.post('/mentor-query', authenticate, roadmapController.mentorQuery);
router.post('/generate-career-plan', authenticate, roadmapController.generateCareerPlan);

// Dynamic dynamic/quiz sub-details
router.get('/:roadmapId/node/:nodeIndex/quiz', authenticate, roadmapController.getNodeQuiz);

// Sub-resource endpoints
router.get('/:roadmapId/resources', authenticate, roadmapController.getRoadmapResources);
router.get('/:roadmapId/documentation', authenticate, roadmapController.getRoadmapDocumentation);
router.get('/:roadmapId/graph', authenticate, roadmapController.getRoadmapGraph);
router.get('/:roadmapId/recommendations', authenticate, roadmapController.getRoadmapRecommendations);
router.get('/:roadmapId/stats', authenticate, roadmapController.getRoadmapStats);

// Main roadmap details endpoint (placed at bottom)
router.get('/:roadmapId', authenticate, roadmapController.getRoadmapDetails);
router.post('/submit-capstone', authenticate, roadmapController.submitCapstone);

module.exports = router;
