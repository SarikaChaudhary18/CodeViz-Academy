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
const roadmapRoutes = require('./routes/roadmapRoutes');
const questRoutes = require('./routes/questRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const copilotRoutes = require('./routes/copilotRoutes');
const companyPrepRoutes = require('./routes/companyPrepRoutes');
const courseRoutes = require('./routes/courseRoutes');
const quizRoutes = require('./routes/quizRoutes');
const forgettingRoutes = require('./routes/forgettingRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Security configuration
app.use(helmet());
const port = process.env.PORT || 5050;
app.use(cors({
  origin: true,
  credentials: true
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
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Temporary Debug Route for checking dist assets
app.get('/api/debug-dist', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const distPath = path.join(__dirname, '../../frontend/dist');
  try {
    if (!fs.existsSync(distPath)) {
      return res.status(404).json({ error: 'dist folder does not exist', path: distPath });
    }
    const files = [];
    const scanDir = (dir) => {
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath);
        } else {
          files.push(path.relative(distPath, fullPath));
        }
      });
    };
    scanDir(distPath);
    res.json({ path: distPath, files });
  } catch (err) {
    res.status(500).json({ error: err.message, path: distPath });
  }
});

// App API limiter
app.use('/api', apiLimiter);

// Routing paths
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/sheets', sheetRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/company-prep', companyPrepRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/forgetting-prediction', forgettingRoutes);
app.use('/api/ai', aiRoutes);

// Global centrally-managed error handler
app.use(errorHandler);

// Serve frontend (statically in production, via proxy in development)
const path = require('path');

if (process.env.NODE_ENV === 'development') {
  // In development, proxy non-API requests to the Vite dev server (port 3000)
  const { createProxyMiddleware } = require('http-proxy-middleware');
  const devProxy = createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true,
    logLevel: 'error',
    onProxyReq: (proxyReq, req, res) => {
      const targetHost = 'localhost:3000';
      if (req.headers.referer) {
        proxyReq.setHeader('referer', req.headers.referer.replace(req.headers.host, targetHost));
      }
      if (req.headers.origin) {
        proxyReq.setHeader('origin', req.headers.origin.replace(req.headers.host, targetHost));
      }
    }
  });

  app.set('devProxy', devProxy);

  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      devProxy(req, res, next);
    } else {
      next();
    }
  });
} else {
  // Serve frontend statically from production build folder
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
        if (err) {
          next();
        }
      });
    } else {
      next();
    }
  });
}

module.exports = app;
