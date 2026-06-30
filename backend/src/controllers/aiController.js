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
      const prompt = `Act as an expert Socratic programming mentor. The student is asking: "${payload}". Do not give them the solution or code. Instead, write a short, friendly reply asking 1 or 2 guiding questions that lead them to the correct programming logic or boundary check themselves. Respond directly in plain text.`;
      const responseText = await aiService.generateCopilotResponse(prompt);
      
      let cleanedText = responseText;
      try {
        if (typeof responseText === 'string' && (responseText.trim().startsWith('{') || responseText.trim().startsWith('['))) {
          const parsed = JSON.parse(responseText);
          cleanedText = parsed.response || parsed.text || responseText;
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
      const prompt = `Analyze this code and trace its execution tree, recursive call stack, or loop states:
\`\`\`
${payload}
\`\`\`
Return a structured JSON graph of nodes and edges (NOT Mermaid syntax). Each node has an id, label, type (start/end/process/decision), and optional vars string. Each edge has from, to, optional label.
Also list step-by-step execution logs with node references.
You must respond with a JSON object matching this EXACT schema:
{
  "graph": {
    "nodes": [{"id": "n1", "label": "Start", "type": "start"}, {"id": "n2", "label": "factorial(3)", "type": "process", "vars": "n=3"}],
    "edges": [{"from": "n1", "to": "n2", "label": ""}]
  },
  "steps": [{"step": 1, "nodeId": "n2", "description": "Call factorial with n=3", "variables": "n=3"}]
}`;
      aiResult = await aiService.generateContentJSON(prompt);
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
