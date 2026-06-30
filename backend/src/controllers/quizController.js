const Quiz = require('../models/Quiz');
const QuizProgress = require('../models/QuizProgress');
const ForgettingPrediction = require('../models/ForgettingPrediction');
const User = require('../models/User');
const logger = require('../config/logger');

exports.getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({}).select('-questions');
    
    const quizzesWithProgress = await Promise.all(quizzes.map(async (quiz) => {
      const bestProgress = await QuizProgress.findOne({
        userId: req.user.id,
        quizId: quiz._id
      }).sort({ score: -1 });

      return {
        id: quiz._id,
        title: quiz.title,
        topic: quiz.topic,
        questionsCount: quiz.questionsCount,
        difficulty: quiz.difficulty,
        bestScore: bestProgress ? bestProgress.score : null
      };
    }));

    res.status(200).json({
      status: 'success',
      data: quizzesWithProgress
    });
  } catch (err) {
    next(err);
  }
};

exports.getQuizQuestions = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ status: 'fail', message: 'Quiz not found.' });
    }

    // Shuffle and pick a pool of 10 questions
    const shuffled = [...quiz.questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    res.status(200).json({
      status: 'success',
      data: {
        id: quiz._id,
        title: quiz.title,
        topic: quiz.topic,
        questions: selected
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.submitQuizResults = async (req, res, next) => {
  try {
    const { score, totalQuestions } = req.body;
    const quizId = req.params.id;
    const userId = req.user.id;

    if (score === undefined || !totalQuestions) {
      return res.status(400).json({ status: 'fail', message: 'Score and totalQuestions are required.' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ status: 'fail', message: 'Quiz not found.' });
    }

    // Save progress log
    const progress = await QuizProgress.create({
      userId,
      quizId,
      score,
      totalQuestions
    });

    // Reward XP: 25 XP per correct answer + 50 bonus for perfect score
    let xpGained = score * 25;
    if (score === totalQuestions) {
      xpGained += 50;
    }

    const user = await User.findById(userId);
    if (user) {
      user.xp += xpGained;
      user.level = Math.floor(user.xp / 1000) + 1;
      await user.save();
    }

    // Log a spaced repetition entry for cognitive review based on this quiz topic
    try {
      await ForgettingPrediction.findOneAndUpdate(
        { userId, topicName: quiz.title },
        {
          lastReviewed: new Date(),
          interval: 1, // Reset interval to 1 day review
          easeFactor: 2.5,
          repetitions: 1
        },
        { upsert: true, new: true }
      );
      logger.info(`Spaced repetition topic logged: ${quiz.title} for user ${userId}`);
    } catch (srepErr) {
      logger.error('Failed to log spaced repetition checklist: %s', srepErr.message);
    }

    res.status(200).json({
      status: 'success',
      data: progress,
      xpGained,
      userXp: user?.xp,
      userLevel: user?.level
    });
  } catch (err) {
    next(err);
  }
};
