const Roadmap = require('../models/Roadmap');
const aiService = require('./aiService');
const logger = require('../config/logger');

// ─── Full roadmap list sourced from roadmap.sh GitHub repo ────────────────────
// Source: https://github.com/kamranahmedse/developer-roadmap/tree/master/src/data/roadmaps
const ROADMAP_SH_TRACKS = [
  { roadmapId: 'frontend',                    title: 'Frontend Developer' },
  { roadmapId: 'backend',                     title: 'Backend Developer' },
  { roadmapId: 'full-stack',                  title: 'Full Stack Developer' },
  { roadmapId: 'devops',                      title: 'DevOps Engineer' },
  { roadmapId: 'ai-engineer',                 title: 'AI Engineer' },
  { roadmapId: 'machine-learning',            title: 'Machine Learning Engineer' },
  { roadmapId: 'data-analyst',                title: 'Data Analyst' },
  { roadmapId: 'data-engineer',               title: 'Data Engineer' },
  { roadmapId: 'ai-data-scientist',           title: 'AI & Data Scientist' },
  { roadmapId: 'android',                     title: 'Android Developer' },
  { roadmapId: 'ios',                         title: 'iOS Developer' },
  { roadmapId: 'react',                       title: 'React Developer' },
  { roadmapId: 'vue',                         title: 'Vue.js Developer' },
  { roadmapId: 'angular',                     title: 'Angular Developer' },
  { roadmapId: 'nextjs',                      title: 'Next.js Developer' },
  { roadmapId: 'nodejs',                      title: 'Node.js Developer' },
  { roadmapId: 'javascript',                  title: 'JavaScript Developer' },
  { roadmapId: 'typescript',                  title: 'TypeScript Developer' },
  { roadmapId: 'python',                      title: 'Python Developer' },
  { roadmapId: 'java',                        title: 'Java Developer' },
  { roadmapId: 'golang',                      title: 'Go Developer' },
  { roadmapId: 'rust',                        title: 'Rust Developer' },
  { roadmapId: 'cpp',                         title: 'C++ Developer' },
  { roadmapId: 'kotlin',                      title: 'Kotlin Developer' },
  { roadmapId: 'flutter',                     title: 'Flutter Developer' },
  { roadmapId: 'docker',                      title: 'Docker & Containerization' },
  { roadmapId: 'kubernetes',                  title: 'Kubernetes & Orchestration' },
  { roadmapId: 'aws',                         title: 'AWS Cloud Engineer' },
  { roadmapId: 'linux',                       title: 'Linux System Administrator' },
  { roadmapId: 'cyber-security',              title: 'Cyber Security Engineer' },
  { roadmapId: 'blockchain',                  title: 'Blockchain Developer' },
  { roadmapId: 'graphql',                     title: 'GraphQL Developer' },
  { roadmapId: 'mongodb',                     title: 'MongoDB Database Admin' },
  { roadmapId: 'postgresql-dba',             title: 'PostgreSQL Database Admin' },
  { roadmapId: 'sql',                         title: 'SQL & Database Fundamentals' },
  { roadmapId: 'system-design',              title: 'System Design' },
  { roadmapId: 'computer-science',           title: 'Computer Science Fundamentals' },
  { roadmapId: 'datastructures-and-algorithms', title: 'Data Structures & Algorithms' },
  { roadmapId: 'django',                      title: 'Django Developer' },
  { roadmapId: 'aspnet-core',               title: 'ASP.NET Core Developer' },
  { roadmapId: 'spring-boot',               title: 'Spring Boot Developer' },
  { roadmapId: 'laravel',                     title: 'Laravel Developer' },
  { roadmapId: 'api-design',                 title: 'API Design & REST' },
  { roadmapId: 'git-github',                 title: 'Git & GitHub' },
  { roadmapId: 'mlops',                       title: 'MLOps Engineer' },
  { roadmapId: 'devsecops',                   title: 'DevSecOps Engineer' },
  { roadmapId: 'game-developer',             title: 'Game Developer' },
  { roadmapId: 'engineering-manager',        title: 'Engineering Manager' },
  { roadmapId: 'software-architect',         title: 'Software Architect' },
  { roadmapId: 'ai-agents',                  title: 'AI Agents Developer' },
  { roadmapId: 'design-system',             title: 'Design System Engineer' },
  { roadmapId: 'react-native',              title: 'React Native Developer' },
  { roadmapId: 'bi-analyst',               title: 'Business Intelligence Analyst' },
  { roadmapId: 'network-engineer',          title: 'Network Engineer' },
  { roadmapId: 'elasticsearch',             title: 'Elasticsearch Engineer' },
  { roadmapId: 'terraform',                 title: 'Terraform & IaC' },
  { roadmapId: 'technical-writer',          title: 'Technical Writer' },
  { roadmapId: 'qa',                         title: 'QA Engineer' },
  { roadmapId: 'ux-design',                title: 'UX Designer' },
  { roadmapId: 'prompt-engineering',        title: 'Prompt Engineering' },
];

// ─── AI-powered node generator ────────────────────────────────────────────────
async function generateRoadmapNodes(roadmapId, title) {
  const prompt = `You are an elite curriculum engineer at roadmap.sh. Build a professional sequential learning path for the track: "${title}".
      
Return ONLY a valid JSON object (no markdown wrappers, no code fences):
{
  "description": "Step by step guide to mastering ${title} in 2026",
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimatedDuration": "3 months",
  "category": "Web Development|AI & Data Science|DevOps|Mobile Development|Data Engineering|Cybersecurity",
  "tags": ["tag1", "tag2"],
  "learningOutcomes": ["Outcome 1", "Outcome 2"],
  "careerRoles": ["Job Title 1", "Job Title 2"],
  "resources": [
    {
      "title": "Resource Title",
      "provider": "Provider Name",
      "type": "documentation|video|course|book",
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration": "e.g. 5 hours",
      "rating": 4.8,
      "cost": "free|paid",
      "url": "https://example.com",
      "thumbnail": "https://example.com/image.png"
    }
  ],
  "documentation": [
    {
      "topic": "Topic Name",
      "summary": "Short summary...",
      "deepDive": "Detailed deep dive description...",
      "commonMistakes": "Common mistakes to avoid...",
      "bestPractices": "Best practices for production...",
      "codeExamples": "Code snippet...",
      "references": "https://example.com"
    }
  ],
  "graph": {
    "nodes": [
      {
        "id": "node1",
        "label": "Node Label",
        "type": "root|milestone|tool",
        "level": 1,
        "color": "#a855f7"
      }
    ],
    "edges": [
      {
        "from": "node1",
        "to": "node2",
        "relation": "prerequisite"
      }
    ]
  },
  "nodes": [
    {
      "nodeId": "unique-node-id",
      "title": "Milestone title",
      "shortDescription": "Quick overview...",
      "detailedDescription": "Deep-dive concept explanation...",
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimatedHours": 10,
      "order": 1,
      "prerequisites": [],
      "learningObjectives": ["Objective 1", "Objective 2"],
      "technologies": ["Tool1", "Tool2"],
      "resources": [
        {
          "title": "Node specific resource",
          "url": "https://example.com",
          "type": "video|article"
        }
      ],
      "documentation": [
        {
          "topic": "Node specific topic",
          "summary": "Summary..."
        }
      ],
      "projects": [
        {
          "title": "Mini Project Title",
          "description": "Mini project requirement details...",
          "difficulty": "Beginner|Intermediate|Advanced",
          "estimatedHours": 5
        }
      ],
      "quizzes": [
        {
          "question": "Quiz question text?",
          "difficulty": "Easy|Medium|Hard",
          "topic": "Subtopic",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": 0,
          "explanation": "Why correct option is correct",
          "hint": "Hint to solve the quiz"
        }
      ],
      "capstone": "Main hands-on project description to complete this node."
    }
  ]
}

Provide exactly 4 or 5 high-quality nodes in logical order. Ensure the graph edges connect all these nodes correctly. Ensure strict valid JSON output. No markdown block wrapper. No comment lines.`;

  const result = await aiService.generateContentJSON(prompt);
  return result;
}

// ─── Main seeder ─────────────────────────────────────────────────────────────
async function triggerRoadmapSeeding() {
  try {
    const existing = await Roadmap.find().select('roadmapId').lean();
    const existingIds = new Set(existing.map(r => r.roadmapId));

    // Limit seeding to a very small set or check missing
    const toSeed = ROADMAP_SH_TRACKS.filter(t => !existingIds.has(t.roadmapId));

    if (toSeed.length === 0) {
      logger.info(`Roadmap Seeder: All ${ROADMAP_SH_TRACKS.length} roadmaps already in DB. Skipping.`);
      return;
    }

    logger.info(`Roadmap Seeder: Seeding ${toSeed.length} new roadmaps with expanded structured schemas...`);

    let seeded = 0;

    for (const track of toSeed) {
      try {
        const generated = await generateRoadmapNodes(track.roadmapId, track.title);
        
        // Calculate stats
        const totalNodes = generated.nodes ? generated.nodes.length : 0;
        const totalProjects = generated.nodes ? generated.nodes.reduce((sum, n) => sum + (n.projects ? n.projects.length : 0), 0) + generated.nodes.filter(n => n.capstone).length : 0;
        const totalResources = (generated.resources ? generated.resources.length : 0) + (generated.nodes ? generated.nodes.reduce((sum, n) => sum + (n.resources ? n.resources.length : 0), 0) : 0);
        const totalDocs = (generated.documentation ? generated.documentation.length : 0) + (generated.nodes ? generated.nodes.reduce((sum, n) => sum + (n.documentation ? n.documentation.length : 0), 0) : 0);

        await Roadmap.findOneAndUpdate(
          { roadmapId: track.roadmapId },
          {
            roadmapId: track.roadmapId,
            title: track.title,
            description: generated.description || `Step by step guide to master ${track.title} in 2026`,
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
            sourceUrl: `https://roadmap.sh/${track.roadmapId}`
          },
          { upsert: true, new: true }
        );
        seeded++;
        logger.info(`Roadmap Seeder: ✓ ${track.title} (${seeded}/${toSeed.length})`);
      } catch (err) {
        logger.warn(`Roadmap Seeder: ✗ Failed to generate ${track.title}: ${err.message}`);
      }

      // Small delay between calls to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info(`Roadmap Seeder: Done. Seeded ${seeded}/${toSeed.length} roadmaps.`);
  } catch (err) {
    logger.error(`Roadmap Seeder: triggerRoadmapSeeding failed: ${err.message}`);
  }
}

module.exports = { triggerRoadmapSeeding, ROADMAP_SH_TRACKS, generateRoadmapNodes };
