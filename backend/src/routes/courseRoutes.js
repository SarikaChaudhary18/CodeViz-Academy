const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');

router.get('/',              authenticate, courseController.getCourses);
router.get('/youtube/preview', authenticate, courseController.previewYoutube);
router.get('/:id',           authenticate, courseController.getCourseById);
router.post('/:id/track',    authenticate, courseController.trackVideoProgress);
router.post('/youtube/import', authenticate, courseController.importFromYoutube);

module.exports = router;
