import React, { useState } from 'react';
import { Layers, CheckCircle2, ChevronRight, Award, Search, Database, Code, Cpu, Sparkles, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'All', name: 'All Stack' },
  { id: 'Distributed Systems', name: 'Distributed Systems' },
  { id: 'Full Stack', name: 'Full Stack (MERN)' },
  { id: 'Frontend', name: 'Frontend (HTML/CSS)' },
  { id: 'AI/ML', name: 'AI & ML' },
  { id: 'Mobile', name: 'Mobile App Dev' }
];

const PROJECTS_DATA = [
  // ================= DISTRIBUTED SYSTEMS =================
  {
    id: 1,
    category: "Distributed Systems",
    title: "Custom Distributed Key-Value Store (Raft)",
    desc: "Build a replicated key-value storage engine utilizing the Raft consensus algorithm for leader election and log replication.",
    difficulty: "Hard",
    skills: ["Raft Consensus", "Go / Rust", "gRPC", "Network I/O"],
    milestones: ["Implement leader election heartbeat loop", "Construct replicated entry logs", "Handle cluster partitioning recovery"]
  },
  {
    id: 2,
    category: "Distributed Systems",
    title: "High-Performance Reverse Proxy & Load Balancer",
    desc: "Design a load balancer that distributes traffic across target servers using round-robin, IP-hash, and least-connections routing algorithms.",
    difficulty: "Hard",
    skills: ["C / Rust", "TCP Socket Programming", "HTTP Parsing", "Epoll/Kqueue"],
    milestones: ["Handle TCP connections multiplexing", "Implement Least-Connections scheduling", "Integrate active background server health-checks"]
  },
  {
    id: 3,
    category: "Distributed Systems",
    title: "Distributed Message Queue (Kafka Lite)",
    desc: "Build a highly scalable message broker with partition logs, topic publishers, and consumer offsets handling parallel delivery streams.",
    difficulty: "Hard",
    skills: ["Distributed Logs", "TCP", "Binary Protocols", "File I/O Optimization"],
    milestones: ["Implement index-offset partition files on disk", "Handle consumer group coordinators", "Integrate cluster data replication sync"]
  },
  {
    id: 4,
    category: "Distributed Systems",
    title: "Serverless FaaS Engine (Custom Containers)",
    desc: "Construct an event-driven function-as-a-service engine that spins up micro-containers dynamically on incoming HTTP calls.",
    difficulty: "Hard",
    skills: ["Docker API", "Container Networking", "Golang", "Process Isolation"],
    milestones: ["Spin up isolated Docker containers dynamically", "Optimize cold-start cache warming", "Implement load routing concurrency limits"]
  },
  {
    id: 5,
    category: "Distributed Systems",
    title: "Distributed Cache with Consistent Hashing",
    desc: "Design a peer-to-peer in-memory cache system that routes keys through a consistent hashing ring to handle server joins and leaves with minimal reshuffle.",
    difficulty: "Medium",
    skills: ["Consistent Hashing", "P2P Sockets", "Mutex Lock Primitives", "Caching Policies"],
    milestones: ["Build consistent hashing ring algorithm", "Implement peer cache replication nodes", "Configure LRU cache eviction logic"]
  },
  {
    id: 6,
    category: "Distributed Systems",
    title: "Custom Distributed Web Crawler",
    desc: "Implement a parallel crawler that coordinates worker agents to parse URLs, compile sitemaps, and avoid duplicate domain requests.",
    difficulty: "Hard",
    skills: ["Distributed Queues", "Redis Labs", "Node.js Clustering", "DNS Cache Resolver"],
    milestones: ["Implement bloom filters for URL visited history", "Configure master-worker coordinator node", "Integrate robots.txt parsing engine"]
  },
  {
    id: 7,
    category: "Distributed Systems",
    title: "Peer-to-Peer File Sharing Engine (BitTorrent Lite)",
    desc: "Construct a peer-to-peer file sharing protocol that parses torrent files, connects to trackers, and requests file pieces in parallel.",
    difficulty: "Hard",
    skills: ["P2P Networking", "TCP/UDP sockets", "SHA-1 hashing", "Buffer streams"],
    milestones: ["Parse metainfo files and communicate with trackers", "Build peer-wire choke/unchoke handshake state", "Implement parallel piece download pipeline"]
  },
  {
    id: 8,
    category: "Distributed Systems",
    title: "Distributed Database Sharding Proxy",
    desc: "Design a proxy server for database clusters that shards data rows across multiple SQL nodes based on hash routing keys.",
    difficulty: "Hard",
    skills: ["SQL Parsing", "Database Sharding", "TCP Proxies", "Query Router"],
    milestones: ["Intercept and parse raw SQL query clauses", "Map records to cluster nodes dynamically", "Aggregate multi-node result lists"]
  },
  {
    id: 9,
    category: "Distributed Systems",
    title: "API Gateway with Token-Bucket Rate Limiter",
    desc: "Construct an API routing gateway featuring token-bucket rate limits, CORS middleware, and automated bearer token authentication.",
    difficulty: "Medium",
    skills: ["API Routing", "Redis Keyspace", "Token-Bucket Limiting", "JWT"],
    milestones: ["Build Redis-based atomic token increment logic", "Create reverse proxy routing layers", "Handle custom middleware pipelines"]
  },
  {
    id: 10,
    category: "Distributed Systems",
    title: "Distributed Log Aggregator & Search (ELK Lite)",
    desc: "Build a log pipeline where agent processes stream application logs to a central server that indexes logs for rapid regex searching.",
    difficulty: "Hard",
    skills: ["Log Streaming", "Inverted Indexing", "gRPC Sockets", "Search Engine Optimization"],
    milestones: ["Build client daemon log watcher streams", "Construct inverted index indexing loops", "Implement search query endpoints"]
  },

  // ================= FULL STACK (MERN) =================
  {
    id: 11,
    category: "Full Stack",
    title: "Collaborative Google Docs-style Rich Text Editor",
    desc: "Build a rich text editor supporting real-time multi-user document collaboration using Operational Transformation (OT) or Yjs.",
    difficulty: "Hard",
    skills: ["Yjs / CRDT", "React", "Node.js", "WebSockets / Socket.io"],
    milestones: ["Connect rich text editors to WebSocket pipelines", "Implement operational conflict resolution library", "Save document history logs"]
  },
  {
    id: 12,
    category: "Full Stack",
    title: "Microservices Ecommerce Engine",
    desc: "Design an e-commerce platform using microservices for auth, inventory tracking, checkout cart, and stripe payments.",
    difficulty: "Hard",
    skills: ["MERN Stack", "RabbitMQ Message Broker", "Docker", "Stripe API"],
    milestones: ["Build distinct product/payment microservice APIs", "Connect microservices via RabbitMQ queues", "Handle transaction safety webhooks"]
  },
  {
    id: 13,
    category: "Full Stack",
    title: "E-learning Platform with Live Video Classrooms",
    desc: "Construct a learning dashboard where teachers stream live lectures to students, manage classrooms, and upload syllabus PDFs.",
    difficulty: "Hard",
    skills: ["React", "Express", "MongoDB", "WebRTC", "Socket.io"],
    milestones: ["Establish WebRTC peer-to-peer media streams", "Implement classroom chat feeds", "Configure secure file storage endpoints"]
  },
  {
    id: 14,
    category: "Full Stack",
    title: "Real-Time Dev Kanban Board (Jira Clone)",
    desc: "Build a drag-and-drop workspace for team sprints, featuring real-time state synchronization across team members.",
    difficulty: "Medium",
    skills: ["React-beautiful-dnd", "Node.js", "Express", "Socket.io", "MongoDB"],
    milestones: ["Create drag-and-drop column boards UI", "Sync board position updates in real-time", "Setup user action history feeds"]
  },
  {
    id: 15,
    category: "Full Stack",
    title: "SaaS Analytics & Billing Dashboard",
    desc: "Build a full-featured SaaS web app with multi-tenant account dashboards, usage statistics graphs, and subscription billing.",
    difficulty: "Medium",
    skills: ["Next.js", "PostgreSQL", "Prisma ORM", "Stripe Checkout", "Chart.js"],
    milestones: ["Configure SaaS tenant authentication", "Build usage event logs aggregator", "Setup Stripe recurring subscription models"]
  },
  {
    id: 16,
    category: "Full Stack",
    title: "Secure Developer Code Sandbox & Runner",
    desc: "Design a web platform that executes user-submitted code in sandboxed processes and evaluates outputs against test parameters.",
    difficulty: "Hard",
    skills: ["Node.js", "Docker Nodes", "Child Process API", "React"],
    milestones: ["Initialize code compiler API handler", "Deploy secure sandboxed evaluation containers", "Render execution outputs and times"]
  },
  {
    id: 17,
    category: "Full Stack",
    title: "Social Network with Graph Database Connections",
    desc: "Construct a social network featuring recommendation algorithms built on graph-based database nodes (Neo4j or MongoDB graph pipelines).",
    difficulty: "Hard",
    skills: ["MERN Stack", "Neo4j / Graph queries", "AI recommendation", "JWT Auths"],
    milestones: ["Build user follow/friend graph relationships", "Generate feed posts based on node proximity", "Implement real-time messaging chats"]
  },
  {
    id: 18,
    category: "Full Stack",
    title: "Crypto Portfolio Tracker with WebSocket Feeds",
    desc: "Build a crypto asset manager that updates live pricing curves dynamically using external exchange WebSocket APIs.",
    difficulty: "Medium",
    skills: ["React", "NodeJS", "Crypto APIs", "Tailwind CSS", "Recharts"],
    milestones: ["Subscribe backend to live market pricing channels", "Setup user transaction database schemas", "Visualize live pricing curves"]
  },
  {
    id: 19,
    category: "Full Stack",
    title: "Corporate HRMS & Performance Evaluation System",
    desc: "Construct a corporate portal for employee records, leaves tracking, and peer performance evaluation loops.",
    difficulty: "Medium",
    skills: ["React", "Express", "MongoDB", "Mongoose refs", "NodeMailer"],
    milestones: ["Setup corporate directory profiles", "Construct leave request/approval states", "Build feedback submission forms"]
  },
  {
    id: 20,
    category: "Full Stack",
    title: "Decentralized Crowdfunding Platform",
    desc: "Build a crowdfunding web app where campaigns are backed by crypto transactions, integrating web3 client libraries.",
    difficulty: "Hard",
    skills: ["React", "Ethereum Smart Contracts", "Solidity", "Ethers.js", "Metamask"],
    milestones: ["Deploy funding smart contract templates", "Integrate metamask account authorizations", "Build campaign management dashboards"]
  },

  // ================= FRONTEND (HTML/CSS/JS) =================
  {
    id: 21,
    category: "Frontend",
    title: "Interactive Data Structure & Algorithm Sandbox",
    desc: "Build a visual simulator showing step-by-step executions of Sorting, Graph traversals, and Binary trees.",
    difficulty: "Medium",
    skills: ["HTML5 Canvas / SVG", "Vanilla JavaScript", "Framer Motion", "Tailwind CSS"],
    milestones: ["Render visual array elements dynamically", "Create stepwise pausing/stepping animations", "Animate graph BFS/DFS paths"]
  },
  {
    id: 22,
    category: "Frontend",
    title: "Interactive System Architecture Canvas",
    desc: "Design a drag-and-drop system diagram generator enabling users to map networks (e.g. Server, Client, Database) with connected lines.",
    difficulty: "Hard",
    skills: ["React", "React Flow / SVG lines", "Dnd-kit", "Local Storage"],
    milestones: ["Create drag-and-drop node placement catalog", "Draw interactive node connect lines", "Export canvas schemas to JSON/PNG"]
  },
  {
    id: 23,
    category: "Frontend",
    title: "Advanced CSS & Framer Motion UI Kit",
    desc: "Build a reusable, accessibility-compliant components library with rich animations, glassmorphism templates, and theme toggling.",
    difficulty: "Medium",
    skills: ["React", "CSS Variables", "Tailwind CSS", "Framer Motion"],
    milestones: ["Setup design token variable sheets", "Build smooth sliding panel components", "Implement keyboard accessible dropdowns"]
  },
  {
    id: 24,
    category: "Frontend",
    title: "Retro Web-Based OS Simulator",
    desc: "Design a complete retro desktop interface in the browser with draggable windows, file trees, and a working terminal.",
    difficulty: "Medium",
    skills: ["React", "Vanilla CSS Grid/Flexbox", "Drag APIs", "Custom Shell Logic"],
    milestones: ["Create draggable and resizable windows", "Build working file-manager paths UI", "Implement simple terminal inputs parser"]
  },
  {
    id: 25,
    category: "Frontend",
    title: "Dynamic Video Editor & Overlay Studio",
    desc: "Build a browser tool that cuts audio/video feeds, layers title screens, and exports timings in raw JSON schemas.",
    difficulty: "Hard",
    skills: ["HTML5 Video API", "Timeline markers", "React", "Tailwind CSS"],
    milestones: ["Render video track timeline sliders", "Create timeline scissor/cut boundaries", "Export edit logs schema metadata"]
  },
  {
    id: 26,
    category: "Frontend",
    title: "Visual Markdown Editor & Presentation Tool",
    desc: "Construct a split-pane Markdown editor that renders parsed HTML in real-time and converts headings to slides.",
    difficulty: "Medium",
    skills: ["Markdown Parser", "React", "Vanilla CSS Page Breaks", "Theme CSS"],
    milestones: ["Configure real-time parsing compiler", "Build split-pane visual interface", "Create presentation slideshow player"]
  },
  {
    id: 27,
    category: "Frontend",
    title: "3D Portfolio Website with Three.js",
    desc: "Create a modern 3D portfolio site showcasing interactive floating models and camera scroll-path animations.",
    difficulty: "Hard",
    skills: ["Three.js / React Three Fiber", "WebGL shaders", "Framer Motion", "CSS3D"],
    milestones: ["Set up WebGL 3D cameras and lighting", "Configure interactive mesh click movements", "Integrate camera path scroll tracking"]
  },
  {
    id: 28,
    category: "Frontend",
    title: "Real-Time Stock Market Dashboard",
    desc: "Build a fast-rendering market dashboard charting price histories and updating candles dynamically.",
    difficulty: "Medium",
    skills: ["Chart.js / ApexCharts", "CSS grid templates", "Web APIs", "HTML5"],
    milestones: ["Render candle chart components", "Integrate fast interval DOM updates", "Create clean responsive layout grids"]
  },
  {
    id: 29,
    category: "Frontend",
    title: "Visual CSS Grid & Flexbox Layout Generator",
    desc: "Create an interactive visual tool to help developers build CSS grids and flexbox styles dynamically and copy CSS.",
    difficulty: "Medium",
    skills: ["React", "CSS Variables", "Grid layout system", "State managers"],
    milestones: ["Build visual grid builder interfaces", "Provide real-time grid cell sizing sliders", "Generate clean copyable CSS codes"]
  },
  {
    id: 30,
    category: "Frontend",
    title: "Responsive Travel Booking UI",
    desc: "Build a highly responsive, pixel-perfect travel booking homepage layout featuring glassmorphism cards and smooth filters.",
    difficulty: "Easy",
    skills: ["HTML5", "Vanilla CSS", "Flexbox layouts", "Responsive design"],
    milestones: ["Develop semantic layout page tags", "Build custom dropdown hotel filtering UI", "Establish responsive media-queries"]
  },

  // ================= AI & ML =================
  {
    id: 31,
    category: "AI/ML",
    title: "Conversational AI PDF Search Engine (RAG)",
    desc: "Build a RAG system that parses PDF documents, processes vector embeddings, and answers queries contextually using LLMs.",
    difficulty: "Hard",
    skills: ["LangChain", "Vector DB (Chroma/Pinecone)", "OpenAI API", "Python"],
    milestones: ["Extract text blocks from PDF files", "Compute and index vector embeddings", "Construct context-injected prompt templates"]
  },
  {
    id: 32,
    category: "AI/ML",
    title: "Real-Time Object Detection Pipeline (YOLO)",
    desc: "Design a computer vision application that captures camera streams and identifies target objects with bounding boxes using YOLO.",
    difficulty: "Hard",
    skills: ["PyTorch / OpenCV", "YOLO Architecture", "Python", "GPU Threading"],
    milestones: ["Capture webcam video frames dynamically", "Run frames through YOLO model weight files", "Draw overlay tracking boundary boxes"]
  },
  {
    id: 33,
    category: "AI/ML",
    title: "Custom Text Summarizer & Sentiment Classifier",
    desc: "Deploy a machine learning API that analyzes input paragraphs, computes sentiment indexes, and generates summaries.",
    difficulty: "Medium",
    skills: ["Hugging Face Transformers", "FastAPI", "Python", "NLP Pipeline"],
    milestones: ["Build HuggingFace pipeline loaders", "Create sentiment index output APIs", "Setup FastAPI asynchronous request queues"]
  },
  {
    id: 34,
    category: "AI/ML",
    title: "Customer Churn Prediction Engine (XGBoost)",
    desc: "Train an ML classification model that predicts user attrition probabilities using company dataset features.",
    difficulty: "Medium",
    skills: ["Scikit-Learn", "XGBoost", "Pandas & NumPy", "Data Pipeline"],
    milestones: ["Perform dataset cleanup and feature scaling", "Train classification model using XGBoost", "Render ROC/AUC accuracy score charts"]
  },
  {
    id: 35,
    category: "AI/ML",
    title: "Deep Learning Signature Fraud Detection",
    desc: "Build a Siamese neural network model that compares signatures to verify authentication and detect potential frauds.",
    difficulty: "Hard",
    skills: ["Keras / TensorFlow", "Siamese Network", "Image processing", "Python"],
    milestones: ["Pre-process handwritten signature datasets", "Build dual-input Siamese networks", "Set threshold classification outputs"]
  },
  {
    id: 36,
    category: "AI/ML",
    title: "AI-Powered Code Autocomplete Engine",
    desc: "Build a local code-completion helper using fine-tuned small language models (like DeepSeek Coder 1.3B).",
    difficulty: "Hard",
    skills: ["SLM Fine-tuning", "FastAPI", "VLLM Inference", "Python"],
    milestones: ["Build model inference pipelines", "Setup fast code autocomplete APIs", "Configure IDE plugin hooks integrations"]
  },
  {
    id: 37,
    category: "AI/ML",
    title: "Real-Time Facial Recognition Security Gateway",
    desc: "Construct an entry authorization service validating face geometries against authorized staff databases in real-time.",
    difficulty: "Hard",
    skills: ["Face-Recognition lib", "OpenCV", "SQLAlchemy", "Python"],
    milestones: ["Detect face landmarks from webcam frames", "Compare face vector encodings to database logs", "Trigger alert events for unknown entries"]
  },
  {
    id: 38,
    category: "AI/ML",
    title: "Distributed Model Training Pipeline",
    desc: "Create an orchestration script that divides large model weights training pipelines across multiple compute servers.",
    difficulty: "Hard",
    skills: ["PyTorch DDP", "Docker Swarm", "CUDA", "Distributed Systems"],
    milestones: ["Configure data parallel dataset splits", "Deploy synchronization node trackers", "Monitor GPU cluster memory footprints"]
  },
  {
    id: 39,
    category: "AI/ML",
    title: "AI Medical Image Segmentation Tool",
    desc: "Train a UNet CNN model to segment and highlight anomalies (like tumors) in chest X-Rays/MRI scan images.",
    difficulty: "Hard",
    skills: ["TensorFlow", "UNet architecture", "Dicom processing", "Python"],
    milestones: ["Parse medical DICOM image formats", "Train convolutional UNet neural nets", "Visualize segmentation prediction masks"]
  },
  {
    id: 40,
    category: "AI/ML",
    title: "Recommendation Engine (Collaborative Filtering)",
    desc: "Train an ALS recommendation algorithm that predicts user movie ratings and serves dynamic feed lists.",
    difficulty: "Medium",
    skills: ["PySpark", "Collaborative Filtering", "Machine Learning", "Python"],
    milestones: ["Build rating index feature columns", "Train Matrix Factorization Models", "Implement top-K rating recommendation APIs"]
  },

  // ================= MOBILE =================
  {
    id: 41,
    category: "Mobile",
    title: "Offline-First Syncing Todo & Tasks App",
    desc: "Build a mobile task manager that saves logs locally and syncs back to cloud databases on internet reconnects.",
    difficulty: "Medium",
    skills: ["React Native", "SQLite / WatermelonDB", "Node.js API", "Sync protocols"],
    milestones: ["Build SQLite local data schemas", "Implement network connection listeners", "Configure row sync log controllers"]
  },
  {
    id: 42,
    category: "Mobile",
    title: "E-Commerce App with AR Product Previews",
    desc: "Build a shopping mobile app featuring AR tools letting users view 3D models of products in their rooms.",
    difficulty: "Hard",
    skills: ["React Native / Flutter", "ARKit / ARCore", "NodeJS API", "OAuth2"],
    milestones: ["Integrate mobile camera AR view ports", "Load and render glTF 3D objects", "Design shopping cart and checkout UI"]
  },
  {
    id: 43,
    category: "Mobile",
    title: "Ride-Sharing App with Live Maps Tracking",
    desc: "Construct a mobile taxi booking app showing passenger requests, driver GPS locations, and active route paths.",
    difficulty: "Hard",
    skills: ["React Native", "Google Maps SDK", "Socket.io Streams", "Node.js"],
    milestones: ["Show client location maps", "Establish persistent driver GPS socket feeds", "Plot route directions on maps"]
  },
  {
    id: 44,
    category: "Mobile",
    title: "Fitness & Workout Planner with Sensors",
    desc: "Build a health monitoring mobile app integrating phone accelerators and step counters to track user step rates.",
    difficulty: "Medium",
    skills: ["React Native", "CoreMotion / CoreLocation", "Redux Toolkit", "SVG Charts"],
    milestones: ["Configure mobile physical sensor hooks", "Aggregate daily step logs", "Display calorie burning history curves"]
  },
  {
    id: 45,
    category: "Mobile",
    title: "Secure Chat App with End-to-End Encryption",
    desc: "Build a chat app encrypting message payloads locally on device before delivery to central servers.",
    difficulty: "Hard",
    skills: ["Flutter", "Signal Protocol", "SQLite", "Firebase Cloud Messaging"],
    milestones: ["Generate local device public/private keys", "Encrypt messages using Signal SDK", "Handle push notification decryption"]
  },
  {
    id: 46,
    category: "Mobile",
    title: "Fintech Expense Tracker with OCR Receipt Scan",
    desc: "Create an expense manager app scanning receipts, parsing price sums using OCR, and auto-logging expenses.",
    difficulty: "Medium",
    skills: ["React Native", "Google Vision OCR API", "Express", "SQLite"],
    milestones: ["Capture receipt photos via mobile camera", "Send image payloads to Google Vision OCR APIs", "Parse price figures and add record logs"]
  },
  {
    id: 47,
    category: "Mobile",
    title: "Social Food Delivery App with Live Driver GPS",
    desc: "Construct a mobile food ordering application listing restaurants and tracking order delivery paths.",
    difficulty: "Medium",
    skills: ["React Native", "Express", "MongoDB", "Socket.io", "Geolocation"],
    milestones: ["Build menu directory shopping carts", "Integrate active socket driver coordinates", "Plot delivery path steps"]
  },
  {
    id: 48,
    category: "Mobile",
    title: "Mobile Meditation App with Audio Player",
    desc: "Create a meditation mobile app containing background theme playlists, timer routines, and calming sound controls.",
    difficulty: "Easy",
    skills: ["React Native", "Expo AV Sockets", "Redux Store", "Tailwind CSS"],
    milestones: ["Implement mobile background audio player loops", "Design visual countdown timers", "Setup meditation session tracker logs"]
  },
  {
    id: 49,
    category: "Mobile",
    title: "Smart IoT Home Automation Controller",
    desc: "Build a controller app sending commands to home appliances (e.g. lights, thermostats) using MQTT queues.",
    difficulty: "Medium",
    skills: ["React Native / Flutter", "MQTT Protocol", "ESP8266 / IoT", "JSON"],
    milestones: ["Establish connection to MQTT message brokers", "Design home dashboard switch controls UI", "Monitor live status feed logs"]
  },
  {
    id: 50,
    category: "Mobile",
    title: "Real-Time Mobile Language Translator",
    desc: "Create a mobile app that records user audio, translates speech to target languages, and reads it out.",
    difficulty: "Medium",
    skills: ["React Native", "Google Translate API", "Speech-To-Text SDK", "Audio"],
    milestones: ["Configure voice recorder audio buffers", "Send speech to translation APIs", "Implement text-to-speech audio outputs"]
  }
];

export default function ProjectList() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = PROJECTS_DATA.filter((proj) => {
    const matchesCategory = selectedCat === 'All' || proj.category === selectedCat;
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proj.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          proj.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Layers className="text-orange-600 w-8 h-8 animate-pulse" />
            PROJECT-BASED LEARNING
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Build Google-Tier resumes by compiling corporate production portfolios
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full shrink-0">
          <Award size={14} />
          <span>Curated Blueprints: {PROJECTS_DATA.length}</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, description, or specific stack skills (e.g. Raft, WebRTC, PyTorch)..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-950 font-mono"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                selectedCat === cat.id 
                  ? 'bg-orange-600 border-orange-600 text-white shadow-sm' 
                  : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-2 py-16 bg-white border border-zinc-200 rounded-3xl text-center text-zinc-400 font-mono text-xs">
            No projects matched your filtering criteria. Try another category or adjust search terms.
          </div>
        ) : (
          filteredProjects.map((proj) => (
            <div 
              key={proj.id}
              className="bg-white border border-zinc-200 hover:border-orange-250 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all text-left"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-[9px] font-bold text-orange-600 font-mono rounded-full uppercase">
                    {proj.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">{proj.category}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-zinc-950 tracking-tight leading-tight">{proj.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{proj.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {proj.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-zinc-100 text-zinc-650 font-mono text-[9px] rounded font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Milestones list */}
                <div className="pt-4 border-t border-zinc-100 space-y-2">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase block font-bold tracking-wider">Project Milestones</span>
                  <div className="space-y-1.5">
                    {proj.milestones.map((m, i) => (
                      <div key={i} className="flex gap-2 items-center text-[10px] text-zinc-650 font-mono">
                        <CheckCircle2 size={12} className="text-orange-500 shrink-0" />
                        <span className="truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/projects/reviewer')}
                className="w-full mt-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Start Project Work <ChevronRight size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
