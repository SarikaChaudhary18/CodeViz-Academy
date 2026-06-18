const http = require('http');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const app = require('./app');
const connectDB = require('./config/db');
const { initializeSocket } = require('./utils/socket');
const logger = require('./config/logger');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  logger.info(`Primary process ${process.pid} is running.`);
  logger.info(`Forking server workers for ${numCPUs} CPU cores...`);

  // Fork workers matching CPU count
  for (let i = 0; i < numCPUs; i++) {
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
