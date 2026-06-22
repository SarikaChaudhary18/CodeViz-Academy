const aiService = require('../utils/aiService');
const logger = require('../config/logger');

exports.chat = async (req, res, next) => {
  try {
    const { prompt, image, mimeType } = req.body;

    if (!prompt) {
      return res.status(400).json({
        status: 'fail',
        message: 'Prompt is required.'
      });
    }

    let responseText = '';
    
    // Check if image data is present
    if (image) {
      // Strip off the prefix if it's a data URL, e.g., "data:image/png;base64,"
      const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
      responseText = await aiService.generateCopilotResponse(prompt, base64Data, mimeType);
    } else {
      responseText = await aiService.generateCopilotResponse(prompt);
    }

    res.status(200).json({
      status: 'success',
      data: {
        response: responseText,
        quotaUsed: req.user.aiUsageToday
      }
    });

  } catch (err) {
    logger.error(`Copilot Controller error: ${err.message}`);
    res.status(500).json({
      status: 'error',
      message: err.message || 'AI Copilot failed to process the request.'
    });
  }
};
