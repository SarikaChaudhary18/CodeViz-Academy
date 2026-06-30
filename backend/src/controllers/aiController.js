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
      aiResult = { response: responseText };
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
Produce a valid flowchart diagram using Mermaid.js syntax (starting with "graph TD" or similar) and list step-by-step logs. Do not include markdown code block characters inside the mermaidCode string. You must respond with a JSON object matching this schema:
{
  "mermaidCode": "graph TD\\n  A[Start] --> B[Step]",
  "steps": [{"step": number, "description": "what happens", "variables": "state details"}]
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    } 
    else if (toolType === 'step-debugger') {
      const prompt = `Simulate a step-by-step debugger run on this code:
\`\`\`
${payload}
\`\`\`
Return the line execution path and variable values at each line. Output a Mermaid.js flowchart mapping control flow. Do not include markdown characters in mermaidCode. You must respond with a JSON object matching this schema:
{
  "mermaidCode": "graph TD\\n  Start --> Line1",
  "debugSteps": [{"line": number, "variablesState": "e.g. x=2, y=5", "action": "explanation of execution"}]
}`;
      aiResult = await aiService.generateContentJSON(prompt);
    } 
    else if (toolType === 'architecture') {
      const prompt = `Inspect this file structure / class definition:
\`\`\`
${payload}
\`\`\`
Generate an architecture block schema mapping component boundaries and dependencies. Output a valid Mermaid.js flowchart of the component modules. You must respond with a JSON object matching this schema:
{
  "mermaidCode": "graph LR\\n  ModuleA --> ModuleB",
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
