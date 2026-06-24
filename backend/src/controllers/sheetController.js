const SheetProgress = require('../models/SheetProgress');
const DsaProblem = require('../models/DsaProblem');
const User = require('../models/User');
const logger = require('../config/logger');
const aiService = require('../utils/aiService');

// Upsert problem checked status
exports.toggleProblemStatus = async (req, res, next) => {
  try {
    const { sheetType, problemId, status } = req.body;

    if (!sheetType || !problemId) {
      return res.status(400).json({ status: 'fail', message: 'Sheet type and problem ID are required.' });
    }

    const progress = await SheetProgress.findOneAndUpdate(
      { userId: req.user.id, sheetType, problemId },
      { status: status || 'completed', solvedAt: new Date() },
      { new: true, upsert: true }
    );

    // Give user 15 XP for solving a sheet problem
    const user = await User.findById(req.user.id);
    if (user) {
      user.xp += 15;
      user.level = Math.floor(user.xp / 1000) + 1;
      await user.save();
    }

    logger.info(`Problem checked off: ${problemId} on sheet ${sheetType} by user ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      data: progress,
      userXp: user.xp,
      userLevel: user.level,
    });
  } catch (err) {
    next(err);
  }
};

// Fetch user's checked list progress
exports.getSheetProgress = async (req, res, next) => {
  try {
    const { sheetType } = req.query;
    const filter = { userId: req.user.id };
    if (sheetType) filter.sheetType = sheetType;

    const progressList = await SheetProgress.find(filter);

    res.status(200).json({
      status: 'success',
      data: progressList
    });
  } catch (err) {
    next(err);
  }
};

// Fetch all problems (checklist items)
exports.getProblemsList = async (req, res, next) => {
  try {
    const { sheetType } = req.query;
    const filter = {};
    if (sheetType) filter.sheetType = sheetType;

    const problems = await DsaProblem.find(filter).select('-description -examples -constraints -templates -testCases -editorial');

    res.status(200).json({
      status: 'success',
      data: problems
    });
  } catch (err) {
    next(err);
  }
};

// Get problem detail, with dynamic AI hydration if empty
exports.getProblemDetails = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    let problem = await DsaProblem.findOne({ problemId });

    if (!problem) {
      return res.status(404).json({ status: 'fail', message: 'Problem not found in database.' });
    }

    // Dynamic AI Hydration if description is missing or if templates contain driver code / main functions / loops
    const hasDriverCode = problem.templates && (
      JSON.stringify(problem.templates).includes("main(") || 
      JSON.stringify(problem.templates).includes("while (") ||
      JSON.stringify(problem.templates).includes("while(cin") ||
      JSON.stringify(problem.templates).includes("while(true") ||
      JSON.stringify(problem.templates).includes("std::cin")
    );

    if (!problem.description || !problem.templates || !problem.templates.javascript || hasDriverCode) {
      logger.info(`Sheet Controller: Hydrating problem details dynamically using LLM for ${problem.title} (Reason: ${hasDriverCode ? 'Polled/Driver templates detected' : 'Missing metadata'})...`);
      
      const prompt = `You are an expert algorithms educator and problem setter. Generate details for the coding problem titled "${problem.title}" (External resource: ${problem.link || 'N/A'}).
      
      Return ONLY a JSON object containing:
      - "description": A high-fidelity markdown description of the problem statement, inputs, outputs, and explanations. Keep it clear, engaging and modern.
      - "examples": An array of examples. Each example must have: "input", "output", "explanation". Give 2 realistic examples.
      - "constraints": Markdown text describing the computational constraints (e.g. O(N) time complexity, array lengths, values ranges).
      - "templates": An object containing empty starter code templates for languages: "cpp", "java", "python", "javascript". Match LeetCode style function declarations exactly (e.g., in C++: "class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        \n    }\n};"). Do NOT include any main function, driver code, while loops to read inputs, solved code logic, comments containing the solution, or large library imports. The templates must be completely empty shell templates with just function names, signatures, and empty bodies.
      - "testCases": An array of at least 3 test cases. Each test case must have: "input" (raw string parameter value), "expectedOutput" (raw string output).
      - "editorial": A brief markdown overview of the optimal approach (e.g. sliding window, hashmap) and time/space complexity.
      
      Ensure your output is a strictly valid JSON block. Avoid any leading/trailing explanations. Only return the JSON.`;

      try {
        const result = await aiService.generateContentJSON(prompt);
        
        problem.description = result.description || `Implement the solution for ${problem.title}.`;
        problem.examples = result.examples || [];
        problem.constraints = result.constraints || 'Standard constraints apply.';
        problem.templates = result.templates || {
          cpp: 'class Solution {\npublic:\n    void solve() {\n        \n    }\n};',
          java: 'class Solution {\n    public void solve() {\n        \n    }\n}',
          python: 'class Solution:\n    def solve(self):\n        pass',
          javascript: 'function solve() {\n    \n}'
        };
        problem.testCases = result.testCases || [];
        problem.editorial = result.editorial || 'No editorial available yet.';

        await problem.save();
        logger.info(`Sheet Controller: Dynamic AI hydration success for problem ${problemId}.`);
      } catch (err) {
        logger.error(`Sheet Controller: Failed dynamic AI hydration: ${err.message}`);
        // Populate defaults if LLM fails
        problem.description = problem.description || `Implement the solution for ${problem.title}. Link: ${problem.link}`;
        problem.templates = problem.templates || {
          cpp: '// Write your C++ solution here',
          java: '// Write your Java solution here',
          python: '# Write your Python solution here',
          javascript: '// Write your JavaScript solution here'
        };
      }
    }

    res.status(200).json({
      status: 'success',
      data: problem
    });
  } catch (err) {
    next(err);
  }
};

// Compile and run code in Sandbox
exports.runCode = async (req, res, next) => {
  try {
    const { problemId, language, code, customInput } = req.body;
    const problem = await DsaProblem.findOne({ problemId });

    if (!problem) {
      return res.status(404).json({ status: 'fail', message: 'Problem not found.' });
    }

    // Call LLM acting as the safe execution compiler
    logger.info(`Sheet Controller: Running sandbox compilation via LLM helper for ${problemId} (${language})...`);
    
    const prompt = `You are a secure, sandboxed code compilation engine.
    Analyze the following user-submitted code in "${language}" for the problem titled "${problem.title}".
    
    User Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Standard Test Cases configured:
    ${JSON.stringify(problem.testCases)}
    
    Custom User Input provided (if any):
    ${customInput || 'None'}
    
    Execute/evaluate this code logic. Compare the results against the expected outputs of the test cases.
    Return ONLY a JSON object with this exact structure:
    {
      "success": true, // true if all standard test cases pass, false otherwise
      "compilerOutput": "stdout messages / compilation log / standard output showing execution",
      "passedCount": 2, // number of passed test cases
      "totalCount": 3,  // total number of test cases checked
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

// Submit code, verify tests, update solved progress, award XP
exports.submitCode = async (req, res, next) => {
  try {
    const { problemId, language, code } = req.body;
    const problem = await DsaProblem.findOne({ problemId });

    if (!problem) {
      return res.status(404).json({ status: 'fail', message: 'Problem not found.' });
    }

    logger.info(`Sheet Controller: Processing submission for problem ${problemId} (${language}) by user ${req.user.username}...`);
    
    // Call LLM compiler engine
    const prompt = `You are a secure, sandboxed code compilation engine for SDE checklist submissions.
    Evaluate the following user-submitted code in "${language}" for the problem "${problem.title}".
    
    User Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Test Cases to check:
    ${JSON.stringify(problem.testCases)}
    
    Evaluate the correctness. Return ONLY a JSON object matching this structure:
    {
      "success": true, // true if all test cases pass without logical errors
      "compilerOutput": "Standard output logs showing tests execution status",
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
      // Mark as completed in user's sheet progress
      progress = await SheetProgress.findOneAndUpdate(
        { userId: req.user.id, sheetType: problem.sheetType, problemId },
        { status: 'completed', solvedAt: new Date() },
        { new: true, upsert: true }
      );

      // Award +15 XP
      const user = await User.findById(req.user.id);
      if (user) {
        user.xp += 15;
        user.level = Math.floor(user.xp / 1000) + 1;
        await user.save();
        xpGained = 15;
        newLevel = user.level;
        newXp = user.xp;
      }
      logger.info(`Sheet Controller: Submission success for ${problemId}. Awarded 15 XP to ${req.user.username}`);
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
