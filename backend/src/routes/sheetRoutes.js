const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheetController');
const { authenticate } = require('../middleware/auth');

router.post('/progress', authenticate, sheetController.toggleProblemStatus);
router.get('/progress', authenticate, sheetController.getSheetProgress);

module.exports = router;
