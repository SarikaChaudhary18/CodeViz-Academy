const Roadmap = require('../models/Roadmap');
const RoadmapProgress = require('../models/RoadmapProgress');
const User = require('../models/User');
const logger = require('../config/logger');
const aiService = require('../utils/aiService');
const axios = require('axios');

// Fetch list of all roadmaps
exports.getRoadmapsList = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find().select('roadmapId title description icon color category difficulty estimatedDuration');
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
      const cleanTitle = roadmapId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      logger.info(`Roadmap Controller: Roadmap ${roadmapId} not found in DB. Dynamically generating using LLM pipeline...`);
      
      const { generateRoadmapNodes } = require('../utils/roadmapScraper');
      try {
        const generated = await generateRoadmapNodes(roadmapId, cleanTitle);
        
        const totalNodes = generated.nodes ? generated.nodes.length : 0;
        const totalProjects = generated.nodes ? generated.nodes.reduce((sum, n) => sum + (n.projects ? n.projects.length : 0), 0) + generated.nodes.filter(n => n.capstone).length : 0;
        const totalResources = (generated.resources ? generated.resources.length : 0) + (generated.nodes ? generated.nodes.reduce((sum, n) => sum + (n.resources ? n.resources.length : 0), 0) : 0);
        const totalDocs = (generated.documentation ? generated.documentation.length : 0) + (generated.nodes ? generated.nodes.reduce((sum, n) => sum + (n.documentation ? n.documentation.length : 0), 0) : 0);

        roadmap = await Roadmap.create({
          roadmapId,
          title: cleanTitle,
          description: generated.description || `Step by step guide to master ${cleanTitle} in 2026`,
          icon: generated.icon || '',
          color: generated.color || '#06b6d4',
          banner: generated.banner || '',
          difficulty: generated.difficulty || 'Intermediate',
          estimatedDuration: generated.estimatedDuration || '3 months',
          category: generated.category || 'Web Development',
          tags: generated.tags || [],
          stats: {
            totalNodes,
            totalProjects,
            totalResources,
            totalDocs
          },
          resources: generated.resources || [],
          documentation: generated.documentation || [],
          graph: generated.graph || { nodes: [], edges: [] },
          careerRoles: generated.careerRoles || [],
          prerequisites: generated.prerequisites || [],
          learningOutcomes: generated.learningOutcomes || [],
          nodes: generated.nodes || [],
          sourceUrl: `https://roadmap.sh/${roadmapId}`
        });
        logger.info(`Roadmap Controller: Successfully generated dynamic roadmap: ${roadmapId}`);
      } catch (err) {
        logger.error(`Roadmap Controller: Failed dynamic AI generation: ${err.message}`);
        return res.status(404).json({ status: 'fail', message: `Could not generate roadmap for ${cleanTitle}: ${err.message}` });
      }
    }

    if (roadmap) {
      if (!roadmap.analytics) {
        roadmap.analytics = { views: 0, startedUsers: 0, completedUsers: 0, averageCompletionTime: '', averageQuizScore: 0 };
      }
      roadmap.analytics.views = (roadmap.analytics.views || 0) + 1;
      await roadmap.save();
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
        completedNodes: []
      });
    }

    const completedList = progress.completedNodes;
    const nodeIdStr = String(nodeIndex);
    if (!completedList.includes(nodeIdStr)) {
      completedList.push(nodeIdStr);
      
      // Automatically unlock next node
      const roadmap = await Roadmap.findOne({ roadmapId });
      if (roadmap && nodeIndex + 1 < roadmap.nodes.length) {
        const nextNodeId = roadmap.nodes[nodeIndex + 1].nodeId || String(nodeIndex + 1);
        if (!completedList.includes(nextNodeId)) {
          // just push it
        }
      }
      
      progress.completedNodes = completedList;
      if (!progress.completedProjects.includes(nodeIdStr)) {
        progress.completedProjects.push(nodeIdStr);
      }
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

// Fetch or dynamically generate 50 quiz questions for a roadmap node with difficulty and topic filtering
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
    
    // Return saved quizzes if already generated
    if (node.quizzes && node.quizzes.length >= 40) {
      return res.status(200).json({
        status: 'success',
        data: node.quizzes
      });
    }
    
    logger.info(`Roadmap Controller: Generating 50 MCQs with expanded difficulty metrics for ${roadmapId} node ${idx} using LLM...`);
    
    const prompt = `You are a senior curriculum engineer at roadmap.sh.
Generate exactly 50 challenging conceptual multiple-choice questions (MCQs) for the topic: "${node.title}".
Topic Description: "${node.shortDescription || node.description}".

Each question must check conceptual understanding, tools, code paradigms, design patterns, or troubleshooting issues.
Ensure that some questions are Easy, some are Medium, and some are Hard.

Return ONLY a JSON array of 50 objects, formatted exactly as:
[
  {
    "question": "Question text...",
    "difficulty": "Easy|Medium|Hard",
    "topic": "Variables|State|API|...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0, // 0-indexed correct option number (0 to 3)
    "explanation": "Detailed explanation explaining why the correct option is correct.",
    "hint": "Useful hint to solve this problem."
  }
]

Do not wrap with markdown or HTML. Return valid JSON only.`;

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
      
      if (questionsList.length === 0) {
        throw new Error('LLM did not return an array of questions.');
      }
      
      node.quizzes = questionsList.map(q => ({
        question: q.question || 'Review question',
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
        answer: typeof q.answer === 'number' && q.answer >= 0 && q.answer <= 3 ? q.answer : 0,
        explanation: q.explanation || 'No detailed explanation provided.',
        difficulty: q.difficulty || 'Medium',
        topic: q.topic || node.title,
        hint: q.hint || ''
      }));
      
      await roadmap.save();
      logger.info(`Roadmap Controller: Successfully generated and saved ${node.quizzes.length} quiz questions for ${roadmapId} node ${idx}`);
      
      res.status(200).json({
        status: 'success',
        data: node.quizzes
      });
    } catch (err) {
      logger.error(`Roadmap Controller: Failed to generate node quiz: ${err.message}`);
      const fallbackQuiz = node.quiz ? [{
        question: node.quiz.question,
        options: node.quiz.options,
        answer: node.quiz.answer,
        explanation: 'Review concepts.',
        difficulty: 'Medium',
        topic: node.title,
        hint: ''
      }] : [];
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

// Translate between Android XML layouts and Jetpack Compose code
exports.translateLayout = async (req, res, next) => {
  try {
    const { code, direction } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Code is required for translation.' });
    }

    logger.info(`Roadmap Controller: Translating layout via LLM (direction: ${direction})...`);

    const prompt = `You are an expert mobile development AI specialized in Android UI layouts.
    Translate the following source layout code according to the direction: "${direction === 'xml-to-compose' ? 'Android XML to Jetpack Compose Kotlin' : 'Jetpack Compose Kotlin to Android XML'}".

    Source Code:
    ${code}

    Return ONLY the translated target code. Do not wrap it in markdown backticks or include headers (like \`\`\`kotlin or \`\`\`xml). Output the raw converted layout code directly.`;

    const resultText = await aiService.generateCopilotResponse(prompt);

    res.status(200).json({
      status: 'success',
      data: resultText
    });
  } catch (err) {
    next(err);
  }
};

// AI Mentor query agent (Personalized with User Stats & Progress context)
exports.mentorQuery = async (req, res, next) => {
  try {
    const { roadmapId, nodeTitle, query, chatHistory } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Query is required.' });
    }

    logger.info(`Roadmap Controller: AI Mentor query for topic: ${nodeTitle || 'General'}`);

    const user = await User.findById(req.user.id);
    const progress = await RoadmapProgress.findOne({ userId: req.user.id, roadmapId });
    const userXp = user ? user.xp : 0;
    const userLevel = user ? user.level : 1;
    const completedNodesCount = progress ? progress.completedNodes.length : 0;

    const roadmap = await Roadmap.findOne({ roadmapId });
    let difficulty = 'Intermediate';
    if (roadmap) {
      difficulty = roadmap.difficulty || 'Intermediate';
      if (nodeTitle && roadmap.nodes) {
        const activeNode = roadmap.nodes.find(n => n.title && n.title.toLowerCase() === nodeTitle.toLowerCase());
        if (activeNode && activeNode.difficulty) {
          difficulty = activeNode.difficulty;
        }
      }
    }

    const prompt = `You are the StudyQuest AI Career & Technology Mentor, an elite senior software engineer and curriculum designer.
You are mentoring ${req.user.username} (Level ${userLevel}, XP ${userXp}), who has completed ${completedNodesCount} topics in their roadmap.

Active Roadmap: "${roadmapId || 'General'}"
Current Milestone Topic: "${nodeTitle || 'General'}"
Difficulty: "${difficulty}"
User's completed topic list/IDs: ${progress ? JSON.stringify(progress.completedNodes) : '[]'}

User Question: "${query}"

Provide a highly personalized explanation tailored to their experience level. If they are a beginner (lower level/XP), keep explanations intuitive and use clear analogies. If they are advanced, provide deep-dive architecture specs and code fragments. Make sure to encourage them!

Chat Context History:
${JSON.stringify(chatHistory || [])}`;

    const reply = await aiService.generateCopilotResponse(prompt);

    res.status(200).json({
      status: 'success',
      data: reply
    });
  } catch (err) {
    next(err);
  }
};

// Helper for mock career blueprints when AI keys are missing/cooldown
const getMockCareerPlan = (targetRole, currentSkills, dailyHours, timelineMonths) => {
  const role = targetRole.toLowerCase();
  const hours = dailyHours || 2;
  const months = timelineMonths || 3;

  if (role.includes('front') || role.includes('react') || role.includes('ui') || role.includes('web')) {
    return {
      dailyPlan: `Spend ${hours} hours daily: 50% coding responsive React components, 25% studying UI/UX best practices, and 25% debugging browser rendering. Aim for 50 XP daily in the DSA sandbox.`,
      weeklyPlan: `- Week 1: Master HTML5 Semantic Tags & CSS Grid/Flexbox layouts.\n- Week 2: JavaScript ES6+ features, promises, async/await, and DOM manipulation.\n- Week 3: React Fundamentals - components, props, state, and functional hooks.\n- Week 4: Tailwind CSS styling integration and building interactive responsive dashboards.`,
      monthlyPlan: `- Month 1: Frontend State Management (Redux Toolkit or Zustand) and client-side routing.\n- Month 2: API integrations, Axios custom clients, WebSockets real-time chat, and JWT authentication flow.\n- Month 3: Performance optimization (lazy loading, virtual lists), Vite production builds, and CI/CD deployment on Vercel/Netlify.`,
      projectRecommendations: `- Project 1: Real-time Collaborative Board - React, Tailwind, Socket.io, and Canvas APIs.\n- Project 2: High-Performance E-Commerce Product Filter - virtual lists, custom hooks, and local state search caching.\n- Project 3: Interactive Developer Portfolio - responsive layouts, Tailwind glow animations, and ATS-optimized project showcases.`,
      interviewTimeline: `Weeks 1-4: Focus on JavaScript core concepts (closures, event loop) and basic array questions. Weeks 5-8: React lifecycle, hook details, state design, and medium DSA problems. Weeks 9-12: System design (CDN, caching, state sync) and behavioral interview mock practices.`,
      resumeTimeline: `Week 4: Design a custom, responsive ATS-compatible resume layout. Week 8: Showcase 2 major frontend projects with GitHub links. Week 12: Optimize LinkedIn profile, write a technical post summarizing a React build, and begin job outreach.`
    };
  } else if (role.includes('back') || role.includes('node') || role.includes('api') || role.includes('database') || role.includes('system')) {
    return {
      dailyPlan: `Spend ${hours} hours daily: 60% building Express API endpoints, 20% designing database schemas (SQL/NoSQL), and 20% optimizing server-side algorithms. Aim to log 1 completed backend quest daily.`,
      weeklyPlan: `- Week 1: Node.js core modules, event loop, file system, and HTTP server routing.\n- Week 2: Express framework setup, middleware logic, CORS, security headers, and rate limiting.\n- Week 3: Database design - MongoDB schema validations, indexing strategies, and aggregation pipelines.\n- Week 4: JWT token authentication, bcrypt password hashing, and cookie-session security.`,
      monthlyPlan: `- Month 1: RESTful API standards, API documentation (Swagger), and writing modular unit tests (Jest/Supertest).\n- Month 2: Advanced server patterns - Redis caching layers, WebSocket real-time pub/sub, and background job queues.\n- Month 3: System scaling - Docker containerization, Nginx load balancing, and AWS EC2/Render deployment.`,
      projectRecommendations: `- Project 1: Scalable Chat Room API - Node, Express, Socket.io, Redis adapter, and MongoDB storage.\n- Project 2: Rate-Limited Payment Gateway Mock - Express, Redis middleware, JWT auth, and database transactions.\n- Project 3: Microservice User Manager - Decoupled auth service, Docker-compose config, and API Gateway load balancer.`,
      interviewTimeline: `Weeks 1-4: Master backend fundamentals, database indexing, and SQL vs NoSQL. Weeks 5-8: Focus on multi-threading, concurrency, Redis caching, and medium DSA sheets. Weeks 9-12: Deep dive into System Design (load balancers, CDN, replication, sharding) and mock interviews.`,
      resumeTimeline: `Week 4: List core technologies (Node, Express, Mongo) on resume. Week 8: Add 2 backend capstones showing API schemas and Redis integration. Week 12: Write a blog post explaining a database scaling challenge you solved, and apply to back-end roles.`
    };
  } else if (role.includes('dsa') || role.includes('algorithm') || role.includes('leet') || role.includes('code') || role.includes('competitive')) {
    return {
      dailyPlan: `Spend ${hours} hours daily: 70% solving algorithmic problems on the sandbox, 20% analyzing space/time complexity, and 10% reviewing pattern checklists (Sliding Window, Two Pointers).`,
      weeklyPlan: `- Week 1: Complete Arrays & Hashing patterns - Two Sum, Group Anagrams, Top K Frequent.\n- Week 2: Two Pointers & Sliding Window - Valid Palindrome, 3Sum, Best Time to Buy/Sell Stock.\n- Week 3: Stack & Queue patterns - Valid Parentheses, Min Stack, Evaluate Reverse Polish Notation.\n- Week 4: Binary Search & Linked Lists - Search in Rotated Sorted Array, Reverse Linked List, Merge Lists.`,
      monthlyPlan: `- Month 1: Trees and Graphs - Binary Tree Level Order Traversal, Max Depth, DFS/BFS, and Course Schedule.\n- Month 2: Heap / Priority Queue and Recursion / Backtracking - Merge K Sorted Lists, Kth Largest, Subsets, Word Search.\n- Week 3: Dynamic Programming & Greedy Algorithms - Climb Stairs, Longest Common Subsequence, House Robber, Coin Change.`,
      projectRecommendations: `- Project 1: Visual DSA Sandbox - React dashboard visualizing sorting algorithms and graph traversals in real-time.\n- Project 2: Code Execution Compiler Api - Scalable Docker sandbox executing code securely against test cases.\n- Project 3: Algorithmic Game Solver - Solving Sudoku or N-Queens with visual backtracking steps.`,
      interviewTimeline: `Weeks 1-4: Master basic arrays, hashing, and linear data structures. Weeks 5-8: Trees, graphs, heaps, and medium-level coding patterns. Weeks 9-12: Advanced Dynamic Programming, System Design (rate limiter, tinyurl), and mock interviews.`,
      resumeTimeline: `Week 4: Update GitHub with organized folders of DSA solutions. Week 8: Highlight problem-solving achievements (e.g. 200+ problems solved, LeetCode contest rating) on resume. Week 12: Conduct peer mock interviews and apply to software engineering internships.`
    };
  } else {
    // Default: Full Stack Developer / Software Engineer
    return {
      dailyPlan: `Spend ${hours} hours daily: 40% frontend coding, 40% backend database/routes building, and 20% algorithmic puzzle solving. Target 60 XP daily across all sandboxes.`,
      weeklyPlan: `- Week 1: Core Web Stack - HTML5 semantic grids, CSS variables, and modern Javascript ES6+ syntax.\n- Week 2: Single Page Applications - React component lifecycles, states, and client-side routing.\n- Week 3: Backend API - Node.js servers, Express middleware, rate limiting, and MongoDB integration.\n- Week 4: Database Modeling & JWT Security - relational schemas, encryption, and secure logins.`,
      monthlyPlan: `- Month 1: State Management (Zustand) and WebSockets real-time communications.\n- Month 2: Testing & Scaling - unit tests (Jest), Redis caching, and Nginx load balancing.\n- Month 3: Containerization & Deployment - Dockerizing the stack, Docker Compose configs, and Vercel/Render deployments.`,
      projectRecommendations: `- Project 1: Gamified Learning Sandbox - React frontend, Express backend, Socket.io, MongoDB, and local execution compilers.\n- Project 2: High-Volume Analytics Tracker - Redis queue pipelines, data visualization dashboards, and rate-limited endpoints.\n- Project 3: Collaborative Markdown Editor - WebSockets synchronization, document versioning, and user auth.`,
      interviewTimeline: `Weeks 1-4: Focus on core JS, network protocols, and array DSA problems. Weeks 5-8: System design basics (load balancers, caching) and intermediate coding patterns. Weeks 9-12: Full stack integration architecture, database optimization, and behavioral prep.`,
      resumeTimeline: `Week 4: List the full-stack tech stack and design initial resume layout. Week 8: Add 2 complete full-stack web applications with live links and GitHub source. Week 12: Prepare portfolio website, update LinkedIn, and apply to Full Stack roles.`
    };
  }
};

// AI Career Plan Generator
exports.generateCareerPlan = async (req, res, next) => {
  try {
    const { targetRole, currentSkills, dailyHours, timelineMonths } = req.body;
    if (!targetRole) {
      return res.status(400).json({ status: 'fail', message: 'Target role is required.' });
    }

    logger.info(`Roadmap Controller: Generating Career Plan for target role: ${targetRole}`);

    // Check if active keys exist. If not, trigger fallback instantly to avoid slow timeouts or errors
    const geminiKeyVal = process.env.GEMINI_API_KEY;
    const groqKeyVal = process.env.GROQ_API_KEY;
    const nvidiaKeyVal = process.env.NVIDIA_API_KEY;

    const hasKeys = (geminiKeyVal && geminiKeyVal !== 'your_gemini_api_key_here') ||
                    (groqKeyVal && groqKeyVal !== 'your_groq_api_key_here') ||
                    (nvidiaKeyVal && nvidiaKeyVal !== 'your_nvidia_api_key_here');

    if (!hasKeys) {
      logger.info('Roadmap Controller: No active API keys found. Serving local mock plan fallback.');
      const mockResult = getMockCareerPlan(targetRole, currentSkills, dailyHours, timelineMonths);
      return res.status(200).json({
        status: 'success',
        data: mockResult
      });
    }

    const prompt = `You are the StudyQuest AI Career Planner. Build a high-fidelity learning plan based on:
    - Target Career Role: ${targetRole}
    - Current Developer Skills: ${currentSkills || 'None (Beginner)'}
    - Commitment: ${dailyHours || 2} Hours/Day
    - Study Duration: ${timelineMonths || 3} Months
    
    Generate detailed schedule guidelines.
    Return ONLY a JSON object formatted exactly as:
    {
      "dailyPlan": "Daily study roadmap, routines, and XP goals...",
      "weeklyPlan": "Weekly sprints and milestone check-ins...",
      "monthlyPlan": "Monthly roadmap chapters and scaling builds...",
      "projectRecommendations": "Specific resume-building project layouts, database schemas, and FAANG metrics...",
      "interviewTimeline": "Logical timeline for DSA, system design, and behavior preparation.",
      "resumeTimeline": "Guidelines for when and how to build ATS-compatible portfolio pages."
    }
    
    Ensure strict valid JSON format. Do not wrap in markdown tags or include comments.`;

    try {
      const result = await aiService.generateContentJSON(prompt);
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (err) {
      logger.warn(`Roadmap Controller AI generation failed: ${err.message}. Serving local mock fallback.`);
      const mockResult = getMockCareerPlan(targetRole, currentSkills, dailyHours, timelineMonths);
      res.status(200).json({
        status: 'success',
        data: mockResult
      });
    }
  } catch (err) {
    next(err);
  }
};

// Fetch resources for a roadmap
exports.getRoadmapResources = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findOne({ roadmapId });
    if (!roadmap) {
      return res.status(404).json({ status: 'fail', message: 'Roadmap not found.' });
    }
    res.status(200).json({
      status: 'success',
      data: roadmap.resources || []
    });
  } catch (err) {
    next(err);
  }
};

// Fetch documentation topics for a roadmap
exports.getRoadmapDocumentation = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findOne({ roadmapId });
    if (!roadmap) {
      return res.status(404).json({ status: 'fail', message: 'Roadmap not found.' });
    }
    res.status(200).json({
      status: 'success',
      data: roadmap.documentation || []
    });
  } catch (err) {
    next(err);
  }
};

// Fetch knowledge graph (nodes + edges) for a roadmap
exports.getRoadmapGraph = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findOne({ roadmapId });
    if (!roadmap) {
      return res.status(404).json({ status: 'fail', message: 'Roadmap not found.' });
    }
    res.status(200).json({
      status: 'success',
      data: roadmap.graph || { nodes: [], edges: [] }
    });
  } catch (err) {
    next(err);
  }
};

// Fetch stats for a roadmap
exports.getRoadmapStats = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findOne({ roadmapId });
    if (!roadmap) {
      return res.status(404).json({ status: 'fail', message: 'Roadmap not found.' });
    }

    // Recalculate stats dynamically
    const totalNodes = roadmap.nodes ? roadmap.nodes.length : 0;
    const totalProjects = roadmap.nodes ? roadmap.nodes.reduce((sum, n) => sum + (n.projects ? n.projects.length : 0), 0) + roadmap.nodes.filter(n => n.capstone).length : 0;
    const totalResources = (roadmap.resources ? roadmap.resources.length : 0) + (roadmap.nodes ? roadmap.nodes.reduce((sum, n) => sum + (n.resources ? n.resources.length : 0), 0) : 0);
    const totalDocs = (roadmap.documentation ? roadmap.documentation.length : 0) + (roadmap.nodes ? roadmap.nodes.reduce((sum, n) => sum + (n.documentation ? n.documentation.length : 0), 0) : 0);

    const stats = {
      totalNodes,
      totalProjects,
      totalResources,
      totalDocs
    };

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// Next node & resources recommendation engine
exports.getRoadmapRecommendations = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findOne({ roadmapId });
    if (!roadmap) {
      return res.status(404).json({ status: 'fail', message: 'Roadmap not found.' });
    }

    const progress = await RoadmapProgress.findOne({ userId: req.user.id, roadmapId });
    const completedIds = progress ? progress.completedNodes : [];

    // Find first incomplete node
    let recommendedNode = null;
    if (roadmap.nodes && roadmap.nodes.length > 0) {
      recommendedNode = roadmap.nodes.find(n => !completedIds.includes(n.nodeId) && !completedIds.includes(String(n.order - 1)));
      if (!recommendedNode) {
        return res.status(200).json({
          status: 'success',
          message: 'Roadmap completed!',
          data: null
        });
      }
    }

    if (!recommendedNode) {
      return res.status(200).json({
        status: 'success',
        data: null
      });
    }

    const nodeResources = recommendedNode.resources && recommendedNode.resources.length > 0
      ? recommendedNode.resources
      : (roadmap.resources ? roadmap.resources.slice(0, 3) : []);

    const nodeDocs = recommendedNode.documentation && recommendedNode.documentation.length > 0
      ? recommendedNode.documentation
      : (roadmap.documentation ? roadmap.documentation.slice(0, 1) : []);

    const suggestedProject = recommendedNode.projects && recommendedNode.projects.length > 0
      ? recommendedNode.projects[0]
      : { title: 'Capstone Milestone', description: recommendedNode.capstone || 'Build milestone project' };

    res.status(200).json({
      status: 'success',
      data: {
        nextNode: {
          nodeId: recommendedNode.nodeId,
          title: recommendedNode.title,
          shortDescription: recommendedNode.shortDescription,
          detailedDescription: recommendedNode.detailedDescription,
          difficulty: recommendedNode.difficulty,
          estimatedHours: recommendedNode.estimatedHours || 10
        },
        resources: nodeResources,
        docs: nodeDocs,
        project: suggestedProject,
        estimatedHours: recommendedNode.estimatedHours || 10
      }
    });
  } catch (err) {
    next(err);
  }
};

// Search API across Roadmaps, Nodes, Documentation topics, and Resources
exports.searchRoadmaps = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Search query parameter q is required.' });
    }

    const regexQuery = new RegExp(q, 'i');
    
    // Find all matching roadmaps
    const roadmaps = await Roadmap.find({
      $or: [
        { title: regexQuery },
        { description: regexQuery },
        { tags: regexQuery }
      ]
    }).select('roadmapId title description icon color category difficulty estimatedDuration');

    const allRoadmaps = await Roadmap.find().lean();
    
    const matchedNodes = [];
    const matchedDocs = [];
    const matchedResources = [];

    allRoadmaps.forEach(r => {
      if (r.nodes) {
        r.nodes.forEach(n => {
          if (regexQuery.test(n.title) || regexQuery.test(n.shortDescription) || regexQuery.test(n.detailedDescription)) {
            matchedNodes.push({
              roadmapId: r.roadmapId,
              roadmapTitle: r.title,
              nodeId: n.nodeId,
              title: n.title,
              shortDescription: n.shortDescription,
              difficulty: n.difficulty
            });
          }
        });
      }

      if (r.documentation) {
        r.documentation.forEach(d => {
          if (regexQuery.test(d.topic) || regexQuery.test(d.summary) || regexQuery.test(d.deepDive)) {
            matchedDocs.push({
              roadmapId: r.roadmapId,
              roadmapTitle: r.title,
              topic: d.topic,
              summary: d.summary
            });
          }
        });
      }

      if (r.resources) {
        r.resources.forEach(res => {
          if (regexQuery.test(res.title) || regexQuery.test(res.provider)) {
            matchedResources.push({
              roadmapId: r.roadmapId,
              roadmapTitle: r.title,
              title: res.title,
              provider: res.provider,
              url: res.url,
              type: res.type
            });
          }
        });
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        roadmaps,
        nodes: matchedNodes.slice(0, 10),
        documentation: matchedDocs.slice(0, 10),
        resources: matchedResources.slice(0, 10)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Progress updates PATCH endpoint
exports.updateProgress = async (req, res, next) => {
  try {
    const { roadmapId, nodeId, completed, lastVisitedNode, quizScore, projectUrl } = req.body;

    if (!roadmapId) {
      return res.status(400).json({ status: 'fail', message: 'Roadmap ID is required.' });
    }

    const roadmap = await Roadmap.findOne({ roadmapId });
    if (!roadmap) {
      return res.status(404).json({ status: 'fail', message: 'Roadmap not found.' });
    }

    let progress = await RoadmapProgress.findOne({ userId: req.user.id, roadmapId });
    const isNewProgress = !progress;
    if (!progress) {
      progress = new RoadmapProgress({
        userId: req.user.id,
        roadmapId,
        completedNodes: []
      });
    }

    const wasCompletedBefore = progress.completionPercentage === 100;
    let xpAwarded = 0;

    if (nodeId && completed !== undefined) {
      const isCurrentlyCompleted = progress.completedNodes.includes(String(nodeId));
      if (completed && !isCurrentlyCompleted) {
        progress.completedNodes.push(String(nodeId));
        progress.currentNode = String(nodeId);
        xpAwarded += 100; // Standard XP award for completion
      } else if (!completed && isCurrentlyCompleted) {
        progress.completedNodes = progress.completedNodes.filter(id => id !== String(nodeId));
      }
    }

    if (lastVisitedNode) {
      progress.lastVisitedNode = String(lastVisitedNode);
      progress.lastVisitedAt = new Date();
    }

    if (quizScore !== undefined) {
      progress.quizScore = Number(quizScore);
    }

    if (projectUrl && nodeId) {
      if (!progress.completedProjects.includes(String(nodeId))) {
        progress.completedProjects.push(String(nodeId));
        xpAwarded += 150; // Extra XP for building the project capstone
      }
    }

    const totalNodesCount = roadmap.nodes ? roadmap.nodes.length : 1;
    progress.completionPercentage = Math.min(100, Math.round((progress.completedNodes.length / totalNodesCount) * 100));
    progress.xpEarned += xpAwarded;

    await progress.save();

    // Update roadmap analytics
    try {
      if (!roadmap.analytics) {
        roadmap.analytics = { views: 1, startedUsers: 0, completedUsers: 0, averageCompletionTime: '', averageQuizScore: 0 };
      }
      
      let shouldSaveRoadmap = false;
      if (isNewProgress) {
        roadmap.analytics.startedUsers = (roadmap.analytics.startedUsers || 0) + 1;
        shouldSaveRoadmap = true;
      }
      if (progress.completionPercentage === 100 && !wasCompletedBefore) {
        roadmap.analytics.completedUsers = (roadmap.analytics.completedUsers || 0) + 1;
        shouldSaveRoadmap = true;
      }
      
      if (quizScore !== undefined) {
        const allProgress = await RoadmapProgress.find({ roadmapId });
        const scores = allProgress.map(p => p.quizScore).filter(s => typeof s === 'number' && s > 0);
        if (scores.length > 0) {
          const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
          roadmap.analytics.averageQuizScore = avgScore;
          shouldSaveRoadmap = true;
        }
      }
      
      if (shouldSaveRoadmap) {
        await roadmap.save();
      }
    } catch (analError) {
      logger.error(`Failed to update roadmap analytics: ${analError.message}`);
    }

    let newXp = req.user.xp;
    let newLevel = req.user.level;
    const user = await User.findById(req.user.id);
    if (user && xpAwarded > 0) {
      user.xp += xpAwarded;
      user.level = Math.floor(user.xp / 1000) + 1;
      
      const todayStr = new Date().toISOString().split('T')[0];
      if (user.lastActiveDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (user.lastActiveDate === yesterdayStr) {
          user.streak += 1;
        } else {
          user.streak = 1;
        }
        user.lastActiveDate = todayStr;
      }
      
      if (progress.completionPercentage === 100 && !user.bookmarkedRoadmaps.includes(`completed_${roadmapId}`)) {
        progress.badges.push(`Master of ${roadmap.title}`);
      }

      await user.save();
      newXp = user.xp;
      newLevel = user.level;
    }

    res.status(200).json({
      status: 'success',
      data: {
        progress,
        xpAwarded,
        userXp: newXp,
        userLevel: newLevel
      }
    });
  } catch (err) {
    next(err);
  }
};

// Toggle bookmarking for a roadmap
exports.bookmarkRoadmap = async (req, res, next) => {
  try {
    const { roadmapId } = req.body;
    if (!roadmapId) {
      return res.status(400).json({ status: 'fail', message: 'Roadmap ID is required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    const index = user.bookmarkedRoadmaps.indexOf(roadmapId);
    let bookmarked = false;
    if (index === -1) {
      user.bookmarkedRoadmaps.push(roadmapId);
      bookmarked = true;
    } else {
      user.bookmarkedRoadmaps.splice(index, 1);
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        roadmapId,
        bookmarked
      }
    });
  } catch (err) {
    next(err);
  }
};

// Retrieve list of bookmarked roadmaps
exports.getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    const roadmaps = await Roadmap.find({ roadmapId: { $in: user.bookmarkedRoadmaps || [] } })
      .select('roadmapId title description icon color category difficulty estimatedDuration');

    res.status(200).json({
      status: 'success',
      data: roadmaps
    });
  } catch (err) {
    next(err);
  }
};
