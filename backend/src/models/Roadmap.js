const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  roadmapId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  sourceUrl: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#06b6d4',
  },
  banner: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    default: 'Intermediate',
  },
  estimatedDuration: {
    type: String,
    default: '3 months',
  },
  category: {
    type: String,
    default: 'Web Development',
  },
  tags: {
    type: [String],
    default: [],
  },
  stats: {
    totalNodes: { type: Number, default: 0 },
    totalProjects: { type: Number, default: 0 },
    totalResources: { type: Number, default: 0 },
    totalDocs: { type: Number, default: 0 }
  },
  resources: [
    {
      title: { type: String, default: '' },
      provider: { type: String, default: '' },
      type: { type: String, default: '' },
      difficulty: { type: String, default: '' },
      duration: { type: String, default: '' },
      rating: { type: Number, default: 5.0 },
      cost: { type: String, default: 'free' },
      url: { type: String, default: '' },
      thumbnail: { type: String, default: '' }
    }
  ],
  documentation: [
    {
      topic: { type: String, default: '' },
      summary: { type: String, default: '' },
      deepDive: { type: String, default: '' },
      commonMistakes: { type: String, default: '' },
      bestPractices: { type: String, default: '' },
      codeExamples: { type: String, default: '' },
      references: { type: String, default: '' }
    }
  ],
  graph: {
    nodes: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, default: 'milestone' },
        level: { type: Number, default: 1 },
        color: { type: String, default: '#fbbf24' }
      }
    ],
    edges: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
        relation: { type: String, default: 'prerequisite' }
      }
    ]
  },
  careerRoles: {
    type: [String],
    default: [],
  },
  prerequisites: {
    type: [String],
    default: [],
  },
  learningOutcomes: {
    type: [String],
    default: [],
  },
  nodes: [
    {
      nodeId: { type: String, default: '' },
      title: {
        type: String,
        required: true,
      },
      shortDescription: {
        type: String,
        default: '',
      },
      detailedDescription: {
        type: String,
        default: '',
      },
      difficulty: {
        type: String,
        default: 'Intermediate',
      },
      estimatedHours: {
        type: Number,
        default: 0,
      },
      order: {
        type: Number,
        default: 0,
      },
      prerequisites: {
        type: [String],
        default: [],
      },
      learningObjectives: {
        type: [String],
        default: [],
      },
      technologies: {
        type: [String],
        default: [],
      },
      resources: [
        {
          title: { type: String, default: '' },
          url: { type: String, default: '' },
          type: { type: String, default: '' }
        }
      ],
      documentation: [
        {
          topic: { type: String, default: '' },
          summary: { type: String, default: '' }
        }
      ],
      projects: [
        {
          title: { type: String, default: '' },
          description: { type: String, default: '' },
          difficulty: { type: String, default: '' },
          estimatedHours: { type: Number, default: 0 }
        }
      ],
      quiz: {
        question: {
          type: String,
          default: '',
        },
        options: {
          type: [String],
          default: [],
        },
        answer: {
          type: Number,
          default: 0,
        },
      },
      quizzes: [
        {
          question: {
            type: String,
            required: true,
          },
          options: {
            type: [String],
            required: true,
          },
          answer: {
            type: Number,
            required: true,
          },
          explanation: {
            type: String,
            default: '',
          },
          difficulty: {
            type: String,
            default: 'Medium',
          },
          topic: {
            type: String,
            default: '',
          },
          hint: {
            type: String,
            default: '',
          }
        }
      ],
      capstone: {
        type: String,
        default: '',
      },
      nextNodes: {
        type: [String],
        default: [],
      }
    }
  ],
  analytics: {
    views: { type: Number, default: 0 },
    startedUsers: { type: Number, default: 0 },
    completedUsers: { type: Number, default: 0 },
    averageCompletionTime: { type: String, default: '' },
    averageQuizScore: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
