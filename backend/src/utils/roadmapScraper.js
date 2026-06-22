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
  const prompt = `You are a senior curriculum engineer at roadmap.sh. Build a professional sequential learning path for the track: "${title}".

Return ONLY a valid JSON object (no markdown, no code fences):
{
  "description": "Step by step guide to mastering ${title} in 2026",
  "nodes": [
    {
      "title": "Concise milestone title",
      "description": "Detailed description covering key tools, practices, concepts and theories for this milestone.",
      "quiz": {
        "question": "A precise conceptual multiple-choice question to verify deep understanding of this milestone.",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": 0
      },
      "capstone": "A concrete hands-on project mission the learner must build and deploy to check off this node."
    }
  ]
}

Requirements:
- Exactly 5 nodes in strict logical learning order (foundational → advanced)
- Each node must build on the previous
- Questions must test conceptual depth, not trivial facts
- Capstone projects must be deployable/demonstrable
- Strict valid JSON. No comments. No markdown wrapper.`;

  const result = await aiService.generateContentJSON(prompt);
  return result;
}

// ─── Main seeder ─────────────────────────────────────────────────────────────
async function triggerRoadmapSeeding() {
  try {
    const existing = await Roadmap.find().select('roadmapId').lean();
    const existingIds = new Set(existing.map(r => r.roadmapId));

    const toSeed = ROADMAP_SH_TRACKS.filter(t => !existingIds.has(t.roadmapId));

    if (toSeed.length === 0) {
      logger.info(`Roadmap Seeder: All ${ROADMAP_SH_TRACKS.length} roadmaps already in DB. Skipping.`);
      return;
    }

    logger.info(`Roadmap Seeder: Seeding ${toSeed.length} new roadmaps from roadmap.sh track list...`);

    let seeded = 0;

    for (const track of toSeed) {
      try {
        const generated = await generateRoadmapNodes(track.roadmapId, track.title);
        await Roadmap.findOneAndUpdate(
          { roadmapId: track.roadmapId },
          {
            roadmapId: track.roadmapId,
            title: track.title,
            description: generated.description || `Step by step guide to master ${track.title} in 2026`,
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

module.exports = { triggerRoadmapSeeding, ROADMAP_SH_TRACKS };
