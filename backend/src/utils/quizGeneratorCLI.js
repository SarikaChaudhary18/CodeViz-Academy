const fs = require('fs');
const path = require('path');
require('dotenv').config();
const aiService = require('./aiService');

const CATEGORIES = {
  dsa: {
    name: 'Data Structures & Algorithms',
    topics: [
      // Arrays
      'Arrays - Array Basics',
      'Arrays - Traversal & Operations',
      'Arrays - Searching',
      'Arrays - Sorting Basics',
      'Arrays - Prefix Sum',
      'Arrays - Sliding Window',
      'Arrays - Two Pointers',
      'Arrays - Kadane\'s Algorithm',
      'Arrays - Binary Search on Arrays',
      'Arrays - Matrix Problems',
      // Strings
      'Strings - String Basics',
      'Strings - Character Arrays',
      'Strings - String Manipulation',
      'Strings - Hashing',
      'Strings - KMP',
      'Strings - Rabin-Karp',
      'Strings - Z Algorithm',
      'Strings - Palindrome Problems',
      // Recursion & Backtracking
      'Recursion & Backtracking - Recursion Basics',
      'Recursion & Backtracking - Recursion Trees',
      'Recursion & Backtracking - Backtracking',
      'Recursion & Backtracking - N Queens',
      'Recursion & Backtracking - Sudoku Solver',
      'Recursion & Backtracking - Subsets',
      'Recursion & Backtracking - Permutations',
      // Linked Lists
      'Linked Lists - Singly Linked List',
      'Linked Lists - Doubly Linked List',
      'Linked Lists - Circular Linked List',
      'Linked Lists - Fast Slow Pointer',
      'Linked Lists - Reverse Linked List',
      'Linked Lists - Cycle Detection',
      'Linked Lists - Merge Lists',
      // Stacks
      'Stacks - Stack Basics',
      'Stacks - Monotonic Stack',
      'Stacks - Expression Evaluation',
      'Stacks - Next Greater Element',
      'Stacks - Largest Rectangle Histogram',
      // Queues
      'Queues - Queue Basics',
      'Queues - Circular Queue',
      'Queues - Deque',
      'Queues - Priority Queue',
      'Queues - Monotonic Queue',
      // Trees
      'Trees - Binary Tree',
      'Trees - Tree Traversals',
      'Trees - Binary Search Tree',
      'Trees - AVL Tree',
      'Trees - Heap',
      'Trees - Trie',
      'Trees - Segment Tree',
      'Trees - Fenwick Tree',
      // Graphs
      'Graphs - Graph Basics',
      'Graphs - BFS',
      'Graphs - DFS',
      'Graphs - Topological Sort',
      'Graphs - Dijkstra',
      'Graphs - Bellman Ford',
      'Graphs - Floyd Warshall',
      'Graphs - Minimum Spanning Tree',
      'Graphs - Union Find',
      'Graphs - SCC',
      // Greedy
      'Greedy - Greedy Basics',
      'Greedy - Activity Selection',
      'Greedy - Huffman Coding',
      'Greedy - Job Scheduling',
      // Dynamic Programming
      'Dynamic Programming - DP Basics',
      'Dynamic Programming - 1D DP',
      'Dynamic Programming - 2D DP',
      'Dynamic Programming - Knapsack',
      'Dynamic Programming - LIS',
      'Dynamic Programming - LCS',
      'Dynamic Programming - DP on Trees',
      'Dynamic Programming - Bitmask DP',
      // Bit Manipulation
      'Bit Manipulation - Bit Basics',
      'Bit Manipulation - XOR',
      'Bit Manipulation - Bitmasking',
      'Bit Manipulation - Power of Two',
      'Bit Manipulation - Bit Tricks',
      // Hashing
      'Hashing - Hash Maps',
      'Hashing - Frequency Counting',
      'Hashing - Collision Handling',
      'Hashing - Rolling Hash'
    ]
  },
  ai: {
    name: 'Artificial Intelligence',
    topics: [
      'AI - AI Fundamentals',
      'AI - Machine Learning Basics',
      'AI - Deep Learning',
      'AI - Neural Networks',
      'AI - Transformers',
      'AI - Large Language Models (LLMs)',
      'AI - Prompt Engineering',
      'AI - AI Agents',
      'AI - Retrieval-Augmented Generation (RAG)',
      'AI - Embeddings',
      'AI - Vector Databases',
      'AI - AI Ethics',
      'AI - AI Deployment'
    ]
  },
  development: {
    name: 'Software Development & System Design',
    topics: [
      'Development - Programming Fundamentals',
      'Development - Object Oriented Programming (OOP)',
      'Development - Database Management Systems (DBMS)',
      'Development - Operating Systems',
      'Development - Computer Networks',
      'Development - System Design Basics',
      'Development - Low Level Design (LLD)',
      'Development - High Level Design (HLD)',
      'Development - REST APIs',
      'Development - Authentication & JWT',
      'Development - Microservices',
      'Development - Caching',
      'Development - Load Balancing',
      'Development - Docker',
      'Development - Kubernetes',
      'Development - Git & GitHub'
    ]
  }
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_+|_+$)/g, '');
}

async function generateQuizForTopic(categoryKey, topicName, overwrite = false) {
  const slug = slugify(topicName.replace(new RegExp(`^${categoryKey}\\s*-\\s*`, 'i'), ''));
  const folderPath = path.join(__dirname, '..', 'config', 'assets', 'subtopic_quizzes', categoryKey);
  const filePath = path.join(folderPath, `${slug}.json`);

  // Ensure category folder exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Check if already exists
  if (fs.existsSync(filePath) && !overwrite) {
    console.log(`[SKIP] Quiz already exists at: ${filePath}`);
    return;
  }

  console.log(`[GENERATE] Requesting quiz for topic: "${topicName}" (${categoryKey})...`);

  const prompt = `You are an expert Computer Science educator and assessment designer.

Generate a complete quiz for the following topic.

Topic: "${topicName}"

Requirements:
- Generate exactly 45 high-quality MCQs.
- Difficulty:
  - 15 Easy
  - 15 Medium
  - 15 Hard
- Four options (A, B, C, D).
- Only one correct answer.
- Include:
  - Question
  - Options (as an object with keys A, B, C, D)
  - Correct Answer (as a string "A", "B", "C", or "D")
  - Detailed Explanation (2–4 sentences)
- Questions should test conceptual understanding, not simple memorization.
- Include scenario-based and interview-style questions where appropriate.
- Avoid duplicate questions.
- Use modern terminology and best practices (2026).
- Output strictly in valid JSON matching the format below.

JSON Format:
{
  "topic": "${topicName}",
  "questions": [
    {
      "question": "Question text...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Detailed explanation...",
      "difficulty": "Easy"
    }
  ]
}`;

  try {
    const result = await aiService.generateContentJSON(prompt);
    
    if (!result || !result.questions || !Array.isArray(result.questions)) {
      throw new Error("Invalid output format returned from AI Service.");
    }

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`[SUCCESS] Saved quiz to: ${filePath}`);
  } catch (err) {
    console.error(`[ERROR] Failed to generate quiz for topic "${topicName}":`, err.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const helpIndex = args.indexOf('--help') !== -1 || args.indexOf('-h') !== -1;
  const allIndex = args.indexOf('--all') !== -1;
  const topicIndex = args.indexOf('--topic');
  const catIndex = args.indexOf('--category');
  const overwrite = args.indexOf('--overwrite') !== -1 || args.indexOf('-o') !== -1;

  if (helpIndex || args.length === 0) {
    console.log(`
Usage:
  node backend/src/utils/quizGeneratorCLI.js [options]

Options:
  --all                     Generate quizzes for all 105 subtopics sequentially.
  --category <dsa|ai|dev>   Generate quizzes for a specific category.
  --topic "<topicName>"     Generate quiz for a specific subtopic name.
  --overwrite, -o           Overwrite existing quiz files if they exist.
  -h, --help                Show this help screen.

Note:
  Ensure your GEMINI_API_KEY, GROQ_API_KEY, or NVIDIA_API_KEY is configured in backend/.env.
    `);
    process.exit(0);
  }

  // Check keys
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (!geminiKey && !groqKey && !nvidiaKey) {
    console.warn(`[WARNING] No API keys detected in your backend/.env file. The AI generator calls might fail.
Please configure GEMINI_API_KEY, GROQ_API_KEY, or NVIDIA_API_KEY.`);
  }

  if (allIndex) {
    console.log('Generating quizzes for all 105 subtopics...');
    for (const catKey of Object.keys(CATEGORIES)) {
      const category = CATEGORIES[catKey];
      for (const topic of category.topics) {
        await generateQuizForTopic(catKey, topic, overwrite);
        // Add a slight delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } else if (catIndex !== -1 && args[catIndex + 1]) {
    const catKey = args[catIndex + 1].toLowerCase();
    const category = CATEGORIES[catKey === 'dev' ? 'development' : catKey];
    if (!category) {
      console.error(`Invalid category: ${catKey}. Use one of: dsa, ai, development (or dev).`);
      process.exit(1);
    }
    console.log(`Generating quizzes for category: ${category.name}...`);
    for (const topic of category.topics) {
      await generateQuizForTopic(catKey === 'dev' ? 'development' : catKey, topic, overwrite);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } else if (topicIndex !== -1 && args[topicIndex + 1]) {
    const targetTopic = args[topicIndex + 1];
    let found = false;
    for (const catKey of Object.keys(CATEGORIES)) {
      const category = CATEGORIES[catKey];
      const match = category.topics.find(t => t.toLowerCase() === targetTopic.toLowerCase() || t.toLowerCase().includes(targetTopic.toLowerCase()));
      if (match) {
        found = true;
        await generateQuizForTopic(catKey, match, overwrite);
        break;
      }
    }
    if (!found) {
      console.error(`Topic not found: "${targetTopic}". Check spelling against standard structures.`);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main().then(() => {
    console.log('Quiz Generator CLI finished.');
    process.exit(0);
  }).catch(err => {
    console.error('Fatal CLI Error:', err);
    process.exit(1);
  });
}
