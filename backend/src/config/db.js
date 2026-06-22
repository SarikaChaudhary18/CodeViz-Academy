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
    await seedDefaultUser();
    
    const defaultUser = await User.findOne({ email: 'operator@studyquest.io' });
    if (defaultUser) {
      await seedDefaultCommunities(defaultUser);
    }
  } catch (err) {
    logger.error('Primary MongoDB connection failed: %s', err.message);
    
    // Attempt local fallback if primary URI was remote
    if (primaryURI && primaryURI !== localFallbackURI) {
      try {
        logger.info('Attempting fallback to local MongoDB...');
        await setupEventsAndConnect(localFallbackURI);
        await seedDefaultUser();
        
        const defaultUser = await User.findOne({ email: 'operator@studyquest.io' });
        if (defaultUser) {
          await seedDefaultCommunities(defaultUser);
        }
        return;
      } catch (fallbackErr) {
        logger.error('Fallback local MongoDB connection also failed: %s', fallbackErr.message);
      }
    }
    
    logger.error('CRITICAL: Could not connect to any MongoDB instance. Running server in OFFLINE/DEMO mode (database features will fail).');
  }
};

module.exports = connectDB;
