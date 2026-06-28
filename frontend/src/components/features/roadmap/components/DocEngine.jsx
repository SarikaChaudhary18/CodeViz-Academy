import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Copy, Check, ShieldAlert, Folder, FileCode, CheckSquare, Sparkles, Terminal } from 'lucide-react';

const TECH_DOCS = {
  'web-dev': {
    'react': {
      title: 'React.jsx',
      fullName: 'React.js Component Handbook',
      intro: 'React is a declarative JavaScript library for building component-based interfaces. Built by Facebook in 2013 to handle graph-based rendering performance.',
      analogy: 'Think of React like a painter with a magic blueprint. Instead of repainting the entire room when you buy a new chair, the painter looks at the blueprint, finds the exact spot of the chair, and replaces only that piece.',
      errors: [
        { bad: 'useEffect(() => {\n  fetchData();\n}) // Missing dependency array triggers on every single render cycle', good: 'useEffect(() => {\n  fetchData();\n}, [dependency]) // Only runs when dependencies change' },
        { bad: 'state.push(item);\nsetState(state); // Mutating state directly bypasses Virtual DOM diffing', good: 'setState([...state, item]); // Immutable update creates new reference' }
      ],
      practices: 'Use Functional Components with Hooks. Decouple side-effects from layouts. Employ React.memo() and useMemo() strictly to optimize expensive renders.'
    },
    'node': {
      title: 'NodeJS.js',
      fullName: 'Node.js Runtime Specs',
      intro: 'Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser, powered by V8 chrome engine.',
      analogy: 'Node.js is like a fast-food drive-through. One cashier takes all the orders quickly. While the kitchen cooks the burgers (non-blocking thread pool), the cashier takes the next order instead of making you wait.',
      errors: [
        { bad: 'const data = fs.readFileSync("/file.txt"); // Blocks the single execution thread', good: 'fs.readFile("/file.txt", (err, data) => {\n  // Non-blocking callback thread execution\n});' },
        { bad: 'app.get("/data", (req, res) => {\n  db.query(..., (err, result) => {\n    // Missing error handling crashes server\n    res.send(result);\n  });\n});', good: 'app.get("/data", async (req, res, next) => {\n  try {\n    const result = await db.query(...);\n    res.send(result);\n  } catch (err) {\n    next(err); // Route errors to Express error handler\n  }\n});' }
      ],
      practices: 'Enforce environment-based config files. Use clustering for multi-threaded performance. Always route async errors to global express error handlers.'
    },
    'docker': {
      title: 'Dockerfile',
      fullName: 'Docker Containerizations',
      intro: 'Docker is a platform for developing, shipping, and running applications inside lightweight, isolated execution sandboxes called containers.',
      analogy: 'Docker is like shipping containers on a cargo ship. No matter if a container holds toys or electronics, it fits perfectly on the ship and does not leak onto other containers.',
      errors: [
        { bad: 'FROM node:latest\nCOPY . .\nRUN npm install # Installs dependencies on every file change', good: 'FROM node:20-alpine\nCOPY package*.json ./\nRUN npm ci\nCOPY . . # Leverages Layer Caching for lightning builds' },
        { bad: 'USER root\nCMD ["node", "server.js"] // Running with full system root privilege', good: 'USER node\nCMD ["node", "server.js"] // Unprivileged container execution safety' }
      ],
      practices: 'Use specific, slim base tags (like -alpine). Minimize layers by chaining commands. Never store secret keys, passwords, or tokens in Dockerfiles.'
    },
    'kubernetes': {
      title: 'Kubernetes.yaml',
      fullName: 'Kubernetes Orchestrations',
      intro: 'Kubernetes (K8s) is an open-source container orchestration system for automating software deployment, scaling, and management.',
      analogy: 'Kubernetes is like a symphony conductor. If a violin player (container) slips and falls, the conductor immediately signals a standby violinist to take their place so the music never stops.',
      errors: [
        { bad: 'apiVersion: apps/v1\nkind: Deployment\nspec:\n  # Missing resources requests and limits configurations', good: 'resources:\n  limits:\n    cpu: "500m"\n    memory: "512Mi"\n  requests:\n    cpu: "250m"\n    memory: "256Mi" // Prevent cluster resource hogging' },
        { bad: 'livenessProbe:\n  httpGet:\n    path: /health\n  initialDelaySeconds: 0 # Probe fires before server starts booting', good: 'livenessProbe:\n  httpGet:\n    path: /health\n  initialDelaySeconds: 15 // Allow server warmup time' }
      ],
      practices: 'Define resource requests and limits on every pod. Configure liveness and readiness probes. Store credentials using Kubernetes Secrets.'
    }
  },
  'dsa': {
    'arrays': {
      title: 'Arrays.py',
      fullName: 'Array & String Manipulation',
      intro: 'Arrays store elements in contiguous memory slots. Essential for fast indexing O(1), but insertion/deletion requires O(n) shifts.',
      analogy: 'Imagine a row of numbered lockers. You can go to Locker #5 instantly, but if you want to insert a new locker in the middle, you have to move all lockers after it to the right.',
      errors: [
        { bad: 'def remove_item(arr, val):\n  for x in arr:\n    if x == val: arr.remove(x) # Mutating array during loop skips index checking', good: 'def remove_item(arr, val):\n  return [x for x in arr if x != val] # Safe immutable array filter' },
        { bad: 'def has_duplicates(arr):\n  for i in range(len(arr)):\n    for j in range(i+1, len(arr)):\n      if arr[i] == arr[j]: return True # O(n^2) brute force lookup', good: 'def has_duplicates(arr):\n  return len(arr) != len(set(arr)) # O(n) hash set validation' }
      ],
      practices: 'Check for empty, null, or single-element inputs. Use hash sets/maps to trade space for O(n) speed. Keep pointers within index bounds.'
    },
    'linked-lists': {
      title: 'LinkedList.py',
      fullName: 'Linked Lists Reference Guide',
      intro: 'A sequential collection of data elements where each element points to the next, bypassing contiguous memory restrictions.',
      analogy: 'Think of a scavenger hunt. You only know the starting point. At the starting point, you find a clue pointing to the next location, and so on until the end.',
      errors: [
        { bad: 'curr = head\nwhile curr:\n  curr = curr.next\nprint(curr.val) # Null pointer exception after loop exit', good: 'curr = head\nwhile curr and curr.next:\n  curr = curr.next\nprint(curr.val) # Safe traversal stops at last valid node' },
        { bad: 'node.next = new_node\nnew_node.next = node.next # Breaking the chain creates a circular memory leak', good: 'new_node.next = node.next\nnode.next = new_node # Order is critical to stitch list safely' }
      ],
      practices: 'Draw pointers on paper. Utilize dummy nodes to simplify head updates. Use two pointers (slow/fast) to find midpoints and loops.'
    },
    'trees': {
      title: 'BST.py',
      fullName: 'Binary Search Trees specs',
      intro: 'Hierarchical node collection where each node has at most two children, keeping left values smaller and right values larger.',
      analogy: 'Like sorting files in a drawer. You look at the center alphabet. If the name is before, you look only in the left partition, ignoring the entire right side.',
      errors: [
        { bad: 'def insert(root, val):\n  if val < root.val:\n    root.left = Node(val) # Overwrites existing left subtrees', good: 'def insert(root, val):\n  if not root: return Node(val)\n  if val < root.val: root.left = insert(root.left, val)\n  else: root.right = insert(root.right, val)\n  return root' }
      ],
      practices: 'Verify tree balance to prevent O(n) skew degradation. Use breadth-first search for shortest distance. Recursive base cases must handle Null nodes.'
    },
    'dp': {
      title: 'DP.py',
      fullName: 'Dynamic Programming Specs',
      intro: 'Algorithmic design paradigm that solves complex problems by breaking them into overlapping subproblems, storing intermediate results.',
      analogy: 'If I ask you what 1+1+1+1+1 is, you say 5. If I add another "+1", you say 6 instantly because you remembered the previous 5 instead of recount.',
      errors: [
        { bad: 'def fib(n):\n  if n <= 1: return n\n  return fib(n-1) + fib(n-2) # Exponential O(2^n) call stack crash', good: 'def fib(n, memo={}):\n  if n in memo: return memo[n]\n  if n <= 1: return n\n  memo[n] = fib(n-1, memo) + fib(n-2, memo) # Linear O(n) memoized path' }
      ],
      practices: 'Identify the state variable first. Write recursive relation before coding. Start with memoization (top-down) then optimize to tabulation (bottom-up).'
    }
  },
  'devops': {
    'linux': {
      title: 'Linux.sh',
      fullName: 'Linux Shell & Bash Scripts',
      intro: 'Unix-based operating systems power production containers. Bash scripting automates server logs, pipeline deployment, and permission check loops.',
      analogy: 'Imagine a command center. Instead of clicking 10 buttons manually, you write a script that presses them in sequence with safety triggers.',
      errors: [
        { bad: '#!/bin/bash\nrm -rf /app/$DIR # Critical bug: if $DIR is empty, deletes the root dir!', good: '#!/bin/bash\nset -euo pipefail # Halt script on variable errors\nrm -rf /app/"${DIR:?}" # Throw error if DIR is unset' }
      ],
      practices: 'Always set pipefail in scripts. Double quote variables to avoid whitespace split bugs. Avoid writing secrets directly to shell histories.'
    },
    'docker': {
      title: 'Dockerfile',
      fullName: 'Docker Containerizations',
      intro: 'Docker is a platform for developing, shipping, and running applications inside lightweight, isolated execution sandboxes called containers.',
      analogy: 'Docker is like shipping containers on a cargo ship. No matter if a container holds toys or electronics, it fits perfectly on the ship and does not leak onto other containers.',
      errors: [
        { bad: 'FROM node:latest\nCOPY . .\nRUN npm install # Installs dependencies on every file change', good: 'FROM node:20-alpine\nCOPY package*.json ./\nRUN npm ci\nCOPY . . # Leverages Layer Caching for lightning builds' },
        { bad: 'USER root\nCMD ["node", "server.js"] // Running with full system root privilege', good: 'USER node\nCMD ["node", "server.js"] // Unprivileged container execution safety' }
      ],
      practices: 'Use specific, slim base tags (like -alpine). Minimize layers by chaining commands. Never store secret keys, passwords, or tokens in Dockerfiles.'
    },
    'kubernetes': {
      title: 'Kubernetes.yaml',
      fullName: 'Kubernetes Orchestrations',
      intro: 'Kubernetes (K8s) is an open-source container orchestration system for automating software deployment, scaling, and management.',
      analogy: 'Kubernetes is like a symphony conductor. If a violin player (container) slips and falls, the conductor immediately signals a standby violinist to take their place so the music never stops.',
      errors: [
        { bad: 'apiVersion: apps/v1\nkind: Deployment\nspec:\n  # Missing resources requests and limits configurations', good: 'resources:\n  limits:\n    cpu: "500m"\n    memory: "512Mi"\n  requests:\n    cpu: "250m"\n    memory: "256Mi" // Prevent cluster resource hogging' }
      ],
      practices: 'Define resource requests and limits on every pod. Configure liveness and readiness probes. Store credentials using Kubernetes Secrets.'
    },
    'nginx': {
      title: 'Nginx.conf',
      fullName: 'Nginx Reverse Proxy Configurations',
      intro: 'High-performance HTTP server and reverse proxy that acts as the entry gateway to backend nodes, handling rate limiting and SSL terminates.',
      analogy: 'Think of Nginx like a security guard at an office lobby. The guard checks badges, redirects people to the correct elevator, and prevents entry spam.',
      errors: [
        { bad: 'server {\n  location /api {\n    proxy_pass http://localhost:5000; # Blocks on connection dropouts\n  }\n}', good: 'upstream backend_pool {\n  server 10.0.0.5:5000 max_fails=3 fail_timeout=10s;\n}\nserver {\n  location /api {\n    proxy_pass http://backend_pool;\n  }\n}' }
      ],
      practices: 'Implement compression (Gzip) for static bundles. Restrict maximum client body upload limits. Setup keepalive limits for client sockets.'
    }
  },
  'ai-ml': {
    'numpy': {
      title: 'NumPy.py',
      fullName: 'NumPy Vector Math Specs',
      intro: 'High-performance array compute engine written in C, powering linear algebra and coordinate vector pipelines in ML.',
      analogy: 'Like sorting items in parallel. Instead of labeling 100 boxes one by one with a pen, you stamp all of them simultaneously with a single machine press.',
      errors: [
        { bad: 'res = []\nfor x in arr:\n  res.append(x * 2) # Slow python loop execution overhead', good: 'res = arr * 2 # Vectorized matrix compute directly in C' }
      ],
      practices: 'Avoid Python loops (for/while) on array operations. Leverage broadcasting for math on unequal matrices. Set random seeds for duplicate results.'
    },
    'pytorch': {
      title: 'PyTorch.py',
      fullName: 'PyTorch Deep Learning Engine',
      intro: 'Open-source machine learning framework providing automatic differentiation, tensor compiles, and GPU acceleration.',
      analogy: 'PyTorch is like a flight simulator that records every knob you turn. If the landing crashes, it replays the flight backward to fix the autopilot controls.',
      errors: [
        { bad: 'for x in data:\n  y = model(x)\n  loss = criterion(y, target)\n  loss.backward() # Gradients accumulate endlessly, causing weight drift', good: 'optimizer.zero_grad()\nloss.backward()\noptimizer.step() # Standard gradient reset loop' }
      ],
      practices: 'Send model parameters and data tensors to the same device (CPU or CUDA). Always check input shapes before network layers. Wrap eval runs in torch.no_grad().'
    },
    'transformers': {
      title: 'Transformers.py',
      fullName: 'HuggingFace Transformers Specs',
      intro: 'Provides APIs and utilities to download, load, fine-tune, and run state-of-the-art pre-trained attention models.',
      analogy: 'Instead of teaching a student to read from scratch, you buy an encyclopedia that is already highlighted, then teach them only your industry vocabulary.',
      errors: [
        { bad: 'outputs = model(text) # Passing raw string to PyTorch module crashes', good: 'inputs = tokenizer(text, return_tensors="pt")\noutputs = model(**inputs) # Proper numeric encoding map' }
      ],
      practices: 'Verify token truncation matches model sequence limits. Use half-precision (FP16/BF16) to fit batch sizes in GPU memory.'
    },
    'agents': {
      title: 'CrewAI.py',
      fullName: 'AI Multi-Agent Coordination',
      intro: 'Orchestration framework that sets up cooperative loops between AI agents, passing outputs sequentially to simulate team pipelines.',
      analogy: 'A software company where one agent writes spec files, passes it to the coder agent, who hands it to the tester agent. All run by the manager LLM.',
      errors: [
        { bad: 'agent = Agent(role="Coder", goal="Write code", tools=[]) # Agent loops indefinitely without clear exit criteria', good: 'agent = Agent(role="Coder", goal="Code feature", backstory="Senior dev", max_iter=5)' }
      ],
      practices: 'Configure guardrails and iteration limits on tools. Set precise backstories to anchor system prompts. Design parallel handoffs to save token latency.'
    }
  },
  'mobile': {
    'kotlin': {
      title: 'Kotlin.kt',
      fullName: 'Kotlin Syntax & Safety Specs',
      intro: 'Statically typed programming language running on JVM. Recommended by Google for modern Android application development.',
      analogy: 'Like building a house with a strict inspector who validates every board before you hammer it, avoiding leaks after the build is finished.',
      errors: [
        { bad: 'var name: String? = null\nprintln(name.length) # Compilation failure: nullable type call', good: 'var name: String? = null\nprintln(name?.length ?: 0) # Safe call operator fallback' }
      ],
      practices: 'Prefer immutable val variables over var. Leverage data classes for POJO models. Use coroutines for asynchronous task schedules.'
    },
    'compose': {
      title: 'Compose.kt',
      fullName: 'Jetpack Compose UI Layouts',
      intro: 'Android modern declarative UI toolkit that accelerates interface creation with less code, powerful tools, and intuitive Kotlin APIs.',
      analogy: 'Instead of drawing layout maps, you write instructions describing how the screen looks under each state. The system updates the screen automatically.',
      errors: [
        { bad: '@Composable\nfun Score() {\n  var count = 0 # Variable resets to 0 on every recomposition', good: '@Composable\nfun Score() {\n  var count by remember { mutableStateOf(0) } // Retains value across renders' }
      ],
      practices: 'Keep composables state-free (hoist state to viewmodels). Specify content descriptions for accessibility. Wrap layouts in LazyColumn for dynamic lists.'
    },
    'retrofit': {
      title: 'Retrofit.kt',
      fullName: 'Retrofit HTTP Client Interfaces',
      intro: 'Type-safe HTTP client for Android and Java, turning REST APIs into interfaces, abstracting URL requests and JSON parses.',
      analogy: 'Think of Retrofit like a waiter. You hand them a menu checklist (interfaces), they request the kitchen, and return the hot plate (deserialized objects) directly to you.',
      errors: [
        { bad: '@GET("users")\nfun getUsers(): List<User> # Runs network check on main thread, crashing application', good: '@GET("users")\nsuspend fun getUsers(): List<User> # Suspended function handles async threads' }
      ],
      practices: 'Add Gson or Moshi converters for custom response parses. Configure HttpLoggingInterceptor only in debug builds. Catch network IOExceptions.'
    },
    'hilt': {
      title: 'Hilt.kt',
      fullName: 'Dagger Hilt Dependency Injections',
      intro: 'Dependency injection library for Android that reduces boilerplate by managing lifecycle scopes, component container lookups.',
      analogy: 'A car factory where robot arms automatically inject engines, wheels, and steering systems as the body moves down the assembly line.',
      errors: [
        { bad: 'class MainFragment {\n  val repository = Repository() # Manually instantiates class, coupling implementations\n}', good: '@AndroidEntryPoint\nclass MainFragment : Fragment() {\n  @Inject lateinit var repository: Repository // Auto-injected parameter\n}' }
      ],
      practices: 'Inject interfaces, not direct implementation classes. Bind ViewModel injections using @HiltViewModel. Align dependencies to appropriate Hilt components.'
    }
  }
};

export default function DocEngine({ trackId = 'web-dev' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTechKey, setActiveTechKey] = useState('');
  const [copiedText, setCopiedText] = useState('');

  // Map internal track names to match keys
  const getMappedTrackId = (id) => {
    if (id === 'web-dev' || id === 'dsa' || id === 'devops' || id === 'ai-ml' || id === 'mobile') return id;
    return 'web-dev';
  };

  const currentTrackId = getMappedTrackId(trackId);
  const trackDocs = TECH_DOCS[currentTrackId];

  // Auto-select first key of track documentation on load or track change
  useEffect(() => {
    const keys = Object.keys(trackDocs);
    if (keys.length > 0) {
      setActiveTechKey(keys[0]);
    }
  }, [currentTrackId]);

  const activeTech = trackDocs[activeTechKey] || trackDocs[Object.keys(trackDocs)[0]];

  const filteredTechKeys = Object.keys(trackDocs).filter(key => 
    key.includes(searchQuery.toLowerCase()) || trackDocs[key].fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedText(codeText);
    setTimeout(() => setCopiedText(''), 2000);
  };

  if (!activeTech) return null;

  return (
    <div className="bg-[#1e1e24]/60 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col flex-1 min-h-[460px] overflow-hidden shadow-2xl relative">
      
      {/* VS Code Title Bar */}
      <div className="bg-[#18181c] px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="text-slate-500 ml-4 font-mono">VSCode-Handbook</span>
        </div>
        <div className="bg-[#1f1f23] text-slate-400 px-8 py-0.5 rounded border border-white/5 max-w-xs w-full text-center truncate font-mono text-[10px] hidden sm:block">
          studyquest://docs/src/components/{activeTech.title}
        </div>
        <div className="text-slate-600 font-mono text-[10px]">
          UTF-8
        </div>
      </div>

      <div className="flex flex-1 items-stretch min-h-[400px]">
        
        {/* Sidebar (File Explorer Feel) */}
        <div className="w-60 bg-[#141418] border-r border-white/5 flex flex-col select-none flex-shrink-0">
          {/* Section Header */}
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
            <span>Explorer</span>
          </div>

          {/* Search Box inside Sidebar */}
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file name..."
                className="w-full bg-[#1b1b1f] border border-white/5 rounded pl-7 pr-2 py-1 text-[10px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* Directory Tree */}
          <div className="p-2 space-y-3 overflow-y-auto max-h-[340px] scrollbar-thin">
            <div>
              <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                <Folder size={11} className="text-violet-400" />
                <span>workspace</span>
              </div>
              <div className="pl-3 mt-1 space-y-0.5">
                {filteredTechKeys.map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveTechKey(key)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono text-left transition-colors ${
                      activeTechKey === key 
                        ? 'bg-violet-500/10 text-violet-300 font-medium'
                        : 'text-slate-400 hover:bg-[#1b1b1f]/60 hover:text-white'
                    }`}
                  >
                    <FileCode size={11} className={activeTechKey === key ? 'text-violet-400' : 'text-slate-600'} />
                    <span className="truncate">{trackDocs[key].title}</span>
                  </button>
                ))}
                {filteredTechKeys.length === 0 && (
                  <div className="text-[10px] text-slate-600 italic px-3 py-2 font-mono">No docs match search</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 bg-[#16161c] flex flex-col min-w-0">
          {/* Open Tabs */}
          <div className="bg-[#121216] border-b border-white/5 flex items-center overflow-x-auto scrollbar-none">
            {Object.keys(trackDocs).map(key => (
              <button
                key={key}
                onClick={() => setActiveTechKey(key)}
                className={`flex items-center gap-2 px-4 py-2 border-r border-white/5 text-[11px] font-mono whitespace-nowrap transition-all ${
                  activeTechKey === key
                    ? 'bg-[#16161c] text-white border-t-2 border-t-violet-500 font-medium'
                    : 'bg-[#111114] text-slate-500 hover:text-slate-300'
                }`}
              >
                <FileCode size={11} className={activeTechKey === key ? 'text-violet-400' : 'text-slate-600'} />
                {trackDocs[key].title}
              </button>
            ))}
          </div>

          {/* Editor Window */}
          <div className="p-6 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin space-y-5">
            {/* Concept Header */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                <Sparkles size={11} className="text-violet-400" />
                <span>Concept Specs</span>
              </div>
              <h4 className="text-lg font-bold text-white mt-1">{activeTech.fullName}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">{activeTech.intro}</p>
            </div>

            {/* Analogy Box */}
            <div className="bg-[#1a1c24] border-l-4 border-l-violet-500 p-4 rounded-r-xl">
              <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest block font-black mb-1">Simple Analogy</span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed italic">"{activeTech.analogy}"</p>
            </div>

            {/* Anti-Patterns */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-black">Code Sandbox Anti-Patterns</span>
              <div className="space-y-4">
                {activeTech.errors.map((err, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bad */}
                    <div className="bg-rose-950/10 border border-rose-500/20 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-rose-950/20 border-b border-rose-500/10 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-rose-400 uppercase font-black tracking-wider">
                        <span className="flex items-center gap-1"><ShieldAlert size={11} /> Bad Implementation</span>
                      </div>
                      <div className="p-4 font-mono text-xs text-rose-300/90 overflow-x-auto whitespace-pre leading-relaxed">
                        {err.bad}
                      </div>
                    </div>

                    {/* Good */}
                    <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl overflow-hidden shadow-sm relative group">
                      <div className="bg-emerald-950/20 border-b border-emerald-500/10 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-emerald-400 uppercase font-black tracking-wider">
                        <span className="flex items-center gap-1"><CheckSquare size={11} /> Optimal Code</span>
                      </div>
                      <div className="p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto whitespace-pre leading-relaxed">
                        {err.good}
                      </div>
                      <button
                        onClick={() => handleCopy(err.good)}
                        className="absolute right-3 top-2 p-1 rounded hover:bg-emerald-500/20 text-emerald-500 hover:text-emerald-300 transition-all cursor-pointer opacity-70 hover:opacity-100"
                        title="Copy Code"
                      >
                        {copiedText === err.good ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practices */}
            <div className="border-t border-white/5 pt-4 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase block font-black">Production Best Practices</span>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{activeTech.practices}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Editor Status Bar */}
      <div className="bg-[#121216] px-4 py-1.5 border-t border-white/5 text-[10px] font-mono text-slate-500 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span className="bg-violet-600 text-white font-bold px-1.5 py-0.5 rounded text-[8px] uppercase">Normal</span>
          <span>Line 1, Col 1</span>
        </div>
        <div className="flex items-center gap-4">
          <span>JavaScript React</span>
          <span>Spaces: 2</span>
        </div>
      </div>

    </div>
  );
}
