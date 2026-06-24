const Quest = require('../models/Quest');
const User = require('../models/User');
const Activity = require('../models/Activity');
const logger = require('../config/logger');
const aiService = require('../utils/aiService');

exports.getQuests = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    // Find quests specific to this user, OR global default templates (where userId is null)
    const filter = {
      $or: [
        { userId: req.user.id },
        { userId: null }
      ]
    };
    if (type) filter.type = type;

    let quests = await Quest.find(filter);

    // Seed default global quests if none exist
    const globalCount = await Quest.countDocuments({ userId: null });
    if (globalCount === 0) {
      await Quest.create([
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
      logger.info('Default global quests seeded in database.');
      // Refetch
      quests = await Quest.find(filter);
    }

    // Check if the user has user-specific starter quests seeded
    const userSpecificQuestsCount = await Quest.countDocuments({ userId: req.user.id });
    if (userSpecificQuestsCount === 0) {
      // Find the user to fetch their targeted role
      const user = await User.findById(req.user.id);
      const role = user?.targetRole || 'Software Engineer';

      logger.info(`QuestController: Dynamically generating starter quests for role: ${role} using AI...`);

      const prompt = `You are a career development assistant. 
      Generate exactly 3 professional daily coding/learning quests (tasks) for a user with the targeted career role: "${role}".
      At least one task should be Easy, one Medium, and one Hard.
      
      Return ONLY a JSON array containing exactly 3 objects:
      [
        {
          "title": "Short capitalized task title (e.g. Build dynamic form, Setup docker config)",
          "description": "Detailed developer-focused task description",
          "difficulty": "easy" | "medium" | "hard",
          "xpReward": 50 | 100 | 200
        },
        ...
      ]
      Ensure the output is strictly valid JSON. Do not return markdown wrappers.`;

      try {
        const aiQuests = await aiService.generateContentJSON(prompt);
        if (Array.isArray(aiQuests) && aiQuests.length > 0) {
          const seededQuests = [];
          for (let i = 0; i < aiQuests.length; i++) {
            const q = aiQuests[i];
            const key = `role_${role.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${i}_${Date.now()}`;
            const created = await Quest.create({
              userId: req.user.id,
              title: q.title || `Role Task ${i+1}`,
              description: q.description || `Learning task for ${role}`,
              type: 'daily',
              xpReward: q.xpReward || (q.difficulty === 'hard' ? 200 : q.difficulty === 'medium' ? 100 : 50),
              targetValue: 1,
              key
            });
            seededQuests.push(created);
          }
          // Combine refetched quests
          quests = [...quests, ...seededQuests];
        }
      } catch (aiErr) {
        logger.error(`QuestController: Dynamic quest seeding failed: ${aiErr.message}`);
      }
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

exports.createCustomQuest = async (req, res, next) => {
  try {
    const { taskDescription } = req.body;
    if (!taskDescription || !taskDescription.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Task description is required.' });
    }

    logger.info(`QuestController: Analyzing custom task via LLM: "${taskDescription}"...`);

    const prompt = `You are an AI assistant designed to analyze user daily tasks and determine their complexity/difficulty and assign correct XP.
    User Task: "${taskDescription}"

    Determine if the task is:
    - "easy" (e.g. reading a blog, simple config, checklist tasks, simple edits). XP Reward: 50.
    - "medium" (e.g. solving a couple coding tasks, building a feature component, refactoring a module, styling a page). XP Reward: 100.
    - "hard" (e.g. complex architectural design, deploying a full stack setup, setting up CI/CD pipeline, resolving deep performance bugs). XP Reward: 200.

    Return ONLY a JSON object with this exact structure:
    {
      "difficulty": "easy" | "medium" | "hard",
      "xpReward": 50 | 100 | 200,
      "title": "Clean, short, capitalized title of the task (max 4-5 words)",
      "description": "Short explanation of what needs to be accomplished"
    }
    Ensure the output is strictly valid JSON. Only return JSON. No explanations, no markdown wrapper.`;

    const result = await aiService.generateContentJSON(prompt);

    const key = `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newQuest = await Quest.create({
      userId: req.user.id,
      title: result.title || 'Custom Daily Task',
      description: result.description || taskDescription,
      type: 'daily',
      xpReward: result.xpReward || 50,
      targetValue: 1,
      key
    });

    logger.info(`Custom Quest created: ${newQuest.title} (${newQuest.xpReward} XP) for user ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      data: newQuest
    });
  } catch (err) {
    next(err);
  }
};

