const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, quizController.getQuizzes);
router.get('/:id/questions', authenticate, quizController.getQuizQuestions);
router.post('/:id/submit', authenticate, quizController.submitQuizResults);

module.exports = router;
