import React, { useState } from 'react';
import { BookOpen, Search, Copy, Check, ShieldAlert, Folder, FileCode, CheckSquare, Sparkles, Terminal } from 'lucide-react';

const TECH_DOCS = {
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
      { bad: 'apiVersion: apps/v1\nkind: Deployment\nspec:\n  # Missing resources requests and limits configurations', good: 'resources:\n  limits:\n    cpu: "500m"\n    memory: "512Mi"\n  requests:\n    cpu: "250m"\n    memory: "256Mi" # Prevent cluster resource hogging' },
      { bad: 'livenessProbe:\n  httpGet:\n    path: /health\n  initialDelaySeconds: 0 # Probe fires before server starts booting', good: 'livenessProbe:\n  httpGet:\n    path: /health\n  initialDelaySeconds: 15 # Allow server warmup time' }
    ],
    practices: 'Define resource requests and limits on every pod. Configure liveness and readiness probes. Store credentials using Kubernetes Secrets.'
  }
};

export default function DocEngine() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTechKey, setActiveTechKey] = useState('react');
  const [copiedText, setCopiedText] = useState('');

  const activeTech = TECH_DOCS[activeTechKey] || TECH_DOCS['react'];

  const filteredTechKeys = Object.keys(TECH_DOCS).filter(key => 
    key.includes(searchQuery.toLowerCase()) || TECH_DOCS[key].fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedText(codeText);
    setTimeout(() => setCopiedText(''), 2000);
  };

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
                    <span className="truncate">{TECH_DOCS[key].title}</span>
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
            {Object.keys(TECH_DOCS).map(key => (
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
                {TECH_DOCS[key].title}
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
