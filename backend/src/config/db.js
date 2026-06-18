const mongoose = require('mongoose');
const logger = require('./logger');

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
  } catch (err) {
    logger.error('Initial MongoDB connection failed: %s', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
