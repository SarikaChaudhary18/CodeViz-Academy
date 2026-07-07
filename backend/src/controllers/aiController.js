const aiService = require('../utils/aiService');
const logger = require('../config/logger');

exports.processAiTool = async (req, res, next) => {
  try {
    const { toolType, payload } = req.body;

    if (!toolType || !payload) {
      return res.status(400).json({
        status: 'fail',
        message: 'toolType and payload are required.'
      });
    }

    let aiResult;

    if (toolType === 'socratic') {
      const prompt = `Act as an expert Socratic programming and career mentor. The student is asking: "${payload}". 
Guidelines for your response:
1. Empathy & Balance: If the student asks you to explain, says "you tell me", "I don't know", or is clearly stuck, do not keep asking questions repeatedly. Instead, provide a brief, clear, and friendly explanation of the underlying concept, logic, or strategy. After explaining, ask a single follow-up question to check their understanding or guide them to the next step.
2. Socratic Style: If they are not stuck and are asking how to do something, do not give them the direct copy-paste solution or full code. Instead, guide them by explaining the high-level concept or strategy, and ask 1 or 2 leading questions to help them figure out the details themselves.
3. Scope: Your guidance should cover coding, systems, architecture, placements, and job search/openings logic, rather than being strictly limited to code.
Respond directly in plain text.`;
      const responseText = await aiService.generateCopilotResponse(prompt);
      
      let cleanedText = responseText;
      try {
        if (typeof responseText === 'string' && (responseText.trim().startsWith('{') || responseText.trim().startsWith('['))) {
          const parsed = JSON.parse(responseText);
          cleanedText = parsed.reply || parsed.response || parsed.text || parsed.message || parsed.content || responseText;
        }
      } catch (e) {
        logger.error(`Error parsing socratic text: ${e.message}`);
      }
      
      aiResult = { response: cleanedText };
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
    else {
      return res.status(400).json({ status: 'fail', message: 'Invalid toolType specified.' });
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
