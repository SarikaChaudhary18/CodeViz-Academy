const aiService = require('../utils/aiService');
const logger = require('../config/logger');

const aiCache = new Map();

const getMockEscapeRoom = (topic) => {
  const cleanTopic = (topic || '').toLowerCase();
  
  if (cleanTopic.includes('prototype') || cleanTopic.includes('inherit')) {
    return {
      riddle: "I am a hidden link that binds objects together in JS. Every object inherits my secrets, tracing back to the ultimate root. If you ask for a property I do not own, I look up my chain. I terminate at the value 'null'. What is the name of this binding chain? (Hint: Think prototype chain)",
      passcode: "prototype",
      hint: "I am the standard mechanism by which objects inherit features from one another in JavaScript. Enter 'prototype' in lowercase."
    };
  }
  
  if (cleanTopic.includes('closure')) {
    return {
      riddle: "I am a function born within another function. I carry my lexical scope wherever I go, long after my parent has finished execution. I allow private variables and persistent states. What am I?",
      passcode: "closure",
      hint: "I have access to the outer function's scope even after the outer function has returned. Enter 'closure' in lowercase."
    };
  }

  if (cleanTopic.includes('loop') || cleanTopic.includes('queue')) {
    return {
      riddle: "I am the continuous cycle that manages JavaScript's operations. I monitor the call stack and dequeue microtasks and macrotasks to keep the thread non-blocking. What is my name?",
      passcode: "eventloop",
      hint: "I continuously poll the execution stack and the callback queue. Enter 'eventloop' in lowercase (without spaces)."
    };
  }

  if (cleanTopic.includes('promise') || cleanTopic.includes('async')) {
    return {
      riddle: "I represent a value that may not be available yet but will resolve in the future. I have three states: Pending, Fulfilled, or Rejected. What JavaScript object am I?",
      passcode: "promise",
      hint: "I represent the eventual completion or failure of an asynchronous operation. Enter 'promise' in lowercase."
    };
  }

  return {
    riddle: "I am the parser behavior where declarations of functions and variables are moved to the top of their containing scope before code execution. I cause variables declared with 'var' to return 'undefined' instead of throwing a ReferenceError. What am I?",
    passcode: "hoisting",
    hint: "Declarations are hoisted to the top of their execution scope. Enter 'hoisting' in lowercase."
  };
};

exports.processAiTool = async (req, res, next) => {
  try {
    const { toolType, payload } = req.body;

    if (!toolType || !payload) {
      return res.status(400).json({
        status: 'fail',
        message: 'toolType and payload are required.'
      });
    }

    let cacheKey = null;
    if (toolType === 'bug-detective' || toolType === 'code-review') {
      const codeString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      cacheKey = `${toolType}:${codeString}`;
      if (aiCache.has(cacheKey)) {
        logger.info(`AI Controller: returning cached analysis for ${toolType}`);
        return res.status(200).json({
          status: 'success',
          data: aiCache.get(cacheKey)
        });
      }
    }

    let aiResult;

    if (toolType === 'socratic') {
      const prompt = `Act as an expert Socratic programming and career mentor. The student is asking: "${payload}". 
Guidelines for your response:
1. Empathy & Balance: If the student asks you to explain, says "you tell me", "I don't know", or is clearly stuck, do not keep asking questions repeatedly. Instead, provide a brief, clear, and friendly explanation of the underlying concept, logic, or strategy. After explaining, ask a single follow-up question to check their understanding or guide them to the next step.
2. Socratic Style: If they are not stuck and are asking how to do something, do not give them the direct copy-paste solution or full code. Instead, guide them by explaining the high-level concept or strategy, and ask 1 or 2 leading questions to help them figure out the details themselves.
3. Scope: Your guidance should cover coding, systems, architecture, placements, and job search/openings logic.

You must respond with a JSON object matching this schema:
{
  "explanation": "Guiding explanation, conceptual analogy, or conceptual breakdown.",
  "question": "A single leading follow-up question to guide the student's reasoning."
}
Only return valid JSON.`;
      try {
        aiResult = await aiService.generateContentJSON(prompt);
      } catch (err) {
        logger.warn(`Socratic AI Mentor request failed: ${err.message}. Serving local conceptual feedback.`);
        aiResult = {
          explanation: `Let's reflect on your query about "${payload}". Socratic guidance is designed to unpack structural concepts. Usually, when building solutions, we break them down into state management, logic cycles, and interface components.`,
          question: "Which specific layer of this mechanism (e.g. state flow, logic structure, API integration) would you like to investigate first?"
        };
      }
    } 
    else if (toolType === 'bug-detective') {
      const prompt = `Analyze the following code for bugs, syntax errors, security flaws, or potential resource leaks:
\`\`\`
${payload}
\`\`\`
You must respond with a JSON object inside markdown backticks. The JSON must exactly match this schema:
{
  "hasBugs": boolean,
  "bugs": [{"line": number, "description": "string describing the bug", "fix": "remedial code"}],
  "explanation": "general summary of the code quality"
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    } 
    else if (toolType === 'code-review') {
      const prompt = `Perform an advanced developer code review on this block:
\`\`\`
${payload}
\`\`\`
Evaluate complexity, modularity, readability, and best practices. You must respond with a JSON object matching this schema:
{
  "rating": number (score out of 100),
  "complexity": {"time": "e.g. O(N)", "space": "e.g. O(1)"},
  "suggestions": ["suggestion 1", "suggestion 2"],
  "details": "detailed analysis details"
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    } 
    else if (toolType === 'career-navigator') {
      const prompt = `The user is preparing for: "${payload}". Give them a target sprint roadmap. You must respond with a JSON object matching this schema:
{
  "sprintPath": ["step 1", "step 2", "step 3"],
  "estimatedWeeks": number,
  "tips": ["tip 1", "tip 2"]
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    } 
    else if (toolType === 'interview-simulator') {
      const { role, company, history, lastAnswer } = payload;
      const prompt = `Act as a senior technical interviewer.
Role: ${role || 'Software Engineer'}
Company: ${company || 'Google'}
Interview history: ${JSON.stringify(history || [])}
Candidate last answer: "${lastAnswer || ''}"

Evaluate the candidate's last answer and ask the next challenging technical or behavioral question. You must respond with a JSON object matching this schema:
{
  "evaluation": "feedback on the last response",
  "nextQuestion": "the next question to ask",
  "score": number (rating from 1 to 10 for their response)
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    } 
    else if (toolType === 'execution-trace') {
      const prompt = `You are an expert DSA teacher and reasoning engine (NVIDIA Nemotron Ultra).

The user has provided the following input:
---
${payload}
---

STEP 1 - DETECT INPUT TYPE:
Determine if this is:
(a) ACTUAL CODE - ready to trace execution
(b) A PROBLEM STATEMENT / LEETCODE QUESTION - needs approach + solution first

STEP 2 - IF IT IS A PROBLEM STATEMENT:
- Explain the optimal approach in plain English (time/space complexity)
- Write the optimal solution code in JavaScript
- Then trace that solution

IF IT IS CODE:
- Trace the given code directly

STEP 3 - PRODUCE RICH TRACE:
For each execution step, track ALL data structures, variables, and operations.

You MUST respond with ONLY a valid JSON object. No markdown, no explanation outside JSON:
{
  "inputType": "code" or "problem",
  "algorithmType": "sorting|recursion|searching|dp|tree|graph|string|other",
  "problemTitle": "Two Sum" or null,
  "summary": "One concise sentence: what this algorithm does",
  "approach": "Multi-line explanation of the approach, time/space complexity, why this approach is optimal. Use plain English.",
  "timeComplexity": "O(n log n)",
  "spaceComplexity": "O(1)",
  "code": "the actual JS code being traced (either given code or generated optimal solution)",
  "graph": {
    "nodes": [
      {"id": "n1", "label": "Start", "type": "start"},
      {"id": "n2", "label": "Call sort(arr)", "type": "process", "vars": "arr=[5,3,1]"}
    ],
    "edges": [
      {"from": "n1", "to": "n2", "label": ""},
      {"from": "n2", "to": "n3", "label": "i=0"}
    ]
  },
  "steps": [
    {
      "step": 1,
      "line": 2,
      "nodeId": "n2",
      "operation": "COMPARE",
      "description": "Comparing arr[0]=5 with arr[1]=3. Since 5 > 3, a swap is needed.",
      "insight": "This is the core comparison step of bubble sort. Larger elements bubble up.",
      "arrayState": [5, 3, 8, 1, 4],
      "highlighted": [0, 1],
      "swapped": [],
      "sorted": [],
      "callStack": ["bubbleSort(arr)", "outer loop i=0"],
      "variables": {"i": 0, "j": 0, "temp": null}
    }
  ]
}

RULES:
- "insight": short educational tip explaining WHY this step matters (very important!)
- arrayState: full array snapshot at this step (null if not array-based)
- highlighted: indices being compared (shown orange)
- swapped: indices being swapped (shown red)
- sorted: indices confirmed in final position (shown green)
- callStack: array of active call frames, top = most recent
- variables: ALL relevant variables as key-value pairs (can be numbers, strings, booleans, or objects)
- operations: COMPARE | SWAP | ASSIGN | RECURSE | RETURN | PUSH | POP | CHECK | LOOP_START | LOOP_END | CALL | BASE_CASE
- General Code Tracing: If the input code is general program logic (e.g. backend controller, API request, database synchronization) rather than a standard DSA algorithm, you must still simulate its step-by-step execution path (e.g. function entry, branch condition evaluation, API call/database execution, return statement) with 10 to 20 logical steps in the "steps" array.
- Generate between 10 and 20 meaningful steps
- Make descriptions EDUCATIONAL: explain what is happening and why
- The "approach" field must be 3-6 sentences covering: algorithm choice, key insight, time/space complexity`;
      aiResult = await aiService.generateWithNemotron(prompt);
    } 
    else if (toolType === 'step-debugger') {
      const prompt = `Simulate a step-by-step debugger run on this code:
\`\`\`
${payload}
\`\`\`
Return the line execution path and variable values at each line as a structured JSON graph (NOT Mermaid). Nodes represent lines/blocks, edges represent control flow.
You must respond with a JSON object matching this EXACT schema:
{
  "graph": {
    "nodes": [{"id": "l1", "label": "Line 1: function entry", "type": "start"}, {"id": "l2", "label": "i=0, j<arr.length", "type": "decision", "vars": "i=0"}],
    "edges": [{"from": "l1", "to": "l2", "label": "enter"}]
  },
  "debugSteps": [{"line": number, "nodeId": "l1", "variablesState": "e.g. x=2, y=5", "action": "explanation of execution"}]
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    } 
    else if (toolType === 'architecture') {
      const prompt = `Inspect this file structure / class definition:
\`\`\`
${payload}
\`\`\`
Generate an architecture block schema mapping component boundaries and dependencies as a structured JSON graph (NOT Mermaid). Nodes are modules/components, edges are dependencies.
You must respond with a JSON object matching this EXACT schema:
{
  "graph": {
    "nodes": [{"id": "m1", "label": "AuthController", "type": "process"}, {"id": "m2", "label": "UserModel", "type": "process"}],
    "edges": [{"from": "m1", "to": "m2", "label": "uses"}]
  },
  "components": [{"name": "string", "type": "e.g. class, function, boundary", "purpose": "role in system"}]
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    } 
    else if (toolType === 'project-reviewer') {
      const prompt = `Auditing repository project link: "${payload}". Simulate a thorough files structural inspection. You must respond with a JSON object matching this schema:
{
  "score": number (total test score out of 100),
  "modularDesignScore": number (out of 100),
  "issues": [{"type": "Critical" or "Warning", "desc": "issue description"}],
  "remediation": "remedial blueprint recommendations"
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    } 
    else if (toolType === 'company-role-fit') {
      const prompt = `Evaluate what roles and work suits which company based on this request: "${payload}". If a company name is provided, list the top engineering/product roles, their suitability scores, why they fit, and key teams/projects. If a skill list is provided, recommend the top companies that fit these skills, explaining why.
You must respond with a JSON object matching this schema:
{
  "fitSummary": "General analysis summary of the company/skills fit",
  "recommendedRoles": [
    {
      "role": "Role Name (e.g. Systems Engineer, AI/ML Researcher)",
      "suitabilityScore": number (out of 100),
      "whyItFits": "Brief explanation of why this role fits the company culture or why the skills fit this company",
      "keyTeams": "Key teams or products involved (e.g. Search Infrastructure, Azure Cloud)"
    }
  ]
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    }
    else if (toolType === 'simulated-job-search') {
      const { keywords, location } = payload;
      const prompt = `Search and simulate real, currently active LinkedIn job postings for: keywords="${keywords || 'Frontend Developer'}", location="${location || 'India'}". Act as an aggregator returning extremely realistic, high-quality, currently posted jobs with actual descriptions and companies. Generate 8-10 distinct listings.
You must respond with a JSON object matching this schema:
{
  "jobs": [
    {
      "id": "job_id_unique_string",
      "title": "Job Title (e.g. Senior Frontend Engineer)",
      "company": "Company Name",
      "location": "Location (e.g. Bangalore, India)",
      "postedDate": "Time posted (e.g. 2 hours ago, 1 day ago)",
      "description": "Short 2-3 sentence overview of expectations, required skills, and salary if available",
      "applyUrl": "URL to apply (use a realistic LinkedIn job search link for that role)"
    }
  ]
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    }
    else if (toolType === 'game-code-battle') {
      const { topic, difficulty } = payload;
      const prompt = `Generate a dynamic coding challenge for a single-player Code Battle game against an AI bot. Topic: "${topic || 'Arrays'}", Difficulty: "${difficulty || 'Medium'}".
The challenge must include:
1. A clear question statement.
2. A starter code template in JavaScript.
3. The AI bot's final completed solution code in JavaScript (which we will simulate typing character-by-character).
4. One simple validation test case.
You must respond with a JSON object matching this schema:
{
  "question": "Problem description with examples.",
  "starterCode": "function solve(...) {\\n  // type here\\n}",
  "aiOpponentSolution": "function solve(...) {\\n  // Full correct solution\\n}",
  "testCase": { "input": "input argument description or json", "expected": "expected return value" }
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    }
    else if (toolType === 'game-code-validate') {
      const { question, userCode, testCase } = payload;
      const prompt = `Evaluate this JavaScript user submission for correctness against the given challenge:
Question: "${question}"
User Code: "${userCode}"
Test Case: ${JSON.stringify(testCase)}

Acts as a code validation runner. Evaluate if the code is logically correct and handles the test cases. If it is correct, return isCorrect true. If incorrect, return isCorrect false along with a helpful error explanation.
You must respond with a JSON object matching this schema:
{
  "isCorrect": boolean,
  "error": "Explanation of bug or compilation failure, or null if correct"
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    }
    else if (toolType === 'game-bug-hunt') {
      const { topic } = payload;
      const prompt = `Generate a dynamic single-player Bug Hunt game challenge. Topic: "${topic || 'General Programming'}".
Create a JS code snippet (between 5 and 12 lines) containing exactly one subtle syntax or semantic bug on a specific line.
Provide:
1. The title of the puzzle.
2. An array of lines representing the code.
3. The 1-indexed line number containing the bug.
4. A clear explanation of what the bug is, why it is incorrect, and how to fix it.
You must respond with a JSON object matching this schema:
{
  "title": "Puzzle Title",
  "codeLines": ["line 1", "line 2", "line 3", "..."],
  "buggyLineNumber": number (1-indexed line containing the bug),
  "explanation": "Explanation of the bug and the correct code"
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    }
    else if (toolType === 'game-algo-race') {
      const { topic } = payload;
      const prompt = `Generate a rapid-fire quiz containing 3 algorithmic and data structure questions for an Algorithm Speed Race. Topic: "${topic || 'Data Structures'}".
Each question must be a short, direct technical question (e.g. space complexity, time complexity, or data structure mechanics) with a clear, short, single-word or short-phrase answer.
You must respond with a JSON object matching this schema:
{
  "tasks": [
    {
      "question": "Question text",
      "answer": "Expected exact answer (short, e.g. O(1), Stack, Merge Sort)"
    }
  ]
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    }
    else if (toolType === 'game-escape-room') {
      const { topic } = payload;
      const prompt = `Generate a single-player Algorithmic Escape Room puzzle. Topic: "${topic || 'JavaScript Concepts'}".
Provide:
1. A concept riddle or logical challenge about programming mechanisms (e.g. event loop, closure, inheritance, scopes, hoisting).
2. The correct passcode (should be a single lowercase word, e.g. 'closure', 'hoisting', 'promises', 'currying').
3. A subtle, helpful hint if the user gets stuck.
You must respond with a JSON object matching this schema:
{
  "riddle": "Riddle text",
  "passcode": "single-word passcode in lowercase",
  "hint": "Helpful hint explaining the concept"
}`;
      try {
        aiResult = await aiService.generateContentJSON(prompt);
      } catch (err) {
        logger.warn(`AI Escape Room spawn failed: ${err.message}. Serving high-fidelity local fallback.`);
        aiResult = getMockEscapeRoom(topic);
      }
    }
    else {
      return res.status(400).json({ status: 'fail', message: 'Invalid toolType specified.' });
    }

    if (cacheKey && aiResult) {
      aiCache.set(cacheKey, aiResult);
    }

    res.status(200).json({
      status: 'success',
      data: aiResult
    });

  } catch (err) {
    logger.error(`AI Tools Dispatch error for type ${req.body.toolType}: ${err.message}`);
    res.status(500).json({
      status: 'error',
      message: err.message || 'AI service dispatcher error.'
    });
  }
};
