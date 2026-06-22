const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheetController');
const { authenticate } = require('../middleware/auth');

router.post('/progress', authenticate, sheetController.toggleProblemStatus);
router.get('/progress', authenticate, sheetController.getSheetProgress);
router.get('/problems', authenticate, sheetController.getProblemsList);
router.get('/problems/:problemId', authenticate, sheetController.getProblemDetails);
router.post('/problems/run', authenticate, sheetController.runCode);
router.post('/problems/submit', authenticate, sheetController.submitCode);

module.exports = router;

