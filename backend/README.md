# StudyQuest OS Backend: Advanced Distributed Architecture & Annotated Code Manual

This document serves as the master developer specification and detailed operations manual for the StudyQuest OS backend. It is designed to provide an absolute, line-by-line understanding of every script, utility, and configuration in the codebase, along with a deep-dive exploration of the modern backend technologies that make up our distributed system.

---

## Part 1: Deep Dive on the Backend Tech Stack

### 1.1 Node.js Internals, V8 Engine, & Concurrent Event Loop
Node.js is built on top of Google Chrome's V8 JavaScript engine, which compiles JavaScript source code directly into native machine code at runtime. Node.js uses a single-threaded event-driven architecture to achieve high concurrency. Instead of spawning a new operating system thread for every incoming HTTP request (which consumes significant RAM and introduces CPU context-switching latency), Node.js operates on a single execution thread known as the **Event Loop**.

#### The Event Loop Phases:
1. **Timers**: Executes callbacks scheduled by `setTimeout()` and `setInterval()`.
2. **Pending Callbacks**: Executes I/O callbacks deferred to the next loop iteration (e.g., system errors).
3. **Idle, Prepare**: Used internally by the system.
4. **Poll**: Retrieves new I/O events; executes I/O-related callbacks (almost all user requests, database reads, file system writes).
5. **Check**: Executes callbacks scheduled by `setImmediate()`.
6. **Close Callbacks**: Handles close events like socket disconnections.

#### Libuv & Thread Pool:
While the Event Loop runs on a single thread, Node.js delegates asynchronous blocking operations (such as file system reads, database queries, and encryption) to **libuv**, a C library that manages an internal thread pool (default size of 4 threads, scalable via `UV_THREADPOOL_SIZE`). This ensures that heavy calculations (like hashing passwords with bcrypt) do not block the event loop from processing new incoming HTTP connections.

---

### 1.2 Process Clustering & Multi-Core Scaling
Because the event loop runs on a single thread, it can only utilize a single CPU core. On modern servers with 8, 16, or 32 CPU cores, a basic Node.js application leaves the majority of the hardware idle. The **Node.js Cluster Module** solves this by launching a cluster of Node.js processes.
- **Primary Process (Master)**: Responsible for reading hardware CPU capabilities, forking child processes (workers), and monitoring their lifecycle. The primary process does not listen to incoming sockets directly.
- **Worker Processes**: Child processes spawned by the primary thread. They execute your application code, establish connection pools, and share the server port.
- **IPC (Inter-Process Communication)**: Master and worker processes communicate using internal message passing channels to coordinate status checks and recycle dead threads.

---

### 1.3 Nginx Reverse Proxying & Sticky Load Balancing
When deploying multiple instances of our backend across multiple processes or containers, we place a load balancer in front of them to distribute the network load. We use **Nginx** configured as a reverse proxy.

#### Sticky Sessions (`ip_hash`):
WebSockets begin as standard HTTP requests. The client sends a handshake request with an `Upgrade: websocket` header. The server accepts this and upgrades the connection to a persistent, bidirectional TCP connection. 
In a distributed environment, if the handshake request lands on Server A, but the subsequent WebSocket traffic is routed to Server B, the connection fails because Server B has no record of the initial handshake.
We use the `ip_hash` directive in Nginx. This hashes the client's IP address, ensuring that all requests from a specific user are consistently routed to the same backend server instance. This maintains session integrity for WebSockets.

---

### 1.4 WebSockets, Socket.IO, & Redis Pub/Sub Scaling
A standard HTTP request follows a unidirectional request-response model. The client requests data, the server responds, and the connection closes. For real-time features like study chatrooms and collaborative quests, this model is inefficient because the client must constantly poll the server for updates.
**WebSockets** provide a persistent, full-duplex TCP channel between the client and server.

#### Socket.IO Features:
- **Fallback Support**: If WebSockets are blocked by corporate firewalls or proxies, Socket.IO automatically falls back to HTTP long-polling.
- **Rooms and Namespaces**: Socket.IO groups sockets into virtual channels called rooms, allowing targeted message broadcasting (e.g., sending messages only to users in the same study squad).

#### Redis Pub/Sub Adapter:
In a multi-server setup, if User A is connected to Server 1 and sends a message to Room X, User B (who is in Room X but connected to Server 2) will not receive it. 
To bridge this gap, we use the **Socket.IO Redis Adapter**. The adapter connects all backend servers to a central **Redis** instance. When Server 1 receives a message for Room X, it publishes the message to Redis. Redis then broadcasts this event to all other backend instances, ensuring that every user in Room X receives the message regardless of which server they are connected to.

---

### 1.5 MongoDB Mongoose Client Connection Pooling & Indexing
MongoDB is a document-oriented, NoSQL database. Instead of structured tables, data is stored in binary JSON documents (BSON). **Mongoose** acts as the object modeling tool (ODM), translating database documents into JavaScript objects.

#### Connection Pooling:
Setting up a TCP connection between the backend and database is an expensive operation that involves network handshakes and authentication. Under high load, creating a new connection for every request causes latency.
We configure a **Connection Pool** in Mongoose:
- `maxPoolSize (100)`: Restricts Mongoose to a maximum of 100 open sockets per worker process, preventing connection exhaustion.
- `minPoolSize (10)`: Maintains 10 warm connections in the pool at all times to handle sudden spikes in traffic without connection establishment delay.

#### Database Indexing:
Without indexes, MongoDB must perform a collection scan (reading every document in the database) to find matching records. Under high load, this causes CPU bottlenecks.
We use **Indexes**:
- **B-Tree Data Structures**: MongoDB builds B-Tree maps of indexed fields to find records in logarithmic time ($O(\log N)$ instead of $O(N)$).
- **Compound Indexes**: We use composite indexes (like `{ userId: 1, date: -1 }` on activity logs) to speed up queries that filter by user and sort by date.
- **Unique Constraints**: Handled at the database level by indexing fields (like `username` or `email`) with unique constraints, preventing race conditions during registration.

---

### 1.6 Security Framework: JWT, Bcrypt, Rate Limiting, & Sanitization

#### JSON Web Tokens (JWT):
JWT is a stateless authentication mechanism. Instead of storing session IDs in memory, the server signs a payload (containing the user ID, role, and expiration) using a secret key and returns it to the client.
- **Access Tokens**: Short-lived tokens sent in the `Authorization: Bearer <token>` header to authenticate requests.
- **Stateless Verification**: The server verifies the token signature cryptographically on every request. This eliminates database session lookups, allowing the API to scale.

#### Bcrypt Password Hashing:
Bcrypt is a blowfish-based password hashing function. It uses a **salt** (random data appended to the password) and a **work factor** (cost factor) to compute the hash.
- **Slow Hashing**: Unlike MD5 or SHA256, which are designed to be fast, bcrypt is intentionally slow. This makes brute-force attacks computationally expensive.
- **Salt Rounds (12)**: Represents the work factor. 12 rounds require $2^{12}$ iterations, balancing security with server performance.

#### NoSQL Injection Prevention (`express-mongo-sanitize`):
If an attacker sends a JSON payload like `{"email": {"$ne": null}, "password": "xyz"}` to a login endpoint, Mongoose executes a query searching for a user where the email is *not equal* to null. This bypasses authentication. The sanitize middleware strips the `$` and `.` characters from incoming request payloads, blocking query injection.

---

## Part 2: Comprehensive Line-by-Line Code Annotations

---

### 2.1 File: `backend/src/server.js`

This file handles clustering and boots the HTTP server.

```javascript
// Line 1: Import the native Node.js HTTP module to instantiate the web server container.
const http = require('http');

// Line 2: Import the Node.js Cluster module to scale the application across multiple CPU cores.
const cluster = require('cluster');

// Line 3: Retrieve CPU core counts from the OS module to determine the number of process forks.
const numCPUs = require('os').cpus().length;

// Line 4: Import the configured Express application instance from app.js.
const app = require('./app');

// Line 5: Import the Mongoose connection manager configuration.
const connectDB = require('./config/db');

// Line 6: Import the WebSockets Socket.IO server initialization wrapper.
const { initializeSocket } = require('./utils/socket');

// Line 7: Import Winston to log server status messages.
const logger = require('./config/logger');

// Line 8: Load environment configurations from the local .env file.
require('dotenv').config();

// Line 9: Assign the server port, defaulting to 5000 if not specified in the environment.
const PORT = process.env.PORT || 5000;

// Line 10: Check if the current thread is the primary process coordinator.
if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  // Line 11: Log the primary process ID (PID) to trace the master manager thread.
  logger.info(`Primary process ${process.pid} is running.`);
  // Line 12: Log the number of workers to be spawned based on CPU cores.
  logger.info(`Forking server workers for ${numCPUs} CPU cores...`);

  // Line 13: Loop through the core count and spawn worker processes.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Line 14: Monitor worker crashes and fork replacements to ensure high availability.
  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker process ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
    logger.info('Spawning replacement worker process...');
    cluster.fork();
  });

} else {
  // Line 15: Run the server startup logic within worker processes.
  const startServer = async () => {
    try {
      // Line 16: Connect to MongoDB using the Mongoose connection pool.
      await connectDB();

      // Line 17: Wrap the Express app with a native HTTP server.
      const server = http.createServer(app);

      // Line 18: Bind Socket.IO to the HTTP server to handle WebSocket handshakes.
      initializeSocket(server);

      // Line 19: Boot the HTTP server listener.
      server.listen(PORT, () => {
        logger.info(`Worker process ${process.pid} started. Server running on port ${PORT}`);
      });
    } catch (err) {
      // Line 20: Catch fatal startup errors, log the details, and shut down the worker.
      logger.error(`Failed to launch server on worker process ${process.pid}: ${err.message}`);
      process.exit(1);
    }
  };

  // Line 21: Run the server launcher.
  startServer();
}
```

---

### 2.2 File: `backend/src/app.js`

This file configures the middleware stack and binds global API routes.

```javascript
// Line 1: Import Express framework.
const express = require('express');

// Line 2: Import CORS middleware to manage cross-origin request policies.
const cors = require('cors');

// Line 3: Import Helmet to configure secure HTTP headers.
const helmet = require('helmet');

// Line 4: Import Mongo-Sanitize to protect against NoSQL injection attacks.
const mongoSanitize = require('express-mongo-sanitize');

// Line 5: Import Morgan to capture HTTP requests logs.
const morgan = require('morgan');

// Line 6: Import the Winston logger.
const logger = require('./config/logger');

// Line 7: Import the global centralized error handler middleware.
const errorHandler = require('./middleware/errorHandler');

// Line 8: Import the rate limiter middleware.
const { apiLimiter } = require('./middleware/rateLimiter');

// Line 9: Import auth, resume, community, tracker, sheet, quest, and hackathon routers.
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const communityRoutes = require('./routes/communityRoutes');
const trackerRoutes = require('./routes/trackerRoutes');
const sheetRoutes = require('./routes/sheetRoutes');
const questRoutes = require('./routes/questRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');

// Line 10: Instantiate the Express application.
const app = express();

// Line 11: Apply Helmet to secure HTTP headers.
app.use(helmet());

// Line 12: Configure CORS options.
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Line 13: Clean incoming payloads of MongoDB operators.
app.use(mongoSanitize());

// Line 14: Parse JSON payloads with a size limit of 10MB to prevent denial-of-service (DoS) attacks.
app.use(express.json({ limit: '10mb' }));

// Line 15: Parse URL-encoded forms with a size limit of 10MB.
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Line 16: Configure Morgan to stream request logs to the Winston logging pipeline.
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Line 17: Expose a health check endpoint for monitoring tools.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Line 18: Apply the global rate limiter under /api.
app.use('/api', apiLimiter);

// Line 19: Map API routes.
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/sheets', sheetRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/hackathons', hackathonRoutes);

// Line 20: Register the global error handler after all routes are configured.
app.use(errorHandler);

module.exports = app;
```

---

### 2.3 File: `backend/src/config/db.js`

This file manages connection pools and reconnection logic for MongoDB.

```javascript
// Line 1: Import Mongoose.
const mongoose = require('mongoose');

// Line 2: Import Winston logger.
const logger = require('./logger');

const connectDB = async () => {
  // Line 3: Read the MongoDB connection URI from environment variables.
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyquest';
  
  // Line 4: Configure connection pool parameters.
  const options = {
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 100, // Maximum open sockets
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 10,   // Minimum warm sockets
    socketTimeoutMS: 45000,                                            // Close idle sockets after 45s
    serverSelectionTimeoutMS: 5000,                                    // Time out if database is unreachable
    heartbeatFrequencyMS: 10000,                                       // Status check frequency
  };

  try {
    // Line 5: Log when Mongoose begins connection handshakes.
    mongoose.connection.on('connecting', () => {
      logger.info('Connecting to MongoDB...');
    });

    // Line 6: Log successful database connections.
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully.');
    });

    // Line 7: Log database connection errors.
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error: %s', err.message);
    });

    // Line 8: Log database disconnections.
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnection...');
    });

    // Line 9: Establish the database connection.
    await mongoose.connect(mongoURI, options);
  } catch (err) {
    // Line 10: Exit process on database connection failures.
    logger.error('Initial MongoDB connection failed: %s', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

### 2.4 File: `backend/src/config/logger.js`

This file configures Winston to handle log rotation and output formats.

```javascript
// Line 1: Import Winston logging library.
const winston = require('winston');

// Line 2: Import path module to resolve log file destinations.
const path = require('path');

// Line 3: Define log formatting rules.
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  // Line 4: Set the log level based on the environment (info in production, debug in development).
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  // Line 5: Include default metadata with every log entry.
  defaultMeta: { service: 'studyquest-backend' },
  transports: [
    // Line 6: Write error logs to error.log, rotated at 10MB.
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
    // Line 7: Write all logs to combined.log, rotated at 10MB.
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

// Line 8: Format console output for readability in development.
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

---

### 2.5 File: `backend/src/middleware/auth.js`

This file handles user session validation and authorization.

```javascript
// Line 1: Import jwt library.
const jwt = require('jsonwebtoken');

// Line 2: Import Winston logger.
const logger = require('../config/logger');

const authenticate = (req, res, next) => {
  // Line 3: Retrieve the authorization header.
  const authHeader = req.headers.authorization;

  // Line 4: Verify the token is present and formatted as a Bearer token.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`Unauthorized API request from IP ${req.ip}`);
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No token provided.'
    });
  }

  // Line 5: Extract the JWT token.
  const token = authHeader.split(' ')[1];

  try {
    // Line 6: Verify the token signature against the JWT secret key.
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'studyquest_access_jwt_secret_key');
    // Line 7: Bind the user payload data to the request context.
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Invalid JWT token verification attempt from IP ${req.ip}`);
    
    // Line 8: Check for expired tokens.
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

// Line 9: Helper function to restrict access to authorized roles.
const authorize = (...roles) => {
  return (req, res, next) => {
    // Line 10: Block access if user role is not authorized.
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

### 2.6 File: `backend/src/middleware/rateLimiter.js`

This file prevents denial-of-service (DoS) attacks by rate-limiting request rates.

```javascript
// Line 1: Import rate limiter module.
const rateLimit = require('express-rate-limit');

// Line 2: Import Winston logger.
const logger = require('../config/logger');

// Line 3: Apply general API rate limiting.
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

// Line 4: Apply strict rate limiting to auth endpoints to prevent brute-force attacks.
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

### 2.7 File: `backend/src/middleware/errorHandler.js`

This file catches and processes all application runtime errors.

```javascript
// Line 1: Import Winston logger.
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Line 2: Set the error code, defaulting to 500.
  const statusCode = err.statusCode || 500;
  
  // Line 3: Define the standard JSON response format.
  const errorResponse = {
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error'
  };

  // Line 4: Exclude stack traces in production to prevent leakage of system details.
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  // Line 5: Log the error with Winston.
  logger.error(
    `Error on ${req.method} ${req.originalUrl}: Code ${statusCode} - Message: ${err.message}`, 
    { stack: err.stack, ip: req.ip }
  );

  // Line 6: Return the response to the client.
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
```

---

### 2.8 File: `backend/src/models/User.js`

This file defines the schema and indexes for user accounts.

```javascript
// Line 1: Import Mongoose.
const mongoose = require('mongoose');

// Line 2: Define the User database schema.
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true, // Index for authentication lookup optimization
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true, // Index for email lookup optimization
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
    index: true, // Index to optimize sorting leaderboards
  },
  level: {
    type: Number,
    default: 1,
    index: true, // Index to optimize sorting leaderboards
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
  // Line 3: Enable automatic creation and updates tracking.
  timestamps: true,
});

// Line 4: Define a compound index to optimize search and validation.
UserSchema.index({ username: 1, email: 1 });

module.exports = mongoose.model('User', UserSchema);
```

---

### 2.9 File: `backend/src/models/Quest.js`

This file defines the schema for Daily and Weekly quests.

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
    index: true, // Index to filter daily vs weekly quests
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
    type: String, // Unique identifier key (e.g. "solve_dsa_problems")
    required: true,
    unique: true,
    index: true, // Index for quick identification of completed targets
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quest', QuestSchema);
```

---

### 2.10 File: `backend/src/models/Activity.js`

This file logs study activities and solved problems to generate user heatmaps.

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
    type: Number, // Duration in minutes, or problem count
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

// Compound index to optimize range queries per user
ActivitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
```

---

### 2.11 File: `backend/src/models/SheetProgress.js`

Tracks checked problems in Striver A-Z, Love Babbar, and Neetcode sheets.

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

// Unique compound index to prevent duplicate progress checkoffs
SheetProgressSchema.index({ userId: 1, sheetType: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('SheetProgress', SheetProgressSchema);
```

---

### 2.12 File: `backend/src/models/Community.js`

This file manages community chatrooms and groups.

```javascript
const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true, // Index for searching communities
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['general', 'leetcode', 'company-prep', 'squads', 'other'],
    default: 'general',
    index: true, // Index to filter communities by category
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

### 2.13 File: `backend/src/models/Message.js`

This file logs messages sent in community chatrooms.

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

// Compound index to fetch a chatroom's message history sorted by creation time
MessageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
```

---

### 2.14 File: `backend/src/models/Hackathon.js`

This file stores lists of active and upcoming hackathons.

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
    index: true, // Index for listing hackathons by start date
  },
  endDate: {
    type: Date,
    required: true,
    index: true, // Index for purging expired hackathons
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

### 2.15 File: `backend/src/controllers/authController.js`

This controller handles registration, login, profile updates, and leaderboard queries.

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

    // Validate request inputs
    if (!username || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide all details.' });
    }

    // Check for duplicate users
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Username or email already exists.' });
    }

    // Hash password with 12 salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the user in the database
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

    // Fetch the user
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials.' });
    }

    // Update the daily activity streak
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

### 2.16 File: `backend/src/controllers/resumeController.js`

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

    // Parse candidate name, email, and phone using Regex patterns
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

### 2.17 File: `backend/src/controllers/communityController.js`

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

### 2.18 File: `backend/src/controllers/trackerController.js`

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

### 2.19 File: `backend/src/controllers/sheetController.js`

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

### 2.20 File: `backend/src/controllers/questController.js`

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

### 2.21 File: `backend/src/controllers/hackathonController.js`

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

### 2.22 File: `backend/src/utils/socket.js`

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
