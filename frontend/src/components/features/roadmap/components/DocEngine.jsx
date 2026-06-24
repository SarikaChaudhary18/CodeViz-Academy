import React, { useState } from 'react';
import { BookOpen, Search, Copy, Check, ShieldAlert, BadgeCheck } from 'lucide-react';

const TECH_DOCS = {
  'react': {
    title: 'React.js UI Library',
    intro: 'React is a declarative JavaScript library for building component-based interfaces. Built by Facebook in 2013 to handle graph-based rendering performance.',
    analogy: 'Think of React like a painter with a magic blueprint. Instead of repainting the entire room when you buy a new chair, the painter looks at the blueprint, finds the exact spot of the chair, and replaces only that piece.',
    errors: [
      { bad: 'useEffect(() => { fetchData() }) // Missing dependency array', good: 'useEffect(() => { fetchData() }, [dependency]) // Controlled run' },
      { bad: 'state.push(item); setState(state); // Mutating state directly', good: 'setState([...state, item]); // Immutable update' }
    ],
    practices: 'Use Functional Components with Hooks. Decouple side-effects from layouts. Employ React.memo() and useMemo() strictly to optimize expensive renders.'
  },
  'kotlin': {
    title: 'Kotlin Programming Language',
    intro: 'Developed by JetBrains, Kotlin is a statically-typed language fully interoperable with Java. Made default for Android development by Google in 2017.',
    analogy: 'Kotlin is like an inspector with an X-ray. It forces you to declare if an object can ever be empty (null) before the program runs, saving your application from crashing.',
    errors: [
      { bad: 'val data: String = null // Null pointer exception at compile', good: 'val data: String? = null // Handled null compiler safety' },
      { bad: 'runBlocking { ... } // Blocks main UI thread', good: 'viewModelScope.launch { ... } // Non-blocking async Coroutines' }
    ],
    practices: 'Enforce null-safety operators. Prefer Kotlin Coroutines over threads for non-blocking I/O. Use data classes for clean model definitions.'
  },
  'pytorch': {
    title: 'PyTorch ML Framework',
    intro: 'PyTorch is an open-source machine learning library developed by Meta AI. Leverages dynamic execution graphs (eager execution) making model prototyping easy.',
    analogy: 'PyTorch is like building with smart blocks. Instead of planning the entire building ahead of time, you can stack blocks, check if they match, and adjust them dynamically as you build.',
    errors: [
      { bad: 'loss.backward() // Calling without zeroing old gradients', good: 'optimizer.zero_grad(); loss.backward() // Zero optimizer gradients first' },
      { bad: 'x.to("cuda") // Tensor allocation without checking hardware', good: 'device = "cuda" if torch.cuda.is_available() else "cpu"; x.to(device)' }
    ],
    practices: 'Always verify CUDA GPU allocation before launching matrices. Use DataLoader multi-threading workers to prevent CPU-GPU bottleneck stalls.'
  },
  'postgres': {
    title: 'PostgreSQL Relational DB',
    intro: 'An enterprise-grade object-relational SQL database focused on SQL compliance and extensibility. Supports concurrent transactions without lock constraints.',
    analogy: 'Postgres is like a highly organized filing library. It guarantees that if a book is checked out, the records update completely, or the transaction rolls back so nothing gets lost.',
    errors: [
      { bad: 'SELECT * FROM users WHERE email = "..." // Table scan without index', good: 'CREATE INDEX idx_users_email ON users(email); // Index scan execution' },
      { bad: 'const sql = "SELECT * FROM users WHERE name = " + input; // Injection', good: 'const sql = "SELECT * FROM users WHERE name = $1"; // Prepared parameter statement' }
    ],
    practices: 'Enforce primary key indexing. Optimize queries using EXPLAIN ANALYZE. Avoid raw query strings; bind variables or write ORM schemas (Prisma, Drizzle).'
  }
};

export default function DocEngine() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTechKey, setActiveTechKey] = useState('react');
  const [copiedText, setCopiedText] = useState('');

  const activeTech = TECH_DOCS[activeTechKey] || TECH_DOCS['react'];

  const filteredTechKeys = Object.keys(TECH_DOCS).filter(key => 
    key.includes(searchQuery.toLowerCase()) || TECH_DOCS[key].title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedText(codeText);
    setTimeout(() => setCopiedText(''), 2000);
  };

  return (
    <div className="glassmorphism rounded-3xl p-6 border-white/5 space-y-6 flex flex-col flex-1 min-h-[400px]">
      
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={16} className="text-purple-400" />
            Developer Documentation Engine
          </h4>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-widest">
            Simplified handbook converting official specs into clean guides
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Tech (e.g. react, kotlin)"
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[10px] font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch flex-1">
        
        {/* Left selector */}
        <div className="lg:col-span-1 bg-zinc-950/40 border border-white/5 rounded-2xl p-4 space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-2">Available Manuals</span>
          {filteredTechKeys.map(key => (
            <button
              key={key}
              onClick={() => setActiveTechKey(key)}
              className={`w-full text-left p-2.5 rounded-xl border text-[10px] font-mono transition-all flex items-center justify-between ${
                activeTechKey === key 
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold'
                  : 'bg-white/[0.01] hover:bg-white/[0.03] border-transparent text-zinc-400'
              }`}
            >
              <span>{TECH_DOCS[key].title}</span>
              <BadgeCheck size={11} className={activeTechKey === key ? 'text-purple-400' : 'text-zinc-700'} />
            </button>
          ))}
          {filteredTechKeys.length === 0 && (
            <p className="text-[9px] text-zinc-600 font-mono italic text-center py-4">No matching manuals found.</p>
          )}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-zinc-950/60 border border-white/5 rounded-2xl p-5 space-y-4 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
          
          <div>
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Concept Introduction</span>
            <h5 className="text-xs font-bold text-white uppercase mt-1 font-mono tracking-wider">{activeTech.title}</h5>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-1.5">{activeTech.intro}</p>
          </div>

          <div className="bg-purple-950/10 border border-purple-500/20 p-3.5 rounded-xl text-[10px] leading-relaxed">
            <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block font-bold mb-1">Simple Analogy</span>
            <p className="text-zinc-300 font-sans">{activeTech.analogy}</p>
          </div>

          <div className="space-y-3">
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Common Anti-Patterns & Correct Usage</span>
            <div className="grid grid-cols-1 gap-3">
              {activeTech.errors.map((err, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[9px]">
                  
                  {/* Bad */}
                  <div className="bg-red-950/10 border border-red-500/20 p-2.5 rounded-xl text-zinc-400 flex flex-col justify-between">
                    <div>
                      <span className="text-[7px] text-red-500 uppercase font-black tracking-widest block mb-1 flex items-center gap-1">
                        <ShieldAlert size={10} /> Bad Implementation
                      </span>
                      <pre className="text-red-400 leading-normal">{err.bad}</pre>
                    </div>
                  </div>

                  {/* Good */}
                  <div className="bg-emerald-950/10 border border-emerald-500/20 p-2.5 rounded-xl text-zinc-300 flex flex-col justify-between relative group">
                    <div>
                      <span className="text-[7px] text-emerald-400 uppercase font-black tracking-widest block mb-1 flex items-center gap-1">
                        <BadgeCheck size={10} /> Optimal Code
                      </span>
                      <pre className="text-emerald-400 leading-normal">{err.good}</pre>
                    </div>
                    <button
                      onClick={() => handleCopy(err.good)}
                      className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white transition-opacity"
                    >
                      {copiedText === err.good ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 leading-relaxed text-[10px] border-t border-white/5 pt-3">
            <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Production Best Practices</span>
            <p className="text-zinc-400 font-sans">{activeTech.practices}</p>
          </div>

        </div>

      </div>

    </div>
  );
}
