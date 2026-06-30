const ForgettingPrediction = require('../models/ForgettingPrediction');
const logger = require('../config/logger');

exports.getPredictions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await ForgettingPrediction.find({ userId });
    
    const now = new Date();
    const formatted = items.map(item => {
      const daysSince = Math.max(0, (now - new Date(item.lastReviewed)) / (1000 * 60 * 60 * 24));
      
      // Ebbinghaus formula: R = 100 * e^(-t/S) where S is interval (half life indicator)
      const currentRetention = Math.max(0, Math.round(100 * Math.exp(-daysSince / Math.max(1, item.interval))));
      
      let status = "Stable Retention";
      let action = "Concepts are firmly indexed in cognitive stack.";
      
      if (currentRetention < 40) {
        status = "Critical Decay";
        action = `Review ${item.topicName} parameters immediately to prevent complete context loss.`;
      } else if (currentRetention < 80) {
        status = "Muted Decay";
        action = `Refresh ${item.topicName} schemas to boost retention index.`;
      }

      return {
        id: item._id,
        topicName: item.topicName,
        studiedDaysAgo: Math.round(daysSince),
        initialRetention: 100,
        currentRetention,
        status,
        reviewAction: action,
        interval: item.interval
      };
    });

    res.status(200).json({
      status: 'success',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};

exports.boostTopic = async (req, res, next) => {
  try {
    const { topicId } = req.body;
    const userId = req.user.id;

    const item = await ForgettingPrediction.findOne({ _id: topicId, userId });
    if (!item) {
      return res.status(404).json({ status: 'fail', message: 'Topic tracker not found.' });
    }

    // SM-2 Spaced Repetition logic implementation
    const prevRepetitions = item.repetitions || 1;
    item.repetitions = prevRepetitions + 1;
    
    // Scale intervals
    if (item.repetitions === 1) {
      item.interval = 1;
    } else if (item.repetitions === 2) {
      item.interval = 3;
    } else if (item.repetitions === 3) {
      item.interval = 7;
    } else if (item.repetitions === 4) {
      item.interval = 15;
    } else {
      item.interval = Math.round(item.interval * (item.easeFactor || 2.5));
    }

    item.lastReviewed = new Date();
    await item.save();

    logger.info(`Spaced repetition decay interval boosted for topic ${item.topicName}. New interval: ${item.interval} days.`);

    res.status(200).json({
      status: 'success',
      message: 'Topic boosted successfully.',
      data: item
    });
  } catch (err) {
    next(err);
  }
};
