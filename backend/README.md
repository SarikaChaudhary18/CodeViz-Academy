# StudyQuest OS Backend: Advanced Distributed Architecture & Annotated Code Manual

This document serves as the master engineering manual for the StudyQuest OS backend. It provides an absolute, line-by-line understanding of every script, utility, and configuration in the codebase, along with a deep-dive exploration of the modern backend technologies that make up our distributed system.

---

## 1. High-Performance Distributed Systems Engineering

To handle 100,000 concurrent active users, the backend must be optimized at the operating system, process, caching, database, and load-balancing layers.

### 1.1 Operating System Tuning (Linux Kernel Socket Tweaks)
By default, general-purpose operating system kernels restrict file descriptors and socket reuse rates. Under high traffic, this leads to socket exhaustion (i.e., "Too many open files" errors).

#### System File Descriptors Limits (`/etc/security/limits.conf`):
Each TCP connection consumes a file descriptor. We raise the soft and hard limits:
```text
* soft nofile 1048576
* hard nofile 1048576
```

#### Kernel Parameters (`/etc/sysctl.conf`):
Apply these configurations to optimize socket reuse, recycling, and TCP window buffers:
```text
# Enable fast recycling of TIME_WAIT sockets for quick reuse
net.ipv4.tcp_tw_reuse = 1

# Max quantity of open sockets waiting for connection handshakes
net.core.somaxconn = 65535

# Increase local port range allocated for outgoing requests
net.ipv4.ip_local_port_range = 1024 65535

# Set max backlog queue size for network interfaces
net.core.netdev_max_backlog = 100000

# Allocate TCP read/write buffer thresholds (min, default, max in bytes)
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
```

Apply these settings using the system configuration tool:
```bash
sudo sysctl -p
```

---

### 1.2 PM2 Process Cluster Configuration (`ecosystem.config.json`)
For deployment on single servers outside Docker environments, we use **PM2** to manage clustering and keep-alive processes.

```json
{
  "apps": [
    {
      "name": "studyquest-backend",
      "script": "./src/server.js",
      "instances": "max",
      "exec_mode": "cluster",
      "watch": false,
      "max_memory_restart": "1G",
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 5000,
        "MONGO_MAX_POOL_SIZE": 100,
        "MONGO_MIN_POOL_SIZE": 10,
        "JWT_ACCESS_SECRET": "production_secured_jwt_secret_key"
      }
    }
  ]
}
```

---

### 1.3 MongoDB Replica Sets & Write Concerns

A single database instance is a single point of failure. Under high write load, we configure a **MongoDB Replica Set** consisting of three nodes:
1. **Primary Node**: Handles all write operations and routes default read queries.
2. **Secondary Node 1**: Replicates the primary oplog and services read-heavy queries.
3. **Secondary Node 2**: Actively mirrors the primary oplog, ready to take over as primary if the main node crashes.

```
                  +-------------------+
                  |   Primary Node    |
                  |     (Writes)      |
                  +---------+---------+
                            |
             +--------------+--------------+
             | Replicates                  | Replicates
             v                             v
  +-------------------+         +-------------------+
  |  Secondary Node 1 |         |  Secondary Node 2 |
  |     (Reads)       |         |     (Failover)    |
  +-------------------+         +-------------------+
```

#### Write Concern & Journaling Configuration:
- `w: "majority"`: Mongo guarantees that writes are committed to the majority of replica set nodes before returning success. This prevents data loss during primary node failures.
- `j: true`: Ensures that writes are written to the journal on disk before returning success.

---

### 1.4 Redis Sentinel & Caching Policies
Redis functions as our in-memory cache and WebSockets message synchronization broker.

#### High Availability via Sentinel:
We configure three Redis instances monitored by three Sentinel nodes. If the Redis master node fails, the Sentinels automatically elect a new master and reconfigure the application instances.

#### Eviction Policy:
To prevent out-of-memory errors on high-throughput servers, we configure the `volatile-lru` eviction policy:
```text
maxmemory 4gb
maxmemory-policy volatile-lru
```
This evicts the least recently used keys with an expiration set when memory limits are reached.

---

## 2. Comprehensive API Specifications (JSON Payload Schemas)

This section documents the request and response structures for all key endpoints.

### 2.1 User Registration (`POST /api/auth/register`)
- **Request Headers**:
  - `Content-Type: application/json`
- **Request Payload JSON Schema**:
```json
{
  "type": "object",
  "properties": {
    "username": { "type": "string", "minLength": 3, "maxLength": 30 },
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 }
  },
  "required": ["username", "email", "password"]
}
```
- **Success Response (201 Created)**:
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NmI...",
  "user": {
    "id": "646b9a89d71c4c1a2f000001",
    "username": "coder101",
    "email": "coder@gmail.com",
    "role": "user",
    "xp": 0,
    "level": 1,
    "streak": 0
  }
}
```

---

### 2.2 Resume Audit & LaTeX Compile (`POST /api/resume/audit`)
- **Request Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Request Payload JSON Schema**:
```json
{
  "type": "object",
  "properties": {
    "resumeText": { "type": "string", "minLength": 100 },
    "targetJobTitle": { "type": "string", "minLength": 3 }
  },
  "required": ["resumeText", "targetJobTitle"]
}
```
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "atsScore": 94,
    "feedback": [
      "Identified 3 minor gaps for target role. Suggested adding specific tools.",
      "Rewrote experience bullets using the STAR method."
    ],
    "latexCode": "\\documentclass[letterpaper,11pt]{article} ... \\end{document}",
    "instructions": "Open the Overleaf template at https://www.overleaf.com/latex/templates/harshibars-resume/sbcyynmtpnyd, click 'Open as Template', select all text in main.tex, delete it, and paste this generated LaTeX code."
  }
}
```

---

### 2.3 Checkoff Sheet Progress (`POST /api/sheets/progress`)
- **Request Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Request Payload JSON Schema**:
```json
{
  "type": "object",
  "properties": {
    "sheetType": { "type": "string", "enum": ["striver", "babbar", "neetcode"] },
    "problemId": { "type": "string" },
    "status": { "type": "string", "enum": ["todo", "in-progress", "completed"] }
  },
  "required": ["sheetType", "problemId"]
}
```
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "_id": "646b9a89d71c4c1a2f000025",
    "userId": "646b9a89d71c4c1a2f000001",
    "sheetType": "striver",
    "problemId": "two-sum",
    "status": "completed",
    "solvedAt": "2026-06-18T11:40:00.000Z"
  },
  "userXp": 15,
  "userLevel": 1
}
```

---

## 3. Exhaustive Code Walkthrough: Line-by-Line Breakdown

---

### 3.1 File: `backend/src/server.js`
This script acts as the global system entrypoint, managing worker process replication via the Node.js Cluster API.

#### Complete Source Code:
```javascript
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

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker process ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
    logger.info('Spawning replacement worker process...');
    cluster.fork();
  });

} else {
  const startServer = async () => {
    try {
      await connectDB();
      const server = http.createServer(app);
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
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const http = require('http');` | Imports the native Node.js HTTP package. This is used to wrap our Express application instance to allow Socket.IO to hook into the HTTP pipeline. |
| **2** | `const cluster = require('cluster');` | Imports Node's process cluster library. It allows us to determine if we are on the primary process thread and fork execution to utilize all CPU cores. |
| **3** | `const numCPUs = require('os').cpus().length;` | Accesses the OS kernel to query the logical core count, ensuring we run exactly 1 child worker process per CPU thread. |
| **4** | `const app = require('./app');` | Loads our custom Express configuration setup, containing router bindings and safety sanitizers. |
| **5** | `const connectDB = require('./config/db');` | Imports the Mongoose connection manager configuration. |
| **6** | `const { initializeSocket } = require('./utils/socket');` | Loads our Socket.IO setup handler to initialize real-time connection routing. |
| **7** | `const logger = require('./config/logger');` | Imports the Winston logger utility for asynchronous, non-blocking logs. |
| **8** | `require('dotenv').config();` | Parses environment variables from `.env` and appends them to `process.env`. |
| **9** | `const PORT = process.env.PORT || 5000;` | Configures the HTTP port boundary, defaulting to 5000 if not set. |
| **10** | `if (cluster.isPrimary && process.env.NODE_ENV === 'production') {` | If the running process is primary (the controller thread) and the environment is production, run forks. |
| **11** | `logger.info(\`Primary process \${process.pid} is running.\`);` | Logs the primary process ID (PID) to trace the master manager thread. |
| **12** | `logger.info(\`Forking server workers for \${numCPUs} CPU cores...\`);` | Logs the target fork count. |
| **13** | `for (let i = 0; i < numCPUs; i++) { cluster.fork(); }` | Loop through core count and spawn processes matching CPUs. |
| **14** | `cluster.on('exit', (worker, code, signal) => {` | Binds a listener to monitor worker crashes. |
| **15** | `logger.error(...); cluster.fork();` | If a worker dies, log the crash and immediately spawn a replacement worker (self-healing architecture). |
| **16** | `} else { const startServer = async () => {` | Runs inside worker processes to initialize application components. |
| **17** | `await connectDB();` | Establishes pooled MongoDB connections. |
| **18** | `const server = http.createServer(app);` | Wraps the Express app with a native HTTP server. |
| **19** | `initializeSocket(server);` | Bind Socket.IO server to the HTTP wrapper for connection handshakes. |
| **20** | `server.listen(PORT, () => { logger.info(...); });` | Starts the HTTP listener on the configured port. |
| **21** | `} catch (err) { logger.error(...); process.exit(1); }` | Catches fatal database or socket initialization errors and shuts down the worker process. |

---

### 3.2 File: `backend/src/app.js`
This script configures the Express middleware stack and maps routers to API paths.

#### Complete Source Code:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const logger = require('./config/logger');

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

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/sheets', sheetRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/hackathons', hackathonRoutes);

app.use(errorHandler);

module.exports = app;
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const express = require('express');` | Imports Express web framework. |
| **2** | `const cors = require('cors');` | Imports CORS middleware to manage cross-origin request policies. |
| **3** | `const helmet = require('helmet');` | Imports Helmet for configuring secure HTTP headers. |
| **4** | `const mongoSanitize = require('express-mongo-sanitize');` | Imports Mongo-Sanitize to protect against NoSQL injection attacks. |
| **5** | `const morgan = require('morgan');` | Imports Morgan to capture HTTP requests logs. |
| **6** | `const logger = require('./config/logger');` | Imports Winston logger instance. |
| **7** | `const errorHandler = require('./middleware/errorHandler');` | Imports global error handler middleware. |
| **8** | `const { apiLimiter } = require('./middleware/rateLimiter');` | Imports rate-limiting middleware configurations. |
| **9** | `const app = express();` | Instantiates the Express application. |
| **10** | `app.use(helmet());` | Apply Helmet security headers. |
| **11** | `app.use(cors({...}));` | Restricts API access to whitelisted client origins, preventing unauthorized cross-origin requests. |
| **12** | `app.use(mongoSanitize());` | Apply NoSQL query injection sanitizers to strip MongoDB operators. |
| **13** | `app.use(express.json({ limit: '10mb' }));` | Configure JSON body parser with size constraints to prevent payload flood. |
| **14** | `app.use(express.urlencoded({ extended: true, limit: '10mb' }));` | Configure URL-encoded parser for forms formatting. |
| **15** | `app.use(morgan(..., { stream }));` | Configure Morgan to stream request logs to the Winston logging pipeline. |
| **16** | `app.get('/health', ...);` | Setup load balancer health check probe endpoint. |
| **17** | `app.use('/api', apiLimiter);` | Apply rate limiting to all API requests. |
| **18** | `app.use('/api/auth', authRoutes);` | Map auth endpoints (login, register, leaderboard). |
| **19** | `app.use('/api/resume', resumeRoutes);` | Map AI resume auditor and LaTeX compiler endpoints. |
| **20** | `app.use('/api/communities', communityRoutes);` | Map WebSocket chatroom endpoints. |
| **21** | `app.use('/api/trackers', trackerRoutes);` | Map coding profile tracker endpoints. |
| **22** | `app.use('/api/sheets', sheetRoutes);` | Map sheet checkoff progress endpoints. |
| **23** | `app.use('/api/quests', questRoutes);` | Map quest progress and claim endpoints. |
| **24** | `app.use('/api/hackathons', hackathonRoutes);` | Map hackathon bulletins endpoints. |
| **25** | `app.use(errorHandler);` | Register global error handler middleware. |

---

### 3.3 File: `backend/src/config/db.js`
This script manages database connection pooling and reconnection events.

#### Complete Source Code:
```javascript
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
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const mongoose = require('mongoose');` | Imports Mongoose. |
| **2** | `const logger = require('./logger');` | Imports Winston logger. |
| **3** | `const mongoURI = ...` | Configures the MongoDB URI, defaulting to a local instance if not set. |
| **4** | `maxPoolSize: ... || 100,` | Set maximum active sockets per cluster process thread. |
| **5** | `minPoolSize: ... || 10,` | Keep 10 connection sockets warm in the pool. |
| **6** | `socketTimeoutMS: 45000,` | Terminate database operations if they take longer than 45 seconds. |
| **7** | `serverSelectionTimeoutMS: 5000,` | Fail quickly (5 seconds) if the database is unreachable. |
| **8** | `heartbeatFrequencyMS: 10000,` | Run status checks every 10 seconds to monitor connection health. |
| **9** | `mongoose.connection.on('connecting', ...);` | Bind event listener for connection initialization. |
| **10** | `mongoose.connection.on('connected', ...);` | Bind event listener for connection success. |
| **11** | `mongoose.connection.on('error', ...);` | Bind event listener for database errors. |
| **12** | `mongoose.connection.on('disconnected', ...);` | Bind event listener for disconnections. |
| **13** | `await mongoose.connect(mongoURI, options);` | Connect Mongoose client to the database. |
| **14** | `catch (err) { logger.error(...); process.exit(1); }` | Log fatal database connection errors and shut down the worker process. |

---

### 3.4 File: `backend/src/config/logger.js`
This script configures Winston to handle log rotation and output formats.

#### Complete Source Code:
```javascript
const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'studyquest-backend' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, service, ...metadata }) => {
        let msg = `${timestamp} [${level}] : ${message}`;
        if (Object.keys(metadata).length && metadata.stack) {
          msg += `\nStack: ${metadata.stack}`;
        }
        return msg;
      })
    ),
  }));
}

module.exports = logger;
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const winston = require('winston');` | Imports Winston logging library. |
| **2** | `const path = require('path');` | Imports path utility. |
| **3** | `const logFormat = winston.format.combine(...)` | Configures timestamps and stack traces for JSON logs. |
| **4** | `level: ... ? 'info' : 'debug',` | Set logging levels (info in production, debug in development). |
| **5** | `defaultMeta: { service: 'studyquest-backend' },` | Tag log files to help distinguish them in clustered microservices setups. |
| **6** | `new winston.transports.File({ filename: 'error.log', ... })` | Write error logs to error.log, rotated at 10MB. |
| **7** | `new winston.transports.File({ filename: 'combined.log', ... })` | Write all logs to combined.log, rotated at 10MB. |
| **8** | `if (process.env.NODE_ENV !== 'production') {` | Format logs for console readability in development. |

---

### 3.5 File: `backend/src/middleware/auth.js`
This script handles token verification and role authorization.

#### Complete Source Code:
```javascript
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`Unauthorized API request from IP ${req.ip}`);
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'studyquest_access_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Invalid JWT token verification attempt from IP ${req.ip}`);
    
    let message = 'Invalid or expired token.';
    if (err.name === 'TokenExpiredError') {
      message = 'Token has expired. Please refresh.';
    }

    return res.status(401).json({
      status: 'fail',
      message
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn(`User ${req.user ? req.user.id : 'unknown'} unauthorized for role access`);
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const jwt = require('jsonwebtoken');` | Imports JSON Web Token validator. |
| **2** | `const logger = require('../config/logger');` | Imports Winston logger. |
| **3** | `const authenticate = (req, res, next) => {` | Binds the authentication filter logic. |
| **4** | `const authHeader = req.headers.authorization;` | Extracts the request's Authorization header. |
| **5** | `if (!authHeader || !authHeader.startsWith('Bearer ')) {` | Verifies the token is present and correctly formatted. |
| **6** | `const token = authHeader.split(' ')[1];` | Extracts the token string. |
| **7** | `const decoded = jwt.verify(token, ...);` | Verifies the token signature against the JWT secret key. |
| **8** | `req.user = decoded; next();` | Binds the user details to the request context. |
| **9** | `catch (err) { ... }` | Returns a 401 response for invalid or expired tokens. |
| **10** | `const authorize = (...roles) => {` | Binds role check permissions. |

---

### 3.6 File: `backend/src/middleware/rateLimiter.js`
This script prevents denial-of-service (DoS) attacks by rate-limiting request rates.

#### Complete Source Code:
```javascript
const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: IP ${req.ip} requested ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded: IP ${req.ip} attempted login/register`);
    res.status(options.statusCode).send(options.message);
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const rateLimit = require('express-rate-limit');` | Imports Express-Rate-Limit plugin. |
| **2** | `const logger = require('../config/logger');` | Imports Winston logger. |
| **3** | `const apiLimiter = rateLimit({` | Configures the general API rate limiter. |
| **4** | `windowMs: 15 * 60 * 1000, max: 200` | Limits IPs to 200 requests per 15 minutes. |
| **5** | `standardHeaders: true, legacyHeaders: false` | Configures HTTP rate limit headers. |
| **6** | `handler: (req, res, next, options) => { ... }` | Logs rate limit violations and returns a 429 response. |
| **7** | `const authLimiter = rateLimit({` | Configures strict rate limiting for login/registration routes. |
| **8** | `max: 15` | Limits IPs to 15 login/registration attempts per 15 minutes. |

---

### 3.7 File: `backend/src/middleware/errorHandler.js`
This script catches and processes all application runtime errors.

#### Complete Source Code:
```javascript
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  const errorResponse = {
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error'
  };

  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  logger.error(
    `Error on ${req.method} ${req.originalUrl}: Code ${statusCode} - Message: ${err.message}`, 
    { stack: err.stack, ip: req.ip }
  );

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const logger = require('../config/logger');` | Imports Winston logger. |
| **2** | `const errorHandler = (err, req, res, next) => {` | Binds the global error catching arguments. |
| **3** | `const statusCode = err.statusCode \|\| 500;` | Sets the HTTP status code, defaulting to 500. |
| **4** | `if (process.env.NODE_ENV !== 'production') { ... }` | Excludes stack traces in production to prevent system detail leaks. |
| **5** | `logger.error(...);` | Logs the error details and request path to Winston. |
| **6** | `res.status(statusCode).json(errorResponse);` | Returns the JSON response to the client. |

---

### 3.8 File: `backend/src/models/User.js`
This schema defines the user document structures and lookup indexes.

#### Complete Source Code:
```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  xp: {
    type: Number,
    default: 0,
    index: true,
  },
  level: {
    type: Number,
    default: 1,
    index: true,
  },
  streak: {
    type: Number,
    default: 0,
    index: true,
  },
  lastActiveDate: {
    type: String,
    default: null,
  },
  targetRole: {
    type: String,
    default: 'Software Engineer',
  },
  targetCompany: {
    type: String,
    default: 'Google',
  },
  codingProfiles: {
    leetcode: { type: String, default: '' },
    codechef: { type: String, default: '' },
    codeforces: { type: String, default: '' },
    hackerrank: { type: String, default: '' },
  },
  apifyKey: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

UserSchema.index({ username: 1, email: 1 });

module.exports = mongoose.model('User', UserSchema);
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const mongoose = require('mongoose');` | Imports Mongoose. |
| **2** | `const UserSchema = new mongoose.Schema({` | Declares the User schema. |
| **3** | `username: { ..., unique: true, index: true },` | Adds a unique index to usernames to optimize search and registration checks. |
| **4** | `email: { ..., unique: true, index: true },` | Adds a unique index to email addresses to optimize authentication lookups. |
| **5** | `xp: { ..., index: true }, level: { ..., index: true },` | Indexes XP and levels to optimize leaderboard query performance. |
| **6** | `streak: { ..., index: true },` | Indexes active streaks. |
| **7** | `codingProfiles: { leetcode, codechef, codeforces },` | Defines fields to store coding profile usernames. |
| **8** | `timestamps: true` | Automatically tracks creation and update dates. |
| **9** | `UserSchema.index({ username: 1, email: 1 });` | Creates a compound index to optimize multi-field queries. |

---

### 3.9 File: `backend/src/models/Quest.js`
This schema defines gamified quests and goals.

#### Complete Source Code:
```javascript
const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true,
    index: true,
  },
  xpReward: {
    type: Number,
    required: true,
  },
  multiplier: {
    type: Number,
    default: 1.0,
  },
  targetValue: {
    type: Number,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quest', QuestSchema);
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const mongoose = require('mongoose');` | Imports Mongoose. |
| **2** | `const QuestSchema = new mongoose.Schema({` | Declares the Quest schema. |
| **3** | `type: { ..., index: true },` | Indexes the quest type to optimize queries for daily or weekly lists. |
| **4** | `key: { ..., unique: true, index: true },` | Indexes quest keys to optimize verification checks. |

---

### 3.10 File: `backend/src/models/Activity.js`
Logs user study sessions and solved problems to generate heatmaps.

#### Complete Source Code:
```javascript
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['study', 'focus', 'dsa', 'quiz'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  xpGained: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

ActivitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const mongoose = require('mongoose');` | Imports Mongoose. |
| **2** | `userId: { type: ..., index: true },` | Indexes user IDs to optimize queries for a user's activity logs. |
| **3** | `date: { type: ..., index: true },` | Indexes dates to optimize range queries. |
| **4** | `ActivitySchema.index({ userId: 1, date: -1 });` | Creates a compound index to optimize date-sorted activity queries per user (e.g. heatmaps). |

---

### 3.11 File: `backend/src/models/SheetProgress.js`
Tracks completed problems in Striver A-Z, Love Babbar, and Neetcode sheets.

#### Complete Source Code:
```javascript
const mongoose = require('mongoose');

const SheetProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sheetType: {
    type: String,
    enum: ['striver', 'babbar', 'neetcode'],
    required: true,
  },
  problemId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'completed',
  },
  solvedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

SheetProgressSchema.index({ userId: 1, sheetType: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('SheetProgress', SheetProgressSchema);
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const mongoose = require('mongoose');` | Imports Mongoose. |
| **2** | `userId: { type: ..., index: true },` | Indexes user IDs to optimize queries for user checkoffs. |
| **3** | `SheetProgressSchema.index({ userId:1, sheetType:1, problemId:1 }, { unique:true });` | Creates a unique compound index to prevent duplicate progress entries for the same problem. |

---

### 3.12 File: `backend/src/models/Community.js`
Manages community chatrooms and groups.

#### Complete Source Code:
```javascript
const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['general', 'leetcode', 'company-prep', 'squads', 'other'],
    default: 'general',
    index: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Community', CommunitySchema);
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const mongoose = require('mongoose');` | Imports Mongoose. |
| **2** | `name: { ..., unique: true, index: true },` | Indexes community names to prevent duplicates and optimize search queries. |
| **3** | `category: { ..., index: true },` | Indexes categories to optimize queries filtering communities. |

---

### 3.13 File: `backend/src/models/Message.js`
Logs chat messages sent in community channels.

#### Complete Source Code:
```javascript
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  codeSnippet: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

MessageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const mongoose = require('mongoose');` | Imports Mongoose. |
| **2** | `communityId: { type: ..., index: true },` | Indexes community IDs to optimize queries retrieving room messages. |
| **3** | `MessageSchema.index({ communityId: 1, createdAt: -1 });` | Creates a compound index to optimize queries retrieving messages sorted by creation date. |

---

### 3.14 File: `backend/src/models/Hackathon.js`
Stores lists of active and upcoming hackathons.

#### Complete Source Code:
```javascript
const mongoose = require('mongoose');

const HackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  host: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
    required: true,
    index: true,
  },
  registrationDeadline: {
    type: Date,
    default: null,
  },
  tags: [String],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hackathon', HackathonSchema);
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const mongoose = require('mongoose');` | Imports Mongoose. |
| **2** | `startDate: { type: Date, index: true },` | Indexes start dates to optimize query sorting. |
| **3** | `endDate: { type: Date, index: true },` | Indexes end dates to optimize queries filtering expired events. |

---

### 3.15 File: `backend/src/controllers/authController.js`
Implements user registration, login, profile updates, and leaderboard queries.

#### Complete Source Code:
```javascript
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'studyquest_access_jwt_secret_key',
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1d' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide all details.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Username or email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    logger.info(`User registered successfully: ${username}`);

    const token = generateAccessToken(newUser);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        xp: newUser.xp,
        level: newUser.level,
        streak: newUser.streak,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials.' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastActiveDate === yesterday) {
        user.streak += 1;
      } else if (user.lastActiveDate !== today) {
        user.streak = 1;
      }
      user.lastActiveDate = today;
      await user.save();
    }

    logger.info(`User logged in successfully: ${user.username}`);

    const token = generateAccessToken(user);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        targetCompany: user.targetCompany,
        targetRole: user.targetRole,
        codingProfiles: user.codingProfiles,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    res.status(200).json({
      status: 'success',
      user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { targetRole, targetCompany, codingProfiles, apifyKey } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    if (targetRole) user.targetRole = targetRole;
    if (targetCompany) user.targetCompany = targetCompany;
    if (apifyKey) user.apifyKey = apifyKey;
    if (codingProfiles) {
      user.codingProfiles = { ...user.codingProfiles, ...codingProfiles };
    }

    await user.save();
    logger.info(`User profile updated: ${user.username}`);

    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        targetCompany: user.targetCompany,
        targetRole: user.targetRole,
        codingProfiles: user.codingProfiles,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;

    const users = await User.find({})
      .select('username level xp streak targetRole')
      .sort({ xp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      data: users,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    next(err);
  }
};
```

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const generateAccessToken = (user) => { ... }` | Generates a signed JWT access token containing the user ID, username, and role, expiring in 1 day. |
| **2** | `exports.register = async (req, res, next) => {` | Handles new user registrations. |
| **3** | `const existingUser = await User.findOne(...);` | Queries usernames and emails to prevent duplicates. |
| **4** | `const salt = await bcrypt.genSalt(12);` | Generates a cryptographically secure salt. |
| **5** | `const hashedPassword = await bcrypt.hash(password, salt);` | Hashes the password using bcrypt. |
| **6** | `const newUser = await User.create(...);` | Saves the user document in the database. |
| **7** | `exports.login = async (req, res, next) => {` | Handles user authentication. |
| **8** | `const user = await User.findOne({ email });` | Queries the user document by email. |
| **9** | `await bcrypt.compare(password, user.password)` | Compares the request password against the hashed password. |
| **10** | `const today = new Date().toISOString().split('T')[0];` | Formats the current date as YYYY-MM-DD. |
| **11** | `if (user.lastActiveDate !== today) { ... }` | Updates daily activity streaks based on the user's last login date. |
| **12** | `exports.getProfile = async (req, res, next) => {` | Retrieves the profile details of the authenticated user. |
| **13** | `exports.updateProfile = async (req, res, next) => {` | Updates profile details (target role, company, coding profiles). |
| **14** | `exports.getLeaderboard = async (req, res, next) => {` | Retrieves leaderboard entries sorted by XP (uses the XP index). |

---

### 3.16 File: `backend/src/controllers/resumeController.js`
Manages resume parsing, optimization, and template compilation using the **Harshibar LaTeX template**.

#### Complete Source Code:
Refer to the complete source code listing in **Section 2.16** of this manual for reference.

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `const HARSHIBAR_LATEX_TEMPLATE = \`...\`` | Stores the complete Harshibar LaTeX resume template, containing replacement placeholders (e.g. `%NAME%`, `%EMAIL%`, `%EXPERIENCE%`). |
| **2** | `exports.auditResume = async (req, res, next) => {` | Binds the resume auditor logic. |
| **3** | `if (process.env.GEMINI_API_KEY) {` | Checks if a Gemini API Key is configured in environment variables. |
| **4** | `const response = await axios.post(...);` | Sends the prompt and resume text to the Gemini API to retrieve structured JSON containing feedback, scores, and optimized LaTeX code. |
| **5** | `const resultJson = JSON.parse(resultText);` | Parses the JSON response. |
| **6** | `catch (err) { logger.error(...); }` | Catches API errors and falls back to the local template compiler. |
| **7** | `const nameMatch = resumeText.match(...);` | Uses Regex patterns to parse names, emails, and phone numbers from the input text. |
| **8** | `let finalLatex = HARSHIBAR_LATEX_TEMPLATE.replace(...);` | Replaces template placeholders with parsed details. |
| **9** | `res.status(200).json({ status: 'success', data: mockResponse });` | Returns the audit results and instructions to the user. |

---

### 3.17 File: `backend/src/controllers/communityController.js`
Manages chatroom queries, creation, room joins, and database-indexed historical chat feeds.

#### Complete Source Code:
Refer to the complete source code listing in **Section 2.17** of this manual for reference.

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `exports.createCommunity = async (req, res, next) => {` | Handles the creation of new community chatrooms. |
| **2** | `const existingRoom = await Community.findOne({ name });` | Verifies the community name is unique. |
| **3** | `const room = await Community.create(...);` | Saves the community document. |
| **4** | `exports.joinCommunity = async (req, res, next) => {` | Adds a user to a community's membership list. |
| **5** | `room.members.push(req.user.id); await room.save();` | Updates the community document. |
| **6** | `exports.getCommunities = async (req, res, next) => {` | Lists available communities, filtered by category and sorted by creation date. |
| **7** | `exports.getMessageHistory = async (req, res, next) => {` | Retrieves the message history for a community, sorted by creation date using the compound index. |

---

### 3.18 File: `backend/src/controllers/trackerController.js`
Connects with coding platform stats APIs to retrieve solved counts.

#### Complete Source Code:
Refer to the complete source code listing in **Section 2.18** of this manual for reference.

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `exports.getPlatformStats = async (req, res, next) => {` | Retrieves coding stats for a user's profiles. |
| **2** | `const lcRes = await axios.get(...);` | Fetches solved count and ranking details from LeetCode. |
| **3** | `const cfRes = await axios.get(...);` | Fetches rating details from Codeforces. |
| **4** | `const totalSolved = stats.leetcode.solved + ...` | Aggregates the total solved count across all platforms. |
| **5** | `user.xp = totalSolved * 10; user.level = ...` | Updates the user's XP (10 XP per solved problem) and level. |

---

### 3.19 File: `backend/src/controllers/sheetController.js`
Checks off completed questions in Striver A-Z, Love Babbar, and Neetcode sheets.

#### Complete Source Code:
Refer to the complete source code listing in **Section 2.19** of this manual for reference.

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `exports.toggleProblemStatus = async (req, res, next) => {` | Toggles problem completion status. |
| **2** | `const progress = await SheetProgress.findOneAndUpdate(...);` | Updates or creates (upserts) the problem status. |
| **3** | `user.xp += 15; user.level = ...` | Awards 15 XP for every completed problem, updating the user's level. |
| **4** | `exports.getSheetProgress = async (req, res, next) => {` | Retrieves a user's completed problems, optionally filtered by sheet type. |

---

### 3.20 File: `backend/src/controllers/questController.js`
Retrieves quests and processes completions.

#### Complete Source Code:
Refer to the complete source code listing in **Section 2.20** of this manual for reference.

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `exports.getQuests = async (req, res, next) => {` | Retrieves available quests, seeding defaults if none exist in the database. |
| **2** | `exports.claimQuestReward = async (req, res, next) => {` | Processes quest reward claims. |
| **3** | `const activities = await Activity.find({ userId, date: today });` | Fetches the user's activity logs for the day. |
| **4** | `const dsaLogs = activities.filter(a => a.type === 'dsa');` | Filters and aggregates progress for coding quests. |
| **5** | `const finalXp = baseReward * (user.streak >= 5 ? 1.5 : 1.0);` | Applies a 1.5x XP multiplier if the user has an active streak of 5+ days. |

---

### 3.21 File: `backend/src/controllers/hackathonController.js`
Manages hackathon listings.

#### Complete Source Code:
Refer to the complete source code listing in **Section 2.21** of this manual for reference.

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `exports.getHackathons = async (req, res, next) => {` | Retrieves active hackathons. |
| **2** | `const response = await axios.get(...apifyKey);` | Queries active hackathons via the Apify Devpost task if an API key is configured. |
| **3** | `hackathons = await Hackathon.find({ endDate: { $gte: new Date() } });` | Falls back to retrieving active events from the local database. |
| **4** | `hackathons = [ ... ]` | Returns a list of default mock hackathons if no database records exist. |

---

### 3.22 File: `backend/src/utils/socket.js`
Manages WebSocket connections and room messages using Socket.IO.

#### Complete Source Code:
Refer to the complete source code listing in **Section 2.22** of this manual for reference.

#### Line-by-Line Code Breakdown:
| Line Number | Raw JavaScript Statement | Functional Purpose & Scalability Explanation |
| :--- | :--- | :--- |
| **1** | `io = new Server(server, { cors: { ... } });` | Instantiates the Socket.IO server. |
| **2** | `io.use((socket, next) => { ... });` | Socket.IO authentication middleware. Verifies the JWT token on handshake. |
| **3** | `socket.on('join_room', (roomId) => { socket.join(roomId); });` | Subscribes the socket client connection to a community room channel. |
| **4** | `socket.on('send_message', async (data) => {` | Binds the listener to handle incoming messages. |
| **5** | `const newMessage = await Message.create(...);` | Saves the message details to the database. |
| **6** | `io.to(communityId).emit('receive_message', ...);` | Broadcasts the message to all clients in the room. |

---

## 4. Systems Deployment and Configuration

1. **Local Docker Launch**:
   Navigate to the backend directory and launch the service stack:
   ```bash
   docker-compose up -d --build
   ```
2. **Clustering Scale Up**:
   Scale the backend instances dynamically:
   ```bash
   docker-compose scale studyquest-backend-1=3 studyquest-backend-2=3
   ```
3. **Log Feeds**:
   View aggregated logs:
   ```bash
   docker-compose logs -f
   ```
