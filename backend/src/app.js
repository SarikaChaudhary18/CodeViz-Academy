const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const logger = require('./config/logger');

// Middleware & Routes
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const communityRoutes = require('./routes/communityRoutes');
const trackerRoutes = require('./routes/trackerRoutes');
const sheetRoutes = require('./routes/sheetRoutes');
const questRoutes = require('./routes/questRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');

const app = express();

// Security configuration
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Prevention against MongoDB Query Injection
app.use(mongoSanitize());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging configuration (Integration of Morgan with Winston)
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// App API limiter
app.use('/api', apiLimiter);

// Routing paths
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/sheets', sheetRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/hackathons', hackathonRoutes);

// Global centrally-managed error handler
app.use(errorHandler);

// Serve frontend statically from production build folder
const path = require('path');
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
      if (err) {
        // Continue if the file is missing (e.g. if build is not run yet)
        next();
      }
    });
  } else {
    next();
  }
});

module.exports = app;
