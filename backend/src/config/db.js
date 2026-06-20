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
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyquest';
  
  const options = {
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 100,
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 10,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
  };

  try {
    mongoose.connection.on('connecting', () => {
      logger.info('Connecting to MongoDB...');
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

    await mongoose.connect(mongoURI, options);
    // Seed default user
    await seedDefaultUser();
    
    // Seed default communities
    const defaultUser = await User.findOne({ email: 'operator@studyquest.io' });
    if (defaultUser) {
      await seedDefaultCommunities(defaultUser);
    }
  } catch (err) {
    logger.error('Initial MongoDB connection failed: %s', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
