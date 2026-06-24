const express = require('express');
const router = express.Router();
const companyPrepController = require('../controllers/companyPrepController');
const { authenticate } = require('../middleware/auth');

router.get('/questions', authenticate, companyPrepController.getQuestionsList);
router.get('/progress', authenticate, companyPrepController.getProgress);
router.post('/toggle-complete', authenticate, companyPrepController.toggleComplete);
router.post('/toggle-star', authenticate, companyPrepController.toggleStar);
router.post('/questions/run', authenticate, companyPrepController.runCode);
router.post('/questions/submit', authenticate, companyPrepController.submitCode);
router.get('/questions/:questionId', authenticate, companyPrepController.getQuestionDetails);

module.exports = router;
