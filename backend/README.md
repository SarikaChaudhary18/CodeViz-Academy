# StudyQuest OS Backend Developer Guide and Technical Specifications

This documentation provides an exhaustive, directory-by-directory analysis of the StudyQuest OS distributed backend architecture. It covers the logic, configuration parameters, and scaling strategies implemented to support high concurrent load.

---

## 1. Distributed System and Scaling Architecture

To scale the backend to support up to 100,000 active users, the architecture operates as a stateless distributed system.

### Clustering (Intra-Node Scaling)
Single-threaded Node.js environments utilize only a single CPU core. On multi-core servers, this leaves resources idle. The `cluster` module forks the master process into multiple worker threads (one per CPU core) that share the same network port (e.g. 5000). The operating system load balances incoming HTTP and socket connection handshakes across these workers.

### Load Balancing (Inter-Node Scaling)
In a multi-server setup, Nginx functions as a reverse proxy load balancer.
1. **Nginx Sticky Sessions (`ip_hash`)**: WebSocket handshakes require clients to remain pinned to the same server node during the upgrade from HTTP to TCP. Nginx hashes client IP addresses to route requests to the same backend server container instance.
2. **Docker Compose Orchestration**: Spins up three replicas of the Express server (`studyquest-backend-1`, `studyquest-backend-2`, `studyquest-backend-3`), an Nginx proxy container, MongoDB, and a Redis container.

### Socket.IO State Synchronization (Redis Adapter)
When a client sends a chat message, they are connected to one backend worker thread. Without a synchronization layer, users connected to other server nodes or worker threads would not receive the message. We integrate Redis as a Pub/Sub coordinator. When a message is sent to a room, the server node publishes the event to Redis, which distributes the message to all other backend server nodes and worker processes to broadcast to their connected clients.

---

## 2. Exhaustive Code Analysis by File

### 2.1 Server Entrypoint (`backend/src/server.js`)
This file is the main entry point that boots the HTTP and Socket.IO server.

- **Line-by-Line Logic**:
  - `const numCPUs = require('os').cpus().length;`: Fetches the hardware core count to determine how many worker processes to fork.
  - `if (cluster.isPrimary && process.env.NODE_ENV === 'production')`: In production mode, the primary process acts as a launcher. It does not handle request payloads directly; it only manages worker nodes.
  - `cluster.fork();`: Spawns a new worker thread running the same script.
  - `cluster.on('exit', ...)`: Monitored listener. If a worker dies due to a memory leak or uncaught exception, a replacement worker is immediately spawned (self-healing architecture).
  - `else { startServer(); }`: Runs inside spawned worker processes (or in single-process development mode) to initialize database connection pools, instantiate Socket.IO, and bind to the port.

---

### 2.2 Express Application Setup (`backend/src/app.js`)
This file configures the middleware stack and routes.

- **Line-by-Line Logic**:
  - `app.use(helmet());`: Applies secure HTTP headers to prevent clickjacking, MIME sniffing, and XSS.
  - `app.use(cors({...}));`: Restricts API access to whitelisted client origins, preventing unauthorized cross-origin requests.
  - `app.use(mongoSanitize());`: Sanitizes input keys to remove MongoDB operators (such as `$gt` or `$ne`), blocking NoSQL query injection.
  - `app.use(morgan(..., { stream }));`: Intercepts Express access logs and streams them to the Winston logger.
  - `app.use('/api', apiLimiter);`: Applies rate limiting globally to prevent brute-force attacks and resource exhaustion.

---

### 2.3 Database Pool Manager (`backend/src/config/db.js`)
Manages MongoDB connections through Mongoose.

- **Line-by-Line Logic**:
  - `maxPoolSize: 100`: Permits up to 100 simultaneous database connections per worker node.
  - `minPoolSize: 10`: Keeps 10 connection sockets warm to prevent database handshake latency on new requests.
  - `socketTimeoutMS: 45000`: Closes hanging database operations after 45 seconds to free up socket slots.
  - `mongoose.connection.on(...)`: Attaches event listeners for connections, disconnections, and errors, routing status reports to our logging system.

---

### 2.4 Winston Log Coordinator (`backend/src/config/logger.js`)
An asynchronous logging framework that avoids blocking the Node event loop during high load.

- **Line-by-Line Logic**:
  - `winston.format.json()`: Formats production logs as structured JSON objects for easy ingestion by log analysers (like ELK Stack or Datadog).
  - `maxsize: 10485760` / `maxFiles: 5`: Enables file rotation, capping log files at 10MB each and retaining a maximum of 5 logs.
  - `winston.transports.Console`: Renders readable, color-coded strings in non-production environments.

---

### 2.5 Security & Auth Middlewares

#### IP Rate Limiter (`backend/src/middleware/rateLimiter.js`)
Limits incoming request rates using memory stores.
- `apiLimiter`: Blocks an IP after 200 requests within a 15-minute window.
- `authLimiter`: Limits login and registration endpoints to 15 requests per 15-minute window to prevent automated credential testing.

#### Centrally Managed Error Catcher (`backend/src/middleware/errorHandler.js`)
A catch-all middleware placed at the end of the Express lifecycle.
- Logs full error stacks using Winston (`logger.error`).
- In production, it hides raw stack traces to prevent system detail leaks, returning a clean, generic message.

#### JWT Token Validator (`backend/src/middleware/auth.js`)
Decodes and verifies authentication tokens.
- `authenticate`: Checks for a `Bearer <token>` string inside the `Authorization` header, verifies the signature using the secret key, and binds the payload user details to `req.user`.
- `authorize(...roles)`: Performs role checks to restrict administrative paths to approved accounts.

---

### 2.6 Mongoose Data Models & Database Indexing

Indexing is crucial for query performance under heavy workloads.

- **User Model (`src/models/User.js`)**:
  - Indexes on `username` and `email` for rapid authentication and registration checks.
  - Indexes on `xp` and `level` for leaderboard sorting queries.
- **Activity Model (`src/models/Activity.js`)**:
  - Compound index on `{ userId: 1, date: -1 }` to fetch a user's daily progress logs (for heatmaps) without full collection scans.
- **SheetProgress Model (`src/models/SheetProgress.js`)**:
  - Unique compound index on `{ userId: 1, sheetType: 1, problemId: 1 }` to prevent duplicate completions.
- **Message Model (`src/models/Message.js`)**:
  - Compound index on `{ communityId: 1, createdAt: -1 }` to fetch chatroom histories sorted by date.

---

### 2.7 Route Controllers & Features

#### Auth Controller (`src/controllers/authController.js`)
- Handles registration, password hashing (using bcrypt with 12 rounds), login attempts, and leaderboard queries.
- Updates daily activity streaks by comparing the user's `lastActiveDate` with the current date.

#### AI Resume Auditor (`src/controllers/resumeController.js`)
- Inspects resume text against target roles.
- Formats achievements to match the Harshibar LaTeX template structure.
- Returns fully compiled LaTeX code along with instructions to paste it into the Overleaf editor template.

#### Platform Tracker (`src/controllers/trackerController.js`)
- Integrates with the LeetCode statistics API to retrieve solved problem counts.
- Updates user XP and levels based on problem completions (10 XP per problem).

#### Sheet Progress Controller (`src/controllers/sheetController.js`)
- Updates checked problem statuses inside Striver A-Z, Love Babbar, or NeetCode sheets.
- Awards 15 XP for every completed problem.

#### Hackathon Controller (`src/controllers/hackathonController.js`)
- Queries active contests via Apify Devpost tasks.
- Falls back to database listings or mock lists in offline states.

#### Quest Controller (`src/controllers/questController.js`)
- Retrieves daily and weekly quest checklists.
- Processes claims by comparing daily activities against quest requirements, applying a 1.5x multiplier for users with active streaks of 5+ days.

---

### 2.8 WebSockets Handler (`backend/src/utils/socket.js`)
- Integrates Socket.IO into worker threads.
- Validates handshakes using JWT parameters.
- Leverages room endpoints (`socket.join`, `socket.leave`) to group users by community chatrooms.
- Persists messages asynchronously to MongoDB and broadcasts them to all clients in the corresponding room.
