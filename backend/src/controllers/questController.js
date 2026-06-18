const Quest = require('../models/Quest');
const User = require('../models/User');
const Activity = require('../models/Activity');
const logger = require('../config/logger');

exports.getQuests = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;

    let quests = await Quest.find(filter);

    // Seed default quests if none exist
    if (quests.length === 0) {
      quests = await Quest.create([
        {
          title: 'Daily Algorithms Practice',
          description: 'Solve 2 DSA questions on Leetcode or Codechef.',
          type: 'daily',
          xpReward: 100,
          targetValue: 2,
          key: 'solve_dsa_problems',
        },
        {
          title: 'Deep Focus Session',
          description: 'Study for 50 minutes in Focus Mode.',
          type: 'daily',
          xpReward: 150,
          targetValue: 50,
          key: 'study_pomodoro',
        },
        {
          title: 'Weekly Grind Master',
          description: 'Accumulate 250 focus minutes this week.',
          type: 'weekly',
          xpReward: 500,
          targetValue: 250,
          key: 'weekly_focus_total',
        }
      ]);
      logger.info('Default quests seeded in database.');
    }

    res.status(200).json({
      status: 'success',
      data: quests
    });
  } catch (err) {
    next(err);
  }
};

exports.claimQuestReward = async (req, res, next) => {
  try {
    const { questKey } = req.body;

    if (!questKey) {
      return res.status(400).json({ status: 'fail', message: 'Quest key is required.' });
    }

    const quest = await Quest.findOne({ key: questKey });
    if (!quest) {
      return res.status(404).json({ status: 'fail', message: 'Quest not found.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    // Verify user activity meets target before awarding
    const today = new Date().toISOString().split('T')[0];
    const activities = await Activity.find({
      userId: req.user.id,
      date: today
    });

    let currentProgress = 0;
    if (questKey === 'solve_dsa_problems') {
      const dsaLogs = activities.filter(a => a.type === 'dsa');
      currentProgress = dsaLogs.reduce((sum, current) => sum + current.value, 0);
    } else if (questKey === 'study_pomodoro') {
      const focusLogs = activities.filter(a => a.type === 'focus' || a.type === 'study');
      currentProgress = focusLogs.reduce((sum, current) => sum + current.value, 0);
    } else {
      // Direct validation fallback for custom quests
      currentProgress = quest.targetValue;
    }

    if (currentProgress < quest.targetValue) {
      return res.status(400).json({
        status: 'fail',
        message: `Requirement not met. Progress is ${currentProgress}/${quest.targetValue}`
      });
    }

    // Award XP
    const baseReward = quest.xpReward;
    const finalXp = baseReward * (user.streak >= 5 ? 1.5 : 1.0); // 1.5x streak multiplier
    user.xp += finalXp;
    user.level = Math.floor(user.xp / 1000) + 1;
    await user.save();

    logger.info(`Quest claimed: ${quest.title} by user ${user.username}. Awarded: ${finalXp} XP`);

    res.status(200).json({
      status: 'success',
      message: `Claimed ${finalXp} XP!`,
      data: {
        claimedXp: finalXp,
        userXp: user.xp,
        userLevel: user.level,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.logActivity = async (req, res, next) => {
  try {
    const { type, value } = req.body;
    if (!type || !value) {
      return res.status(400).json({ status: 'fail', message: 'Type and value are required.' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Calculate a small direct activity completion reward
    let xpGained = 0;
    if (type === 'focus' || type === 'study') {
      xpGained = Math.floor(value * 2); // 2 XP per minute
    } else if (type === 'dsa') {
      xpGained = 15; // 15 XP per solved problem
    }

    const activity = await Activity.create({
      userId: req.user.id,
      type,
      value: parseInt(value, 10),
      xpGained,
      date: today
    });

    // Award direct XP to the user
    const user = await User.findById(req.user.id);
    if (user) {
      user.xp += xpGained;
      user.level = Math.floor(user.xp / 1000) + 1;
      await user.save();
    }

    logger.info(`Activity logged: ${type} (${value}) by user ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      data: activity,
      userXp: user?.xp,
      userLevel: user?.level
    });
  } catch (err) {
    next(err);
  }
};

