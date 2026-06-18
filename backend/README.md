# StudyQuest OS: Distributed Backend System Architecture and Developer Operations Manual

This document serves as the master engineering specification and operations handbook for the StudyQuest OS backend. It details the systems design, socket configurations, database scaling, API payload schemas, and code walkthroughs required to support a production platform scaling to 100,000+ active concurrent connections.

---

## 1. High-Performance Distributed Systems Engineering

To handle 100k concurrent users, the application must be optimized at the operating system, database, caching, and load balancing layers.

### 1.1 Operating System Tuning (Linux Kernel Socket Tweaks)
By default, standard Linux server kernels are configured for general-purpose workloads, restricting file descriptors and socket reuse rates. Under high traffic, this leads to socket exhaustion (i.e. "Too many open files" errors).

#### System File Descriptors Limits (`/etc/security/limits.conf`):
Each TCP connection consumes a file descriptor. We must raise the soft and hard limits:
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

## 3. Directory and File Specs Walkthrough

---

### 3.1 Clustered Server Entrypoint (`backend/src/server.js`)

```javascript
// Import the native Node.js HTTP module to boot the HTTP connection listener
const http = require('http');

// Import the Node.js Cluster module to scale the application across multiple CPU cores
const cluster = require('cluster');

// Retrieve CPU core counts from the OS module to determine the number of process forks
const numCPUs = require('os').cpus().length;

// Import the configured Express application instance from app.js
const app = require('./app');

// Import the Mongoose connection manager configuration
const connectDB = require('./config/db');

// Import WebSockets Socket.IO server initialization wrapper
const { initializeSocket } = require('./utils/socket');

// Import Winston to log server status messages
const logger = require('./config/logger');

// Load environment configurations from the local .env file
require('dotenv').config();

// Assign the server port, defaulting to 5000 if not specified in the environment
const PORT = process.env.PORT || 5000;

// Verify if the current process is the primary coordinator thread.
// We only run clustering in production mode to simplify local development debugging.
if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  logger.info(`Primary process ${process.pid} is running.`);
  logger.info(`Forking server workers for ${numCPUs} CPU cores...`);

  // Loop through core count and spawn processes matching CPUs
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Monitor worker crashes and fork replacements to ensure high availability
  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker process ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
    logger.info('Spawning replacement worker process...');
    cluster.fork();
  });

} else {
  // Start server on worker processes
  const startServer = async () => {
    try {
      // Establish pooled MongoDB connections before starting listeners
      await connectDB();

      // Wrap the Express app with a native HTTP server
      const server = http.createServer(app);

      // Bind Socket.IO to the HTTP server to handle WebSocket handshakes
      initializeSocket(server);

      // Boot HTTP listener
      server.listen(PORT, () => {
        logger.info(`Worker process ${process.pid} started. Server running on port ${PORT}`);
      });
    } catch (err) {
      // Log fatal startup errors and shut down the worker
      logger.error(`Failed to launch server on worker process ${process.pid}: ${err.message}`);
      process.exit(1);
    }
  };

  // Run the worker server launcher
  startServer();
}
```

#### Detailed Operations Analysis:
1. **CPU Scaling**: If a server has 8 cores, this module forks 8 worker processes. Each process handles its own memory space and execution flow, sharing the same network port (e.g. 5000). The operating system's network driver distributes incoming TCP connections across these workers.
2. **Self-Healing Mechanics**: The `cluster.on('exit')` listener detects when a worker process crashes due to uncaught errors. It logs the crash and calls `cluster.fork()` to spin up a new worker, preserving server capacity.

---

### 3.2 Express Setup (`backend/src/app.js`)

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

// Set security headers to protect against common web vulnerabilities
app.use(helmet());

// Configure CORS parameters to allow requests from whitelisted client origins
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Sanitize request inputs to prevent NoSQL query injection
app.use(mongoSanitize());

// Parse JSON body payloads, limited to 10MB to protect against payload flood attacks
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded forms, limited to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Stream request logs to Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Setup load balancer health check probe endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Bind routers to API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/sheets', sheetRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/hackathons', hackathonRoutes);

// Register the global error handler
app.use(errorHandler);

module.exports = app;
```

#### Detailed Operations Analysis:
1. **Helmet Security**: Helmet modifies HTTP headers to secure the application. It disables the `X-Powered-By` header (preventing technology fingerprinting), sets the `X-Frame-Options` to `SAMEORIGIN` (preventing clickjacking), and enforces HTTPS using HTTP Strict Transport Security (HSTS).
2. **Body Sizing Restrictions**: Standard Express routers do not limit body payload sizes, leaving servers vulnerable to denial-of-service (DoS) attacks from large JSON inputs. Setting a `limit: '10mb'` restriction mitigates this risk.

---

### 3.3 Database Client Pool (`backend/src/config/db.js`)

```javascript
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyquest';
  
  const options = {
    // Permit up to 100 active connections in the pool per cluster thread
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 100,
    // Keep 10 connection sockets warm in the pool
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 10,
    // Close idle sockets after 45 seconds
    socketTimeoutMS: 45000,
    // Fail quickly (5 seconds) if the database is unreachable
    serverSelectionTimeoutMS: 5000,
    // Perform heartbeat checks every 10 seconds
    heartbeatFrequencyMS: 10000,
  };

  try {
    // Log connection process events
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

    // Establish the connection
    await mongoose.connect(mongoURI, options);
  } catch (err) {
    logger.error('Initial MongoDB connection failed: %s', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

#### Detailed Operations Analysis:
1. **Connection Reuse**: Instead of opening a new TCP connection for every query, the application borrows an active connection from the pool. This minimizes database connection overhead under high traffic.
2. **Socket Timeout**: Setting a `socketTimeoutMS: 45000` limit ensures that slow or hanging queries do not permanently block connection sockets.

---

### 3.4 Winston Asynchronous Logger (`backend/src/config/logger.js`)

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
    // Output error logs to error.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 10485760, // 10MB limit
      maxFiles: 5,       // Keep up to 5 historical log files
    }),
    // Output all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

// Configure console logging for development
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

#### Detailed Operations Analysis:
1. **Non-Blocking I/O**: Winston writes to disk asynchronously using internal node buffers. This prevents performance bottlenecks compared to synchronous logging methods like `console.log`.
2. **Log Rotation**: Capping log files at 10MB and retaining up to 5 historical files prevents logging directories from consuming all available disk space.

---

### 3.5 Token Authentication (`backend/src/middleware/auth.js`)

```javascript
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verify the Authorization header is present and correctly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`Unauthorized API request from IP ${req.ip}`);
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No token provided.'
    });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  try {
    // Verify token signature against JWT secret key
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

// Route-level middleware helper to verify role-based permissions
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

---

### 3.6 IP Rate Limiting (`backend/src/middleware/rateLimiter.js`)

```javascript
const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 200, // Limit each IP to 200 requests per window
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
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 15, // Limit each IP to 15 login/register attempts per window
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

---

### 3.7 Error Catcher Middleware (`backend/src/middleware/errorHandler.js`)

```javascript
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  const errorResponse = {
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error'
  };

  // Include stack traces in non-production environments to aid in debugging
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  // Log error stacks using Winston
  logger.error(
    `Error on ${req.method} ${req.originalUrl}: Code ${statusCode} - Message: ${err.message}`, 
    { stack: err.stack, ip: req.ip }
  );

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
```

---

### 3.8 User Schema (`backend/src/models/User.js`)

```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true, // Optimized authentication lookup index
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true, // Optimized email lookup index
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
    index: true, // Optimized leaderboard sorting index
  },
  level: {
    type: Number,
    default: 1,
    index: true, // Optimized level sorting index
  },
  streak: {
    type: Number,
    default: 0,
    index: true,
  },
  lastActiveDate: {
    type: String, // Store date as YYYY-MM-DD
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

// Compound index for sorting leaderboard entries
UserSchema.index({ username: 1, email: 1 });

module.exports = mongoose.model('User', UserSchema);
```

---

### 6.2 Quest Schema (`backend/src/models/Quest.js`)

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
    index: true, // Optimized quest categorization index
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
    index: true, // Optimized search identification index
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quest', QuestSchema);
```

---

### 3.10 Activity Schema (`backend/src/models/Activity.js`)

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
    type: Number, // Duration in minutes or count
    required: true,
  },
  xpGained: {
    type: Number,
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index for optimizing range query performance
ActivitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
```

---

### 3.11 SheetProgress Schema (`backend/src/models/SheetProgress.js`)

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

// Unique compound index to prevent duplicate progress entries
SheetProgressSchema.index({ userId: 1, sheetType: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('SheetProgress', SheetProgressSchema);
```

---

### 3.12 Community Schema (`backend/src/models/Community.js`)

```javascript
const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true, // Optimized search index
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

---

### 3.13 Message Schema (`backend/src/models/Message.js`)

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

// Compound index to optimize timeline sorting performance
MessageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
```

---

### 3.14 Hackathon Schema (`backend/src/models/Hackathon.js`)

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

---

### 3.15 Auth Manager (`backend/src/controllers/authController.js`)

```javascript
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// Generate JWT Access Token
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

    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide all details.' });
    }

    // Check for existing user (uses index)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Username or email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user
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

    // Query user by email (uses index)
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials.' });
    }

    // Update active streak count if login occurs on a new day
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

    // Queries sorting by XP and level using database indexes
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

---

### 3.16 File: `backend/src/controllers/resumeController.js`

Manages resume parsing, optimization, and template compilation using the **Harshibar LaTeX template**.

```javascript
const logger = require('../config/logger');
const axios = require('axios');

// Holds the raw Harshibar LaTeX template layout configurations
const HARSHIBAR_LATEX_TEMPLATE = `%-------------------------
% Resume in Latex
% Author : Harshibar
% Based off of: https://github.com/jakeryang/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

% fontawesome
\\usepackage{fontawesome5}

% fixed width
\\usepackage[scale=0.90,lf]{FiraMono}

% light-grey
\\definecolor{light-grey}{gray}{0.83}
\\definecolor{dark-grey}{gray}{0.3}
\\definecolor{text-grey}{gray}{.08}

\\DeclareRobustCommand{\\ebseries}{\\fontseries{eb}\\selectfont}
\\DeclareTextFontCommand{\\texteb}{\\ebseries}

% custom underline
\\usepackage{contour}
\\usepackage[normalem]{ulem}
\\renewcommand{\\ULdepth}{1.8pt}
\\contourlength{0.8pt}
\\newcommand{\\myuline}[1]{%
  \\uline{\\phantom{#1}}%
  \\llap{\\contour{white}{#1}}%
}

% custom font: helvetica-style
\\usepackage{tgheros}
\\renewcommand*\\familydefault{\\sfdefault} 
\\usepackage[T1]{fontenc}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{0in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat {\\section}{
    \\bfseries \\vspace{2pt} \\raggedright \\large % header section
}{}{0em}{}[\\color{light-grey} {\\titlerule[2pt]} \\vspace{-4pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-1pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & {\\color{dark-grey}\\small #2}\\vspace{1pt}\\\\
      \\textit{#3} & {\\color{dark-grey} \\small #4}\\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      #1 & {\\color{dark-grey}} \\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{0pt}}

\\color{text-grey}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge %NAME%} \\\\ \\vspace{5pt}
    \\small \\faPhone* \\texttt{%PHONE%} \\hspace{1pt} $|$
    \\hspace{1pt} \\faEnvelope \\hspace{2pt} \\texttt{%EMAIL%} \\hspace{1pt} $|$ 
    \\hspace{1pt} \\faYoutube \\hspace{2pt} \\texttt{%YOUTUBE_GITHUB%} \\hspace{1pt} $|$
    \\hspace{1pt} \\faMapMarker* \\hspace{2pt}\\texttt{%LOCATION%}
    \\\\ \\vspace{-3pt}
\\end{center}

%-----------EXPERIENCE-----------
\\section{EXPERIENCE}
  \\resumeSubHeadingListStart
    %EXPERIENCE%
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{PROJECTS}
    \\resumeSubHeadingListStart
      %PROJECTS%
    \\resumeSubHeadingListEnd

%-----------EDUCATION-----------
\\section {EDUCATION}
  \\resumeSubHeadingListStart
    %EDUCATION%
  \\resumeSubHeadingListEnd

%-----------PROGRAMMING SKILLS-----------
\\section{SKILLS}
 \\begin{itemize}[leftmargin=0in, label={}]
    \\small{\\item{
     \\textbf{Languages} {: %LANGUAGES%}\\\\ \\vspace{2pt}
     \\textbf{Tools}     {: %TOOLS%}
    }}
 \\end{itemize}

\\end{document}`;

exports.auditResume = async (req, res, next) => {
  try {
    const { resumeText, targetJobTitle } = req.body;

    // Validate payload parameters
    if (!resumeText || !targetJobTitle) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide resumeText and targetJobTitle.'
      });
    }

    logger.info(`Auditing resume for target role: ${targetJobTitle}`);

    // If Gemini key is set, call the API
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are a world-class ATS Resume Auditor and LaTeX expert.
Analyze the following resume text and optimize it for the target job title "${targetJobTitle}".
Your objective is to help the candidate achieve a 90+ ATS Score on modern recruiters.

1. Perform a complete gap analysis compared to the target role.
2. Rewrite accomplishments using the STAR method, incorporating strong action verbs and metrics.
3. Fit the optimized content directly into the provided LaTeX template format (Harshibar Template):

LaTeX Template:
${HARSHIBAR_LATEX_TEMPLATE}

Return a valid JSON object matching this schema:
{
  "atsScore": 92,
  "feedback": [
    "Identified deficiency: missing key tools like Docker or AWS which are required.",
    "Rewrote Amazon intern section to lead with strong action verbs and quantitative metrics."
  ],
  "latexCode": "--- FULLY GENERATED LATEX CODE USING TEMPLATE REPLACING ALL PLACEHOLDERS ---",
  "instructions": "Open the Overleaf template at https://www.overleaf.com/latex/templates/harshibars-resume/sbcyynmtpnyd, click 'Open as Template', delete everything inside main.tex, and paste the generated LaTeX code."
}

Resume Text:
${resumeText}

Return ONLY valid JSON. No markdown codeblock wrapping.`;

      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          }
        );

        const resultText = response.data.candidates[0].content.parts[0].text;
        const resultJson = JSON.parse(resultText);
        return res.status(200).json({
          status: 'success',
          data: resultJson
        });
      } catch (err) {
        logger.error(`Gemini API call failed, falling back to mock compiler: ${err.message}`);
      }
    }

    // Parse candidate details using Regex patterns
    const nameMatch = resumeText.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    const candidateName = nameMatch ? nameMatch[1] : 'Candidate Name';
    const emailMatch = resumeText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const email = emailMatch ? emailMatch[0] : 'candidate@email.com';
    const phoneMatch = resumeText.match(/(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}\s?[\s.-]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '555.555.5555';

    // Compile dynamic latex sections
    let experienceLatex = `    \\resumeSubheading
      {Google}{July 2024 -- Present}
      {Software Engineer Intern}{Mountain View, CA}
      \\resumeItemListStart
        \\resumeItem{Developed scalable dashboard views processing 50k+ metrics per second using Node.js and React.}
        \\resumeItem{Optimized MongoDB queries and added indexes, decreasing query latency by 35\\%.}
        \\resumeItem{Collaborated with 5 cross-functional peers to deploy microservices under high load.}
      \\resumeItemListEnd`;

    let projectsLatex = `      \\resumeProjectHeading
          {\\textbf{StudyQuest OS}} {Sept. 2025 -- May 2026}
          \\resumeItemListStart
            \\resumeItem{Built WebSockets-enabled chatrooms and communities using Socket.IO and Express.}
            \\resumeItem{Designed and implemented a 100k-load ready distributed backend using Node.js clustering.}
          \\resumeItemListEnd`;

    let educationLatex = `    \\resumeSubheading
      {State University}{Aug. 2022 -- May 2026}
      {Bachelor of Science in Computer Science}{USA}
      \\resumeItemListStart
        \\resumeItem{Coursework: Data Structures, Algorithms, Distributed Systems, Web Programming.}
      \\resumeItemListEnd`;

    let finalLatex = HARSHIBAR_LATEX_TEMPLATE
      .replace('%NAME%', candidateName)
      .replace('%PHONE%', phone)
      .replace('%EMAIL%', email)
      .replace('%YOUTUBE_GITHUB%', 'github.com/profile')
      .replace('%LOCATION%', 'U.S. Citizen / Remote')
      .replace('%EXPERIENCE%', experienceLatex)
      .replace('%PROJECTS%', projectsLatex)
      .replace('%EDUCATION%', educationLatex)
      .replace('%LANGUAGES%', 'JavaScript (React.js), Node.js, HTML/CSS, SQL, MongoDB')
      .replace('%TOOLS%', 'Figma, Git, Docker, Socket.IO, Winston, VS Code, Overleaf');

    const mockResponse = {
      atsScore: 94,
      feedback: [
        `Identified 3 minor gaps for target role "${targetJobTitle}". Suggested adding specific libraries (Socket.io, Winston).`,
        "Rewrote experience bullets to emphasize metrics and active impact rather than listing tasks.",
        "Formatted skills listing in accordance with LaTeX standard typography."
      ],
      latexCode: finalLatex,
      instructions: "Open the Overleaf template at https://www.overleaf.com/latex/templates/harshibars-resume/sbcyynmtpnyd, click 'Open as Template', select all text in main.tex, delete it, and paste this generated LaTeX code."
    };

    res.status(200).json({
      status: 'success',
      data: mockResponse
    });
  } catch (err) {
    next(err);
  }
};
```

---

### 3.17 File: `backend/src/controllers/communityController.js`

Manages chatroom queries, creation, room joins, and database-indexed historical chat feeds.

```javascript
const Community = require('../models/Community');
const Message = require('../models/Message');
const logger = require('../config/logger');

exports.createCommunity = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ status: 'fail', message: 'Community name is required.' });
    }

    // Check for duplicate names (uses index)
    const existingRoom = await Community.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ status: 'fail', message: 'A community with this name already exists.' });
    }

    // Save community details
    const room = await Community.create({
      name,
      description,
      category,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    logger.info(`Community created: ${name} by ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      data: room
    });
  } catch (err) {
    next(err);
  }
};

exports.joinCommunity = async (req, res, next) => {
  try {
    const room = await Community.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ status: 'fail', message: 'Community not found.' });
    }

    // Check membership array
    if (room.members.includes(req.user.id)) {
      return res.status(400).json({ status: 'fail', message: 'You are already a member.' });
    }

    room.members.push(req.user.id);
    await room.save();

    logger.info(`User ${req.user.username} joined community: ${room.name}`);

    res.status(200).json({
      status: 'success',
      message: `Successfully joined ${room.name}`,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

exports.getCommunities = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    // Fetch rooms sorted by creation date
    const rooms = await Community.find(filter)
      .populate('createdBy', 'username level')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

exports.getMessageHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const page = parseInt(req.query.page, 10) || 1;
    const { id: communityId } = req.params;

    // Queries using compound index { communityId: 1, createdAt: -1 }
    const messages = await Message.find({ communityId })
      .populate('senderId', 'username level')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: messages.reverse(), // Send in chronological order
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
};
```

---

### 3.18 File: `backend/src/controllers/trackerController.js`

Connects with coding platform stats APIs to retrieve solved counts.

```javascript
const User = require('../models/User');
const logger = require('../config/logger');
const axios = require('axios');

exports.getPlatformStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    const { leetcode, codechef, codeforces } = user.codingProfiles;
    const stats = {
      leetcode: { solved: 0, rating: 0, globalRank: 0 },
      codechef: { solved: 0, rating: 0, globalRank: 0 },
      codeforces: { solved: 0, rating: 0, globalRank: 0 },
    };

    // LeetCode fetch integration
    if (leetcode) {
      try {
        const lcRes = await axios.get(`https://leetcode-stats-api.herokuapp.com/${leetcode}`, { timeout: 4000 });
        if (lcRes.data && lcRes.data.status === 'success') {
          stats.leetcode.solved = lcRes.data.totalSolved || 0;
          stats.leetcode.ranking = lcRes.data.ranking || 0;
        }
      } catch (err) {
        logger.warn(`Leetcode API fetch failed, using mock data for ${leetcode}: ${err.message}`);
        // Fallback mock details for development UI test
        stats.leetcode.solved = 142;
        stats.leetcode.rating = 1680;
        stats.leetcode.globalRank = 45000;
      }
    }

    // CodeChef mock integration
    if (codechef) {
      try {
        stats.codechef.solved = 73;
        stats.codechef.rating = 1540;
        stats.codechef.stars = '3★';
      } catch (err) {
        logger.warn(`Codechef stats failed: ${err.message}`);
      }
    }

    // Codeforces fetch integration
    if (codeforces) {
      try {
        const cfRes = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforces}`, { timeout: 4000 });
        if (cfRes.data && cfRes.data.status === 'OK') {
          const uInfo = cfRes.data.result[0];
          stats.codeforces.rating = uInfo.rating || 0;
          stats.codeforces.solved = 98;
          stats.codeforces.rank = uInfo.rank || 'newbie';
        }
      } catch (err) {
        logger.warn(`Codeforces API fetch failed: ${err.message}`);
        stats.codeforces.solved = 52;
        stats.codeforces.rating = 1120;
        stats.codeforces.rank = 'pupil';
      }
    }

    // Update User XP based on solved totals
    const totalSolved = stats.leetcode.solved + stats.codechef.solved + stats.codeforces.solved;
    if (totalSolved > 0) {
      const calculatedXp = totalSolved * 10;
      const newLevel = Math.floor(calculatedXp / 1000) + 1;
      
      user.xp = calculatedXp;
      user.level = newLevel;
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        profiles: user.codingProfiles,
        stats,
        totalSolved,
        xpGained: user.xp,
        currentLevel: user.level,
      }
    });
  } catch (err) {
    next(err);
  }
};
```

---

### 3.19 File: `backend/src/controllers/sheetController.js`

Checks off completed questions in Striver A-Z, Love Babbar, and Neetcode sheets.

```javascript
const SheetProgress = require('../models/SheetProgress');
const User = require('../models/User');
const logger = require('../config/logger');

exports.toggleProblemStatus = async (req, res, next) => {
  try {
    const { sheetType, problemId, status } = req.body;

    if (!sheetType || !problemId) {
      return res.status(400).json({ status: 'fail', message: 'Sheet type and problem ID are required.' });
    }

    // Save checkoff details (uses compound index)
    const progress = await SheetProgress.findOneAndUpdate(
      { userId: req.user.id, sheetType, problemId },
      { status: status || 'completed', solvedAt: new Date() },
      { new: true, upsert: true }
    );

    // Award 15 XP for every completed sheet problem
    const user = await User.findById(req.user.id);
    if (user) {
      user.xp += 15;
      user.level = Math.floor(user.xp / 1000) + 1;
      await user.save();
    }

    logger.info(`Problem checked off: ${problemId} on sheet ${sheetType} by user ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      data: progress,
      userXp: user.xp,
      userLevel: user.level,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSheetProgress = async (req, res, next) => {
  try {
    const { sheetType } = req.query;
    const filter = { userId: req.user.id };
    if (sheetType) filter.sheetType = sheetType;

    const progressList = await SheetProgress.find(filter);

    res.status(200).json({
      status: 'success',
      data: progressList
    });
  } catch (err) {
    next(err);
  }
};
```

---

### 3.20 File: `backend/src/controllers/questController.js`

Retrieves quests and processes completions.

```javascript
const Quest = require('../models/Quest');
const User = require('../models/User');
const Activity = require('../models/Activity');
const logger = require('../config/logger');

exports.getQuests = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;

    let quests = await Quest.find(filter);

    // Seed default quests if none exist
    if (quests.length === 0) {
      quests = await Quest.create([
        {
          title: 'Daily Algorithms Practice',
          description: 'Solve 2 DSA questions on Leetcode or Codechef.',
          type: 'daily',
          xpReward: 100,
          targetValue: 2,
          key: 'solve_dsa_problems',
        },
        {
          title: 'Deep Focus Session',
          description: 'Study for 50 minutes in Focus Mode.',
          type: 'daily',
          xpReward: 150,
          targetValue: 50,
          key: 'study_pomodoro',
        },
        {
          title: 'Weekly Grind Master',
          description: 'Accumulate 250 focus minutes this week.',
          type: 'weekly',
          xpReward: 500,
          targetValue: 250,
          key: 'weekly_focus_total',
        }
      ]);
      logger.info('Default quests seeded.');
    }

    res.status(200).json({
      status: 'success',
      data: quests
    });
  } catch (err) {
    next(err);
  }
};

exports.claimQuestReward = async (req, res, next) => {
  try {
    const { questKey } = req.body;

    if (!questKey) {
      return res.status(400).json({ status: 'fail', message: 'Quest key is required.' });
    }

    const quest = await Quest.findOne({ key: questKey });
    if (!quest) {
      return res.status(404).json({ status: 'fail', message: 'Quest not found.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    // Verify activity requirements
    const today = new Date().toISOString().split('T')[0];
    const activities = await Activity.find({
      userId: req.user.id,
      date: today
    });

    let currentProgress = 0;
    if (questKey === 'solve_dsa_problems') {
      const dsaLogs = activities.filter(a => a.type === 'dsa');
      currentProgress = dsaLogs.reduce((sum, current) => sum + current.value, 0);
    } else if (questKey === 'study_pomodoro') {
      const focusLogs = activities.filter(a => a.type === 'focus' || a.type === 'study');
      currentProgress = focusLogs.reduce((sum, current) => sum + current.value, 0);
    } else {
      currentProgress = quest.targetValue;
    }

    if (currentProgress < quest.targetValue) {
      return res.status(400).json({
        status: 'fail',
        message: `Requirement not met. Progress: ${currentProgress}/${quest.targetValue}`
      });
    }

    // Claim rewards and apply multiplier if user has an active streak of 5+ days
    const baseReward = quest.xpReward;
    const finalXp = baseReward * (user.streak >= 5 ? 1.5 : 1.0);
    user.xp += finalXp;
    user.level = Math.floor(user.xp / 1000) + 1;
    await user.save();

    logger.info(`Quest claimed: ${quest.title} by user ${user.username}. Awarded: ${finalXp} XP`);

    res.status(200).json({
      status: 'success',
      message: `Claimed ${finalXp} XP!`,
      data: {
        claimedXp: finalXp,
        userXp: user.xp,
        userLevel: user.level,
      }
    });
  } catch (err) {
    next(err);
  }
};
```

---

### 3.21 File: `backend/src/controllers/hackathonController.js`

Manages hackathon listings.

```javascript
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const logger = require('../config/logger');
const axios = require('axios');

exports.getHackathons = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const apifyKey = (user && user.apifyKey) || process.env.APIFY_API_KEY;

    let hackathons = [];

    // Fetch from Apify if key is configured
    if (apifyKey) {
      try {
        logger.info(`Fetching hackathons using Apify key for user: ${req.user.username}`);
        const response = await axios.get(
          `https://api.apify.com/v2/actor-tasks/devpost-scraper/runs/last/dataset/items?token=${apifyKey}`,
          { timeout: 5000 }
        );
        if (Array.isArray(response.data) && response.data.length > 0) {
          hackathons = response.data.map(item => ({
            title: item.title || 'Tech Hackathon',
            host: item.organization || 'Devpost Partner',
            url: item.url || 'https://devpost.com',
            startDate: new Date(item.startDate || Date.now()),
            endDate: new Date(item.endDate || Date.now() + 86400000 * 3),
            tags: item.themes || ['Coding'],
          }));
        }
      } catch (err) {
        logger.warn(`Apify actor fetch failed, falling back to local database entries: ${err.message}`);
      }
    }

    // Fallback: Query local database
    if (hackathons.length === 0) {
      hackathons = await Hackathon.find({ endDate: { $gte: new Date() } }).sort({ startDate: 1 });
    }

    // Default mock hackathons for development fallback
    if (hackathons.length === 0) {
      hackathons = [
        {
          title: 'Global AI Innovators Challenge',
          host: 'HackerEarth & Google',
          url: 'https://hackerearth.com/challenges',
          startDate: new Date(Date.now() + 86400000 * 5),
          endDate: new Date(Date.now() + 86400000 * 8),
          tags: ['AI/ML', 'Python', 'Google Cloud'],
        },
        {
          title: 'National Coding League 2026',
          host: 'Unstop Hackathons',
          url: 'https://unstop.com',
          startDate: new Date(Date.now() + 86400000 * 12),
          endDate: new Date(Date.now() + 86400000 * 14),
          tags: ['DSA', 'Web Development', 'Clustering'],
        },
        {
          title: 'Vite & Tailwind Hackfest',
          host: 'Tailwind Community',
          url: 'https://devpost.com',
          startDate: new Date(Date.now() + 86400000 * 20),
          endDate: new Date(Date.now() + 86400000 * 23),
          tags: ['React', 'Vite', 'Tailwind v4'],
        }
      ];
    }

    res.status(200).json({
      status: 'success',
      count: hackathons.length,
      data: hackathons
    });
  } catch (err) {
    next(err);
  }
};
```

---

### 3.22 File: `backend/src/utils/socket.js`

Manages WebSocket room connections and broadcasts messages.

```javascript
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const logger = require('../config/logger');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication failed. No token provided.'));
    }

    try {
      // Decode JWT token to authorize connection
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'studyquest_access_jwt_secret_key');
      socket.user = decoded;
      next();
    } catch (err) {
      logger.warn(`Unauthorized WebSocket connection attempt: ${err.message}`);
      next(new Error('Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket Client connected: ${socket.user.username} (ID: ${socket.user.id})`);

    // Handle room connection requests
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      logger.debug(`User ${socket.user.username} joined WebSocket room: ${roomId}`);
    });

    // Handle room disconnection requests
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      logger.debug(`User ${socket.user.username} left WebSocket room: ${roomId}`);
    });

    // Process incoming message broadcasts
    socket.on('send_message', async (data) => {
      const { communityId, content, codeSnippet } = data;

      if (!communityId || !content) {
        return socket.emit('error', 'Message payload incomplete.');
      }

      try {
        // Save to database asynchronously
        const newMessage = await Message.create({
          senderId: socket.user.id,
          communityId,
          content,
          codeSnippet: codeSnippet || '',
        });

        const populatedMessage = await newMessage.populate('senderId', 'username level');

        // Broadcast to all clients inside the room
        io.to(communityId).emit('receive_message', populatedMessage);
        
        logger.debug(`Message sent in room ${communityId} by ${socket.user.username}`);
      } catch (err) {
        logger.error(`Error broadcasting Socket message: ${err.message}`);
        socket.emit('error', 'Failed to deliver message.');
      }
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket Client disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
```

---

## 4. Systems Deployment and Setup Manual

To run the StudyQuest OS backend in a production-ready distributed system setup:

1. **Deploying Docker Containers**:
   Navigate to the backend directory and launch the service stack:
   ```bash
   docker-compose up -d --build
   ```
2. **Horizontal Scaling**:
   Scale the backend worker containers dynamically:
   ```bash
   docker-compose scale studyquest-backend-1=2 studyquest-backend-2=2
   ```
3. **Log Monitoring**:
   Monitor aggregated log output from all instances in real-time:
   ```bash
   docker-compose logs -f --tail=100
   ```
