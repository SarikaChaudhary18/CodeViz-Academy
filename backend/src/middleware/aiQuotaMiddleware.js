const User = require('../models/User');
const logger = require('../config/logger');

const checkAiQuota = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found.'
      });
    }

    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const limit = parseInt(process.env.DAILY_AI_LIMIT, 10) || 5;

    // Reset quota if last request date is not today
    if (user.lastAiRequestDate !== todayStr) {
      user.aiUsageToday = 0;
      user.lastAiRequestDate = todayStr;
    }

    // Check limit
    if (user.aiUsageToday >= limit) {
      logger.warn(`AI Quota Exceeded: User ${user.username} (${userId}) reached daily limit of ${limit}`);
      return res.status(429).json({
        status: 'fail',
        message: `Daily AI limit reached. You can only perform ${limit} AI operations per day. Please try again tomorrow.`
      });
    }

    // Increment and save quota use
    user.aiUsageToday += 1;
    await user.save();
    
    logger.info(`AI Quota: User ${user.username} consumed quota ${user.aiUsageToday}/${limit}`);
    next();
  } catch (err) {
    logger.error(`AI Quota Middleware error: ${err.message}`);
    next(err);
  }
};

module.exports = checkAiQuota;
