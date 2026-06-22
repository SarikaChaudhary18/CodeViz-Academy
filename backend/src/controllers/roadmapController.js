const Roadmap = require('../models/Roadmap');
const RoadmapProgress = require('../models/RoadmapProgress');
const User = require('../models/User');
const logger = require('../config/logger');
const aiService = require('../utils/aiService');
const axios = require('axios');

// Fetch list of all roadmaps
exports.getRoadmapsList = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find().select('roadmapId title description');
    res.status(200).json({
      status: 'success',
      data: roadmaps
    });
  } catch (err) {
    next(err);
  }
};

// Fetch roadmap details, with dynamic AI generation if missing
exports.getRoadmapDetails = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    let roadmap = await Roadmap.findOne({ roadmapId });

    if (!roadmap) {
      // Clean up the name for the AI generator
      const cleanTitle = roadmapId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      logger.info(`Roadmap Controller: Roadmap ${roadmapId} not found in DB. Dynamically generating using LLM...`);
      
      const prompt = `You are a career curriculum engineer at roadmap.sh. Build a professional sequential learning path for the track: "${cleanTitle}".
      
      Return ONLY a JSON object containing:
      - "description": "Step by step guide to mastering ${cleanTitle} in 2026",
      - "nodes": [
          {
            "title": "Milestone title",
            "description": "Milestone concept description mapping key tools, practices, and theories.",
            "quiz": {
              "question": "A conceptual multiple-choice question to verify understanding of this milestone.",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": 0 // Index of correct option (0-indexed)
            },
            "capstone": "Description of a hands-on project mission that the student must deploy/complete to check off this node."
          }
        ]
      
      Provide exactly 4 to 5 high-fidelity nodes in logical learning order. Ensure strict valid JSON output. No descriptions, no markdown wrapper.`;

      try {
        const result = await aiService.generateContentJSON(prompt);
        roadmap = await Roadmap.create({
          roadmapId,
          title: cleanTitle,
          description: result.description || `Step by step guide to master ${cleanTitle}`,
          nodes: result.nodes || []
        });
        logger.info(`Roadmap Controller: Successfully generated dynamic roadmap: ${roadmapId}`);
      } catch (err) {
        logger.error(`Roadmap Controller: Failed dynamic AI generation: ${err.message}`);
        return res.status(404).json({ status: 'fail', message: `Could not generate roadmap for ${cleanTitle}.` });
      }
    }

    res.status(200).json({
      status: 'success',
      data: roadmap
    });
  } catch (err) {
    next(err);
  }
};

// Fetch user's completed nodes for a roadmap
exports.getRoadmapProgress = async (req, res, next) => {
  try {
    const { roadmapId } = req.query;
    const filter = { userId: req.user.id };
    if (roadmapId) filter.roadmapId = roadmapId;

    const progressList = await RoadmapProgress.find(filter);
    
    res.status(200).json({
      status: 'success',
      data: progressList
    });
  } catch (err) {
    next(err);
  }
};

// Submit a capstone URL, mark node index as completed, award XP
exports.submitCapstone = async (req, res, next) => {
  try {
    const { roadmapId, nodeIndex, projectUrl } = req.body;

    if (!roadmapId || nodeIndex === undefined || !projectUrl) {
      return res.status(400).json({ status: 'fail', message: 'Roadmap ID, node index, and project URL are required.' });
    }

    if (!projectUrl.startsWith('http://') && !projectUrl.startsWith('https://')) {
      return res.status(400).json({ status: 'fail', message: 'A valid project URL is required.' });
    }

    // Get current progress
    let progress = await RoadmapProgress.findOne({ userId: req.user.id, roadmapId });
    if (!progress) {
      progress = new RoadmapProgress({
        userId: req.user.id,
        roadmapId,
        completedNodes: [0] // First node (index 0) is unlocked/completed by default
      });
    }

    const completedList = progress.completedNodes;
    if (!completedList.includes(nodeIndex)) {
      completedList.push(nodeIndex);
      
      // Automatically unlock the next node index
      const roadmap = await Roadmap.findOne({ roadmapId });
      if (roadmap && nodeIndex + 1 < roadmap.nodes.length && !completedList.includes(nodeIndex + 1)) {
        completedList.push(nodeIndex + 1);
      }
      
      progress.completedNodes = completedList;
      await progress.save();
    }

    // Award +250 XP
    const user = await User.findById(req.user.id);
    let newXp = req.user.xp;
    let newLevel = req.user.level;
    if (user) {
      user.xp += 250;
      user.level = Math.floor(user.xp / 1000) + 1;
      await user.save();
      newXp = user.xp;
      newLevel = user.level;
    }

    logger.info(`Roadmap Progress: Checked off node ${nodeIndex} on ${roadmapId} by user ${req.user.username}. Awarded 250 XP.`);

    res.status(200).json({
      status: 'success',
      data: progress,
      newXp,
      newLevel
    });
  } catch (err) {
    next(err);
  }
};

// Fetch YouTube oEmbed metadata for frontend play cards
exports.getPlaylistMetadata = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ status: 'fail', message: 'YouTube URL parameter is required.' });
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await axios.get(oembedUrl);

    res.status(200).json({
      status: 'success',
      data: {
        title: response.data.title,
        author_name: response.data.author_name,
        thumbnail_url: response.data.thumbnail_url
      }
    });
  } catch (err) {
    logger.error(`Failed to fetch YouTube oEmbed metadata for URL ${req.query.url}: ${err.message}`);
    res.status(400).json({
      status: 'fail',
      message: 'Failed to retrieve YouTube metadata.'
    });
  }
};

// Fetch or dynamically generate 50 quiz questions for a roadmap node
exports.getNodeQuiz = async (req, res, next) => {
  try {
    const { roadmapId, nodeIndex } = req.params;
    const idx = parseInt(nodeIndex, 10);
    
    const roadmap = await Roadmap.findOne({ roadmapId });
    if (!roadmap) {
      return res.status(404).json({ status: 'fail', message: 'Roadmap not found.' });
    }
    
    if (idx < 0 || idx >= roadmap.nodes.length) {
      return res.status(400).json({ status: 'fail', message: 'Invalid node index.' });
    }
    
    const node = roadmap.nodes[idx];
    
    // If we already have 50 or more questions generated, return them!
    if (node.quizzes && node.quizzes.length >= 50) {
      return res.status(200).json({
        status: 'success',
        data: node.quizzes
      });
    }
    
    // Generate 50 conceptual multiple-choice questions
    logger.info(`Roadmap Controller: Generating 50 MCQs for ${roadmapId} node ${idx} (${node.title}) using LLM...`);
    
    const prompt = `You are a senior curriculum engineer at roadmap.sh.
Generate exactly 50 challenging conceptual multiple-choice questions (MCQs) for the topic: "${node.title}".
Topic Description: "${node.description}".

Each question must check conceptual understanding, tools, code paradigms, design patterns, or troubleshooting issues related to this topic.
Each question MUST have exactly 4 options.

Return ONLY a JSON array of 50 objects, formatted exactly as:
[
  {
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0, // 0-indexed correct option number (0 to 3)
    "explanation": "Detailed explanation explaining why the correct option is correct and why other options are incorrect."
  }
]

Do not wrap with markdown or HTML. No comment blocks. Return valid JSON only.`;

    try {
      const result = await aiService.generateContentJSON(prompt);
      
      let questionsList = [];
      if (Array.isArray(result)) {
        questionsList = result;
      } else if (result.quizzes && Array.isArray(result.quizzes)) {
        questionsList = result.quizzes;
      } else if (result.questions && Array.isArray(result.questions)) {
        questionsList = result.questions;
      }
      
      // Basic validation
      if (questionsList.length === 0) {
        throw new Error('LLM did not return an array of questions.');
      }
      
      // Save the generated questions to node.quizzes in DB
      node.quizzes = questionsList.map(q => ({
        question: q.question || 'Review question',
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
        answer: typeof q.answer === 'number' && q.answer >= 0 && q.answer <= 3 ? q.answer : 0,
        explanation: q.explanation || 'No detailed explanation provided.'
      }));
      
      await roadmap.save();
      logger.info(`Roadmap Controller: Successfully generated and saved ${node.quizzes.length} quiz questions for ${roadmapId} node ${idx}`);
      
      res.status(200).json({
        status: 'success',
        data: node.quizzes
      });
    } catch (err) {
      logger.error(`Roadmap Controller: Failed to generate node quiz: ${err.message}`);
      // Fallback to the single pre-seeded question if LLM fails
      const fallbackQuiz = node.quiz ? [node.quiz] : [];
      res.status(200).json({
        status: 'success',
        data: fallbackQuiz,
        isFallback: true
      });
    }
  } catch (err) {
    next(err);
  }
};
