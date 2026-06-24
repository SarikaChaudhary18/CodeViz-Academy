const fs = require('fs');
const path = require('path');
const CompanyPrepProgress = require('../models/CompanyPrepProgress');
const User = require('../models/User');
const logger = require('../config/logger');
const aiService = require('../utils/aiService');

// Cache the parsed questions in-memory
let cachedQuestions = null;
const hydratedQuestionsCache = {};

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

// Compile and run code for Company Prep Question
exports.runCode = async (req, res, next) => {
  try {
    const { questionId, language, code, customInput } = req.body;
    const questions = parseQuestionsCSV();
    const qNum = parseInt(questionId, 10);
    const question = questions.find(q => q.id === qNum);

    if (!question) {
      return res.status(404).json({ status: 'fail', message: 'Question not found.' });
    }

    const cachedDetails = hydratedQuestionsCache[qNum];
    const taskDescription = cachedDetails ? cachedDetails.description : question.question;

    logger.info(`CompanyPrep: Running sandbox compilation via LLM for question ${questionId} (${language})...`);
    
    const prompt = `You are a secure, sandboxed code compilation engine.
    Analyze the following user-submitted code in "${language}" for the coding exercise:
    Exercise Prompt: ${taskDescription}
    Expected Solution Concept: ${question.answer}
    
    Custom User Test Input (if any):
    ${customInput || 'None'}
    
    Execute/evaluate this code logic.
    Return ONLY a JSON object with this exact structure:
    {
      "success": true, // true if the code successfully implements the solution for the question, false otherwise
      "compilerOutput": "stdout messages / compilation log / standard output showing execution",
      "passedCount": 2, // number of passed test cases
      "totalCount": 2,  // total number of test cases checked
      "errorMessage": "details of syntax errors or failing testcase inputs/outputs, if any"
    }
    Only output valid JSON. No explanations, no markdown wrapper.`;

    const runResult = await aiService.generateContentJSON(prompt);

    res.status(200).json({
      status: 'success',
      data: runResult
    });
  } catch (err) {
    next(err);
  }
};

// Submit code, verify, mark completed, award XP
exports.submitCode = async (req, res, next) => {
  try {
    const { questionId, language, code } = req.body;
    const qNum = parseInt(questionId, 10);
    const questions = parseQuestionsCSV();
    const question = questions.find(q => q.id === qNum);

    if (!question) {
      return res.status(404).json({ status: 'fail', message: 'Question not found.' });
    }

    const cachedDetails = hydratedQuestionsCache[qNum];
    const taskDescription = cachedDetails ? cachedDetails.description : question.question;

    logger.info(`CompanyPrep: Processing submission for question ${questionId} (${language}) by user ${req.user.username}...`);

    const prompt = `You are a secure, sandboxed code compilation engine for software interview submissions.
    Evaluate the correctness of the following user-submitted code in "${language}" for the programming task:
    Programming Task: ${taskDescription}
    Expected Solution Concept: ${question.answer}
    
    User Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Evaluate the correctness. Return ONLY a JSON object matching this structure:
    {
      "success": true, // true if the code correctly implements the solution and solves the interview question
      "compilerOutput": "Standard output logs showing verification results",
      "passedCount": 3,
      "totalCount": 3,
      "errorMessage": "Assertion error details or compile errors, if any"
    }
    Only output valid JSON.`;

    const submitResult = await aiService.generateContentJSON(prompt);

    let xpGained = 0;
    let newLevel = req.user.level;
    let newXp = req.user.xp;
    let progress = null;

    if (submitResult.success) {
      // Mark as completed in progress database
      progress = await CompanyPrepProgress.findOne({ userId: req.user.id });
      if (!progress) {
        progress = new CompanyPrepProgress({ userId: req.user.id });
      }

      const completed = progress.completedQuestions || [];
      const isCompletedNow = !completed.includes(qNum);

      if (isCompletedNow) {
        completed.push(qNum);
        progress.completedQuestions = completed;
        await progress.save();

        // Award +20 XP
        const user = await User.findById(req.user.id);
        if (user) {
          user.xp += 20;
          user.level = Math.floor(user.xp / 1000) + 1;
          await user.save();
          xpGained = 20;
          newLevel = user.level;
          newXp = user.xp;
        }
        logger.info(`CompanyPrep Sandbox: Submission success for question ${qNum}. Awarded 20 XP to ${req.user.username}`);
      } else {
        progress = await CompanyPrepProgress.findOne({ userId: req.user.id });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        success: submitResult.success,
        compilerOutput: submitResult.compilerOutput,
        passedCount: submitResult.passedCount,
        totalCount: submitResult.totalCount,
        errorMessage: submitResult.errorMessage,
        xpGained,
        newLevel,
        newXp,
        progress
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get dynamic hydrated question details, converting interview topic to coding prompt
exports.getQuestionDetails = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const qNum = parseInt(questionId, 10);
    const questions = parseQuestionsCSV();
    const question = questions.find(q => q.id === qNum);

    if (!question) {
      return res.status(404).json({ status: 'fail', message: 'Question not found.' });
    }

    // Return cached details if available
    if (hydratedQuestionsCache[qNum]) {
      return res.status(200).json({
        status: 'success',
        data: {
          ...question,
          ...hydratedQuestionsCache[qNum]
        }
      });
    }

    // Otherwise, generate dynamically using AI service
    logger.info(`CompanyPrep: Hydrating question details dynamically using LLM for topic: ${question.question}...`);

    const prompt = `You are an expert software engineering interviewer.
    Transform the following conceptual or technical software engineering interview question and answer into a practical coding exercise.
    The candidate will write code to demonstrate or implement the concepts described.

    Interview Question: "${question.question}"
    Correct Answer / Explanation: "${question.answer}"

    Return ONLY a JSON object containing:
    - "description": A detailed markdown description. First restate the conceptual question, then explain the coding task: candidate must write a clean class, function, or code example illustrating/implementing the concepts. Define what classes or helper functions they should write. Keep it clear, developer-focused, and highly engaging.
    - "templates": An object containing starter code templates for languages: "cpp", "java", "python", "javascript" (e.g. standard class/function setup for demonstrating the concept).
    - "hints": An array of 3 helpful hints for implementing this demonstration code.

    Ensure your output is a strictly valid JSON block. Avoid any leading/trailing explanations. Only return the JSON.`;

    try {
      const result = await aiService.generateContentJSON(prompt);
      
      const hydratedDetails = {
        description: result.description || `Write code to demonstrate: ${question.question}`,
        templates: result.templates || {
          javascript: `function solution() {\n  // Write code demonstrating: ${question.question}\n}`,
          python: `def solution():\n    # Write code demonstrating: ${question.question}\n    pass`,
          cpp: `void solution() {\n    // Write code demonstrating: ${question.question}\n}`,
          java: `class Solution {\n    public void solve() {\n        // Write code demonstrating: ${question.question}\n    }\n}`
        },
        hints: result.hints || ['Break down the concept into a simple class or function.', 'Demonstrate inheritance or implementation explicitly.', 'Provide a calling context to show your class in action.']
      };

      hydratedQuestionsCache[qNum] = hydratedDetails;

      res.status(200).json({
        status: 'success',
        data: {
          ...question,
          ...hydratedDetails
        }
      });
    } catch (err) {
      logger.error(`CompanyPrep: Failed dynamic AI hydration: ${err.message}`);
      // Return defaults on error
      const fallbackDetails = {
        description: `Write a program implementation that solves the following coding prompt:\n\n${question.question}\n\n**Goal**: Provide code that illustrates the correct answer:\n${question.answer}`,
        templates: {
          javascript: `function solution() {\n  // Write code demonstrating: ${question.question}\n}`,
          python: `def solution():\n    # Write code demonstrating: ${question.question}\n    pass`,
          cpp: `void solution() {\n    // Write code demonstrating: ${question.question}\n}`,
          java: `class Solution {\n    public void solve() {\n        // Write code demonstrating: ${question.question}\n    }\n}`
        },
        hints: ['Consider the key differences outlined in the conceptual answer.', 'Focus on writing clear, self-documenting code.']
      };
      res.status(200).json({
        status: 'success',
        data: {
          ...question,
          ...fallbackDetails
        }
      });
    }
  } catch (err) {
    next(err);
  }
};
