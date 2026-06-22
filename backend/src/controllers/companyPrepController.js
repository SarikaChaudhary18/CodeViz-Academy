const fs = require('fs');
const path = require('path');
const CompanyPrepProgress = require('../models/CompanyPrepProgress');
const User = require('../models/User');
const logger = require('../config/logger');

// Cache the parsed questions in-memory
let cachedQuestions = null;

function parseQuestionsCSV() {
  if (cachedQuestions) return cachedQuestions;

  try {
    const csvPath = '/Users/mohitmudgil/Desktop/CodWiz/Software Questions.csv';
    if (!fs.existsSync(csvPath)) {
      logger.error(`CSV File not found at ${csvPath}`);
      return [];
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');
    const questions = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Character-by-character CSV cell extractor handling quotes correctly
      const row = [];
      let currentField = '';
      let insideQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          row.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      row.push(currentField.trim());

      if (row.length >= 5) {
        // Clean cell values
        const idNum = parseInt(row[0], 10);
        const questionText = row[1].replace(/^"|"$/g, '').replace(/""/g, '"');
        const answerText = row[2].replace(/^"|"$/g, '').replace(/""/g, '"');
        const categoryText = row[3].replace(/^"|"$/g, '').replace(/""/g, '"');
        const difficultyText = row[4].replace(/^"|"$/g, '').replace(/""/g, '"');

        questions.push({
          id: isNaN(idNum) ? i : idNum,
          question: questionText,
          answer: answerText,
          category: categoryText,
          difficulty: difficultyText
        });
      }
    }

    cachedQuestions = questions;
    logger.info(`CompanyPrepController: Successfully parsed ${questions.length} questions from CSV.`);
    return questions;
  } catch (err) {
    logger.error(`Error parsing Software Questions CSV: ${err.message}`);
    return [];
  }
}

// Fetch all parsed questions with search and filter queries
exports.getQuestionsList = async (req, res, next) => {
  try {
    const questions = parseQuestionsCSV();
    const { category, difficulty, search } = req.query;

    let filtered = [...questions];

    if (category) {
      filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }

    if (difficulty) {
      filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchLower) || 
        q.answer.toLowerCase().includes(searchLower)
      );
    }

    // Get categories and difficulties list for filters
    const categoriesList = [...new Set(questions.map(q => q.category))];
    const difficultiesList = [...new Set(questions.map(q => q.difficulty))];

    res.status(200).json({
      status: 'success',
      data: {
        questions: filtered,
        categories: categoriesList,
        difficulties: difficultiesList
      }
    });
  } catch (err) {
    next(err);
  }
};

// Fetch user progress
exports.getProgress = async (req, res, next) => {
  try {
    let progress = await CompanyPrepProgress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await CompanyPrepProgress.create({
        userId: req.user.id,
        completedQuestions: [],
        starredQuestions: []
      });
    }

    res.status(200).json({
      status: 'success',
      data: progress
    });
  } catch (err) {
    next(err);
  }
};

// Toggle complete status and reward XP
exports.toggleComplete = async (req, res, next) => {
  try {
    const { questionNumber } = req.body;
    const qNum = parseInt(questionNumber, 10);
    if (isNaN(qNum)) {
      return res.status(400).json({ status: 'fail', message: 'Valid question number is required.' });
    }

    let progress = await CompanyPrepProgress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new CompanyPrepProgress({ userId: req.user.id });
    }

    const completed = progress.completedQuestions;
    const isCompletedNow = !completed.includes(qNum);

    if (isCompletedNow) {
      completed.push(qNum);
    } else {
      const index = completed.indexOf(qNum);
      if (index > -1) completed.splice(index, 1);
    }

    progress.completedQuestions = completed;
    await progress.save();

    // Award +20 XP on new completions
    let newXp = req.user.xp;
    let newLevel = req.user.level;

    if (isCompletedNow) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.xp += 20;
        user.level = Math.floor(user.xp / 1000) + 1;
        await user.save();
        newXp = user.xp;
        newLevel = user.level;
      }
      logger.info(`CompanyPrep Progress: Question ${qNum} marked completed by ${req.user.username}. +20 XP awarded.`);
    }

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

// Toggle star status
exports.toggleStar = async (req, res, next) => {
  try {
    const { questionNumber } = req.body;
    const qNum = parseInt(questionNumber, 10);
    if (isNaN(qNum)) {
      return res.status(400).json({ status: 'fail', message: 'Valid question number is required.' });
    }

    let progress = await CompanyPrepProgress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new CompanyPrepProgress({ userId: req.user.id });
    }

    const starred = progress.starredQuestions;
    const starIdx = starred.indexOf(qNum);

    if (starIdx > -1) {
      starred.splice(starIdx, 1);
    } else {
      starred.push(qNum);
    }

    progress.starredQuestions = starred;
    await progress.save();

    res.status(200).json({
      status: 'success',
      data: progress
    });
  } catch (err) {
    next(err);
  }
};
