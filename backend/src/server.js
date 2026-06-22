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
require('dotenv').config();

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

      // Start background scraper scheduler & seeders
      if (process.env.NODE_ENV !== 'production' || (cluster.worker && cluster.worker.id === 1)) {
        startHackathonScraper();
        triggerDsaSeeding().catch(err => logger.error('DSA Seeding failed: ' + err.message));
        triggerRoadmapSeeding().catch(err => logger.error('Roadmap Seeding failed: ' + err.message));
      }

      const server = http.createServer(app);

      // Initialize Socket.io WebSockets
      initializeSocket(server);

      server.listen(PORT, () => {
        logger.info(`Worker process ${process.pid} started. Server running on port ${PORT}`);
      });
    } catch (err) {
      logger.error(`Failed to launch server on worker process ${process.pid}: ${err.message}`);
      process.exit(1);
    }
  };

  startServer();
}
