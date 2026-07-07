const mongoose = require('mongoose');
const logger = require('./logger');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedDefaultUser = async () => {
  try {
    const defaultEmail = 'operator@studyquest.io';
    const existingUser = await User.findOne({ email: defaultEmail });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await User.create({
        username: 'operator',
        email: defaultEmail,
        password: hashedPassword,
        targetRole: 'Fullstack Developer',
        targetCompany: 'Google',
        streak: 5,
        xp: 1500,
        level: 2
      });
      logger.info('Default user seeded successfully (operator@studyquest.io / password123).');
    }
  } catch (err) {
    logger.error('Failed to seed default user: %s', err.message);
  }
};

const cleanupSeededData = async () => {
  try {
    const Community = require('../models/Community');
    const operatorUser = await User.findOne({ email: 'operator@studyquest.io' });
    if (operatorUser) {
      const seededNames = ['general-lobby', 'algorithms-dsa', 'system-design', 'mock-sandbox', 'resume-audit'];
      const result = await Community.deleteMany({ name: { $in: seededNames }, createdBy: operatorUser._id });
      await User.deleteOne({ _id: operatorUser._id });
      logger.info(`Cleanup: Removed ${result.deletedCount} seeded communities and operator user.`);
    }
  } catch (err) {
    logger.error('Failed to cleanup seeded data: %s', err.message);
  }
};

const seedDefaultCommunities = async (defaultUser) => {

  try {
    const Community = require('../models/Community');
    const defaultSectors = [
      { name: 'general-lobby', description: 'General announcements and open discussions.', category: 'general' },
      { name: 'algorithms-dsa', description: 'Solving algorithms and DSA sheet checklist alignment.', category: 'leetcode' },
      { name: 'system-design', description: 'Architecture patterns and system scalability discussions.', category: 'squads' },
      { name: 'mock-sandbox', description: 'Mock interview alignment and peer coding practice.', category: 'company-prep' },
      { name: 'resume-audit', description: 'Resume reviews and CV feedback exchange.', category: 'other' }
    ];

    for (const sector of defaultSectors) {
      const existing = await Community.findOne({ name: sector.name });
      if (!existing) {
        await Community.create({
          name: sector.name,
          description: sector.description,
          category: sector.category,
          createdBy: defaultUser._id,
          members: [defaultUser._id]
        });
        logger.info(`Seeded community sector: #${sector.name}`);
      }
    }
  } catch (err) {
    logger.error('Failed to seed default communities: %s', err.message);
  }
};

const seedCourses = async () => {
  try {
    const Course = require('../models/Course');
    
    // Remove the deprecated courses if they exist
    const titlesToRemove = [
      "Advanced DSA Masterclass",
      "Full-Stack Next.js Developer",
      "System Design Fundamentals",
      "Modern UI/UX with Tailwind & Framer Motion"
    ];
    const deleteResult = await Course.deleteMany({ title: { $in: titlesToRemove } });
    if (deleteResult.deletedCount > 0) {
      logger.info(`Removed ${deleteResult.deletedCount} deprecated courses from database.`);
    }

    const coursesAsset = require('./assets/courses.json');
    
    for (const courseData of coursesAsset) {
      const existing = await Course.findOne({ title: courseData.title });
      if (!existing) {
        await Course.create(courseData);
        logger.info(`Seeded Course: ${courseData.title}`);
      }
    }
  } catch (err) {
    logger.error('Failed to seed/clean courses: %s', err.message);
  }
};

const seedQuizzes = async () => {
  try {
    const Quiz = require('../models/Quiz');
    const quizzesAsset = require('./assets/quizzes.json');
    const fs = require('fs');
    const path = require('path');
    
    for (const quizData of quizzesAsset) {
      const existing = await Quiz.findOne({ topic: quizData.topic });
      if (!existing) {
        quizData.questionsCount = quizData.questions ? quizData.questions.length : 0;
        await Quiz.create(quizData);
        logger.info(`Seeded default Quiz topic: ${quizData.topic} (${quizData.questionsCount} questions)`);
      }
    }

    // Seed subtopic quizzes recursively from config/assets/subtopic_quizzes/
    const subtopicDir = path.join(__dirname, 'assets', 'subtopic_quizzes');
    if (fs.existsSync(subtopicDir)) {
      const categories = fs.readdirSync(subtopicDir);
      for (const cat of categories) {
        const catPath = path.join(subtopicDir, cat);
        if (!fs.statSync(catPath).isDirectory()) continue;
        
        const files = fs.readdirSync(catPath);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          
          const filePath = path.join(catPath, file);
          try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const rawQuiz = JSON.parse(fileContent);
            
            if (!rawQuiz.topic || !rawQuiz.questions) continue;
            
            // Create a safe, unique URL slug for the topic
            const slug = rawQuiz.topic
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/(^_+|_+$)/g, '');
              
            const existing = await Quiz.findOne({ topic: slug });
            const answerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
            const mappedQuestions = rawQuiz.questions
              .filter(q => q && q.question && q.options && q.options.A && q.options.B && q.options.C && q.options.D && q.correctAnswer)
              .map(q => ({
                q: q.question,
                options: [q.options.A, q.options.B, q.options.C, q.options.D],
                answer: answerMap[q.correctAnswer.trim().toUpperCase()] ?? 0
              }));
            
            if (!existing) {
              await Quiz.create({
                title: rawQuiz.topic,
                topic: slug,
                questionsCount: mappedQuestions.length,
                difficulty: 'Medium',
                questions: mappedQuestions
              });
              logger.info(`Seeded Subtopic Quiz: ${rawQuiz.topic} (${mappedQuestions.length} questions)`);
            } else if (existing.questionsCount !== mappedQuestions.length) {
              existing.questions = mappedQuestions;
              existing.questionsCount = mappedQuestions.length;
              await existing.save();
              logger.info(`Updated Subtopic Quiz: ${rawQuiz.topic} to ${mappedQuestions.length} questions`);
            }
          } catch (err) {
            logger.error(`Failed to seed subtopic quiz from file ${file}: ${err.message}`);
          }
        }
      }
    }
  } catch (err) {
    logger.error('Failed to seed quizzes: %s', err.message);
  }
};

const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI;
  const localFallbackURI = 'mongodb://127.0.0.1:27017/studyquest';
  const mongoURI = primaryURI || localFallbackURI;
  
  const options = {
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 15,
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
  };

  const setupEventsAndConnect = async (uri) => {
    // Clear previous listeners to avoid duplicates
    mongoose.connection.removeAllListeners();

    mongoose.connection.on('connecting', () => {
      logger.info(`Connecting to MongoDB at ${uri.includes('@') ? 'Remote Cluster' : uri}...`);
    });

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error: %s', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnection...');
    });

    await mongoose.connect(uri, options);
  };

  try {
    await setupEventsAndConnect(mongoURI);
    // One-time cleanup: remove old seeded operator user and their communities
    await cleanupSeededData();
    // Note: Default user/community seeding removed — all data is user-generated
    await seedCourses();
    await seedQuizzes();
  } catch (err) {
    logger.error('Primary MongoDB connection failed: %s', err.message);
    
    // Attempt local fallback if primary URI was remote
    if (primaryURI && primaryURI !== localFallbackURI) {
      try {
        logger.info('Attempting fallback to local MongoDB...');
        await setupEventsAndConnect(localFallbackURI);
        await seedCourses();
        await seedQuizzes();
        return;
      } catch (fallbackErr) {
        logger.error('Fallback local MongoDB connection also failed: %s', fallbackErr.message);
      }
    }
    
    logger.error('CRITICAL: Could not connect to any MongoDB instance. Running server in OFFLINE/DEMO mode (database features will fail).');
  }
};

module.exports = connectDB;
