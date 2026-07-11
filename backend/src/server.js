// Entry point for clustered server
require('dotenv').config();
if (process.env.RENDER === 'true') {
  process.env.NODE_ENV = 'production';
}
const http = require('http');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const app = require('./app');
const connectDB = require('./config/db');
const { initializeSocket } = require('./utils/socket');
const { startHackathonScraper } = require('./utils/hackathonScraper');
const { triggerDsaSeeding } = require('./utils/dsaScraper');
const { triggerRoadmapSeeding } = require('./utils/roadmapScraper');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  logger.info(`Primary process ${process.pid} is running.`);

  // Guard against excessive worker spawning on shared container hosts (Render free tier limit is 512MB RAM)
  const maxWorkers = parseInt(process.env.MAX_WORKERS, 10) || 2;
  const numWorkers = Math.min(numCPUs, maxWorkers);

  logger.info(`Forking ${numWorkers} server workers (capped by MAX_WORKERS of ${maxWorkers} from raw CPU count ${numCPUs})...`);

  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  // Monitor crashed workers and spawn replacements (self-healing)
  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker process ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
    logger.info('Spawning replacement worker process...');
    cluster.fork();
  });

} else {
  // Start server on worker threads (or single process in development)
  const startServer = async () => {
    try {
      // Connect to MongoDB connection pool
      await connectDB();

      const server = http.createServer(app);

      // Initialize Socket.io WebSockets
      initializeSocket(server);

      // Forward WebSocket upgrade requests to the dev proxy in development
      if (process.env.NODE_ENV === 'development') {
        const devProxy = app.get('devProxy');
        if (devProxy) {
          server.on('upgrade', (req, socket, head) => {
            if (!req.url.startsWith('/socket.io')) {
              devProxy.upgrade(req, socket, head);
            }
          });
        }
      }

      server.listen(PORT, '0.0.0.0', () => {
        logger.info(`Worker process ${process.pid} started. Server running on port ${PORT}`);

        // Defer background scraper scheduler & seeders to avoid blocking startup / Render health checks
        if (process.env.NODE_ENV !== 'production' || (cluster.worker && cluster.worker.id === 1)) {
          const startupDelay = process.env.NODE_ENV === 'production' ? 15000 : 2000; // 15s in prod, 2s in dev
          setTimeout(() => {
            logger.info(`Starting deferred background jobs (scrapers & seeders) after ${startupDelay}ms...`);
            startHackathonScraper();
            triggerDsaSeeding().catch(err => logger.error('DSA Seeding failed: ' + err.message));
            triggerRoadmapSeeding().catch(err => logger.error('Roadmap Seeding failed: ' + err.message));
          }, startupDelay);
        }
      });
    } catch (err) {
      logger.error(`Failed to launch server on worker process ${process.pid}: ${err.message}`);
      process.exit(1);
    }
  };

  startServer();
}
