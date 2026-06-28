import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ChevronRight, ChevronDown, ExternalLink, BookOpen, Code2,
  CheckCircle2, Circle, Lock, Zap, Target, Terminal, Lightbulb,
  Trophy, HelpCircle, ChevronLeft, Search, X, Clock, BarChart2,
  BookOpenCheck, Shield, ChevronUp, Layers, Cpu, Award, Globe, Brain, Settings, Smartphone, MapPin
} from 'lucide-react';
import { TRACKS, ROADMAPS } from './roadmapData.js';

// Import sub-engines
import AICareerEngine from './components/AICareerEngine.jsx';
import DocEngine from './components/DocEngine.jsx';
import KnowledgeGraph from './components/KnowledgeGraph.jsx';
import ResourceEngine from './components/ResourceEngine.jsx';

// ─── DIFFICULTY BADGE ────────────────────────────────────
function DifficultyBadge({ level }) {
  const map = {
    Beginner:     'bg-emerald-950/50 text-emerald-400 border-emerald-500/20',
    Intermediate: 'bg-amber-950/50 text-amber-400 border-amber-500/20',
    Advanced:     'bg-rose-950/50 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${map[level] || map.Beginner}`}>
      {level}
    </span>
  );
}

// ─── MARKDOWN RENDERER ───────────────────────────────────
function MarkdownContent({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{
                borderRadius: '0.75rem',
                fontSize: '11px',
                margin: '1rem 0',
                padding: '1.25rem',
                background: '#090d16',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-slate-900/80 border border-white/5 text-violet-300 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
              {children}
            </code>
          );
        },
        h2: ({ children }) => <h2 className="text-base font-bold text-white mt-6 mb-3 pb-2 border-b border-white/5">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-200 mt-5 mb-2">{children}</h3>,
        p: ({ children }) => <p className="text-slate-400 leading-relaxed mb-4 text-xs font-sans">{children}</p>,
        ul: ({ children }) => <ul className="space-y-1.5 mb-4 pl-4 list-disc text-slate-400 text-xs font-sans">{children}</ul>,
        ol: ({ children }) => <ol className="space-y-1.5 mb-4 pl-4 list-decimal list-inside text-slate-400 text-xs font-sans">{children}</ol>,
        li: ({ children }) => <li className="text-slate-350">{children}</li>,
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4 rounded-xl border border-white/5">
            <table className="w-full text-xs text-left">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-950/60 border-b border-white/5 text-slate-400 font-mono text-[10px] uppercase tracking-wider">{children}</thead>,
        th: ({ children }) => <th className="px-4 py-2.5 font-bold">{children}</th>,
        td: ({ children }) => <td className="px-4 py-2.5 text-slate-300 border-t border-white/5 font-sans">{children}</td>,
        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
        a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 underline font-medium">{children}</a>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-violet-500 pl-4 py-1.5 my-4 bg-violet-500/5 rounded-r-xl text-slate-350 text-xs italic">{children}</blockquote>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── QUIZ PANEL ──────────────────────────────────────────
function QuizPanel({ quizzes, trackColor }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!quizzes?.length) return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500 border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
      <HelpCircle size={32} className="opacity-30" />
      <p className="text-xs">No quiz questions available for this topic yet.</p>
    </div>
  );

  if (finished) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-10 gap-4 border border-white/5 rounded-2xl bg-slate-950/20">
      <Trophy size={40} className="text-amber-400" />
      <div className="text-center">
        <p className="text-xl font-bold text-white">{score}/{quizzes.length}</p>
        <p className="text-slate-400 text-xs mt-1 font-sans">
          {score === quizzes.length ? '🎉 Flawless Score!' : score > quizzes.length / 2 ? '👍 Nicely done!' : '📚 Keep practicing!'}
        </p>
      </div>
      <button onClick={() => { setCurrent(0); setSelected(null); setRevealed(false); setScore(0); setFinished(false); }}
        className="px-4 py-2 rounded-xl text-xs font-semibold text-white hover:brightness-110 transition-all cursor-pointer"
        style={{ backgroundColor: trackColor }}>
        Reset Quiz
      </button>
    </motion.div>
  );

  const q = quizzes[current];
  return (
    <div className="space-y-4 border border-white/5 rounded-2xl p-5 bg-slate-950/20">
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
        <span>Question {current + 1} of {quizzes.length}</span>
        <span>Score: {score}/{current}</span>
      </div>
      <p className="text-white font-medium text-xs leading-relaxed">{q.q}</p>
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          let cls = 'border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 text-slate-300';
          if (revealed) {
            if (i === q.answer) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold';
            else if (i === selected) cls = 'border-rose-500 bg-rose-500/10 text-rose-300';
            else cls = 'border-white/5 bg-white/[0.01] text-slate-600 opacity-50';
          } else if (selected === i) cls = 'border-violet-500/50 bg-violet-500/10 text-white';
          return (
            <button key={i} disabled={revealed}
              onClick={() => setSelected(i)}
              className={`text-left px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${cls}`}>
              <span className="font-mono text-xs mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {!revealed ? (
        <button disabled={selected === null}
          onClick={() => {
            setRevealed(true);
            if (selected === q.answer) setScore(s => s + 1);
          }}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-30 hover:brightness-110 transition-all cursor-pointer"
          style={{ backgroundColor: selected !== null ? trackColor : 'rgba(255,255,255,0.05)' }}>
          Verify Answer
        </button>
      ) : (
        <button
          onClick={() => {
            setSelected(null);
            setRevealed(false);
            if (current + 1 < quizzes.length) setCurrent(c => c + 1);
            else setFinished(true);
          }}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white hover:brightness-110 transition-all cursor-pointer"
          style={{ backgroundColor: trackColor }}>
          {current + 1 < quizzes.length ? 'Next Question →' : 'Complete Quiz'}
        </button>
      )}
    </div>
  );
}

// ─── NODE DETAIL PANEL (MODAL DRAW-IN FROM RIGHT) ────────
const DETAIL_TABS = [
  { id: 'notes', label: 'Concept Notes', icon: BookOpen },
  { id: 'resources', label: 'Resources', icon: ExternalLink },
  { id: 'practices', label: 'Best Practices', icon: Lightbulb },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'setup', label: 'Setup Guide', icon: Terminal },
];

function NodeDetailPanel({ node, trackColor, onClose, isCompleted, onToggleComplete }) {
  const [activeTab, setActiveTab] = useState('notes');
  const panelRef = useRef(null);

  const availableTabs = DETAIL_TABS.filter(t => {
    if (t.id === 'setup' && !node.setup) return false;
    return true;
  });

  // Handle click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
      <motion.div
        ref={panelRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-xl h-full bg-slate-950 border-l border-white/5 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex-shrink-0 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">Interactive Specs</span>
              <h3 className="text-lg font-bold text-white mt-1 leading-snug">{node.title}</h3>
              <div className="flex items-center gap-3 mt-2">
                <DifficultyBadge level={node.difficulty} />
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={13} /> {node.duration}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mark Complete Checkbox in header */}
              <button
                onClick={() => onToggleComplete(node.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isCompleted 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                {isCompleted ? 'Done' : 'Mark Done'}
              </button>

              <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Selector Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-white/5 pb-1">
            {availableTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-transparent cursor-pointer ${
                    isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  style={isActive ? { backgroundColor: `${trackColor}15`, color: trackColor, border: `1px solid ${trackColor}25` } : {}}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'notes' && (
                <MarkdownContent content={node.notes || '*No concept notes documented for this node.*'} />
              )}

              {activeTab === 'resources' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 font-sans">Curated references from official docs and tutorials:</p>
                  {(node.resources || []).map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/60 hover:border-white/10 transition-all group">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${trackColor}15`, border: `1px solid ${trackColor}25` }}>
                        <ExternalLink size={13} style={{ color: trackColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-semibold group-hover:text-cyan-300 transition-colors truncate">{r.label}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{r.url}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-650 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
                    </a>
                  ))}
                  {(!node.resources || node.resources.length === 0) && (
                    <p className="text-slate-500 text-xs text-center py-8">No links curated yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'practices' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 font-sans">Production specifications and developer best-practices:</p>
                  {(node.bestPractices || []).map((bp, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-2xl border border-white/5 bg-slate-900/20">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${trackColor}15`, border: `1px solid ${trackColor}25` }}>
                        <span className="text-[10px] font-bold" style={{ color: trackColor }}>{i + 1}</span>
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed font-sans">{bp}</p>
                    </div>
                  ))}
                  {(!node.bestPractices || node.bestPractices.length === 0) && (
                    <p className="text-slate-500 text-xs text-center py-8">Best practices documented here soon.</p>
                  )}
                </div>
              )}

              {activeTab === 'quiz' && (
                <QuizPanel quizzes={node.quiz} trackColor={trackColor} />
              )}

              {activeTab === 'setup' && node.setup && (
                <MarkdownContent content={node.setup} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── FLOATING NAVIGATION ─────────────────────────────────
function FloatingNav({ activeSection }) {
  const sections = [
    { id: 'hero', label: 'Top' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'selector', label: 'Roadmaps' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'graph', label: 'Topology Graph' },
    { id: 'docs', label: 'Handbook Docs' },
    { id: 'resources', label: 'Netflix Resources' },
    { id: 'ai', label: 'AI Planner' }
  ];

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3.5 bg-slate-950/80 backdrop-blur-md border border-white/5 rounded-3xl py-5 px-3 shadow-2xl select-none">
      {sections.map(sec => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => handleScroll(sec.id)}
            className="group relative flex items-center justify-center w-7 h-7 cursor-pointer"
            title={sec.label}
          >
            {/* Label Tooltip */}
            <span className="absolute right-9 bg-slate-950 border border-white/10 text-white text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
              {sec.label}
            </span>
            {/* Dot Indicator */}
            <div 
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-violet-400 scale-125 ring-4 ring-violet-500/20' 
                  : 'bg-slate-700 group-hover:bg-slate-400 group-hover:scale-110'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function Roadmap() {
  const [selectedTrackId, setSelectedTrackId] = useState('web-dev');
  const [selectedNode, setSelectedNode] = useState(null);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  
  // Custom filters
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');

  // Mouse Follow Glow coordinates
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const roadmap = ROADMAPS[selectedTrackId];
  const track = TRACKS.find(t => t.id === selectedTrackId);
  const trackColor = track?.color || '#06b6d4';

  // Total track statistics
  const stats = useMemo(() => {
    if (!roadmap) return { modules: 0, topics: 0, projects: 0 };
    const topics = roadmap.phases.reduce((sum, p) => sum + p.nodes.length, 0);
    // Project recommendations calculated based on parsed nodes and recommendations
    const projects = selectedTrackId === 'web-dev' ? 6 : (selectedTrackId === 'dsa' ? 0 : 3);
    return {
      modules: roadmap.phases.length,
      topics,
      projects
    };
  }, [roadmap, selectedTrackId]);

  const totalCompletedInTrack = useMemo(() => {
    if (!roadmap) return 0;
    return completedNodes.filter(id => roadmap.phases.flatMap(p => p.nodes).some(n => n.id === id)).length;
  }, [roadmap, completedNodes]);

  const pct = useMemo(() => {
    if (!stats.topics) return 0;
    return Math.round((totalCompletedInTrack / stats.topics) * 100);
  }, [totalCompletedInTrack, stats.topics]);

  // Handle scrollspy to highlight right nav active dot
  useEffect(() => {
    const sections = ['hero', 'dashboard', 'selector', 'timeline', 'graph', 'docs', 'resources', 'ai'];
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScrollSpy);
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  // Filtered nodes for the timeline view
  const filteredPhases = useMemo(() => {
    if (!roadmap) return [];
    return roadmap.phases.map(phase => {
      const filteredNodes = phase.nodes.filter(node => {
        const matchesDiff = difficultyFilter === 'All' || node.difficulty === difficultyFilter;
        
        let matchesDuration = true;
        if (durationFilter !== 'All') {
          const weeksVal = parseInt(node.duration.replace(/\D/g, ''), 10) || 1;
          if (durationFilter === '1M') matchesDuration = weeksVal <= 4;
          else if (durationFilter === '3M') matchesDuration = weeksVal <= 12;
          else if (durationFilter === '6M') matchesDuration = weeksVal > 12;
        }
        return matchesDiff && matchesDuration;
      });
      return { ...phase, nodes: filteredNodes };
    }).filter(p => p.nodes.length > 0);
  }, [roadmap, difficultyFilter, durationFilter]);

  // Search Autocomplete suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const suggestions = [];
    
    TRACKS.forEach(t => {
      const r = ROADMAPS[t.id];
      if (!r) return;
      r.phases.forEach(p => {
        p.nodes.forEach(n => {
          if (n.title.toLowerCase().includes(q)) {
            suggestions.push({
              title: `${n.title} Roadmap`,
              subtitle: `Access core curriculum for ${n.title} in ${t.label}`,
              icon: 'pin',
              action: () => {
                setSelectedTrackId(t.id);
                setTimeout(() => setSelectedNode(n), 150);
              }
            });
            suggestions.push({
              title: `${n.title} Interview Prep`,
              subtitle: `Review best practices and practice quiz questions`,
              icon: 'award',
              action: () => {
                setSelectedTrackId(t.id);
                setTimeout(() => setSelectedNode(n), 150);
              }
            });
          }
        });
      });
    });
    return suggestions.slice(0, 4);
  }, [searchQuery]);

  const handleMarkComplete = (nodeId) => {
    setCompletedNodes(prev =>
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const handleSearchSubmit = (queryText) => {
    const q = (queryText || searchQuery).trim().toLowerCase();
    if (!q) return;

    let matchFound = false;
    for (const t of TRACKS) {
      const r = ROADMAPS[t.id];
      if (!r) continue;
      for (const p of r.phases) {
        for (const n of p.nodes) {
          if (n.title.toLowerCase().includes(q)) {
            setSelectedTrackId(t.id);
            setSelectedNode(n);
            setSearchQuery('');
            setSearchOpen(false);
            
            // Scroll to the timeline section
            const timelineEl = document.getElementById('timeline');
            if (timelineEl) {
              timelineEl.scrollIntoView({ behavior: 'smooth' });
            }
            matchFound = true;
            break;
          }
        }
        if (matchFound) break;
      }
      if (matchFound) break;
    }
  };

  const handleTrackChange = (trackId) => {
    setSelectedTrackId(trackId);
    setSelectedNode(null);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const renderTrackIcon = (iconName, color) => {
    const size = 30;
    if (iconName === 'Globe') return <Globe size={size} style={{ color }} />;
    if (iconName === 'Brain') return <Brain size={size} style={{ color }} />;
    if (iconName === 'Settings') return <Settings size={size} style={{ color }} />;
    if (iconName === 'Cpu') return <Cpu size={size} style={{ color }} />;
    if (iconName === 'Smartphone') return <Smartphone size={size} style={{ color }} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#070b10] text-gray-100 font-sans selection:bg-violet-600/30 selection:text-violet-200 overflow-x-hidden relative pb-20">
      
      {/* Interactive Cursor Follow Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 opacity-40"
        style={{
          background: `radial-gradient(500px at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.12), transparent 80%)`
        }}
      />

      {/* Static background blur blobs */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[50%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating dot navigation */}
      <FloatingNav activeSection={activeSection} />

      {/* ─── 1️⃣ HERO SECTION (Completely Redesigned) ─── */}
      <section id="hero" className="relative min-h-[50vh] flex flex-col justify-center items-center py-20 px-6 overflow-hidden border-b border-white/5 bg-slate-950/20 z-10">
        {/* Animated Aurora Mesh Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.3)_0,transparent_55%)] animate-[spin_60s_linear_infinite]" />
          <div className="absolute bottom-[-50%] right-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0,transparent_55%)] animate-[spin_40s_linear_infinite]" style={{ animationDirection: 'reverse' }} />
        </div>

        <div className="max-w-4xl text-center space-y-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono text-[10px] uppercase tracking-widest font-black"
          >
            <Zap size={10} className="fill-current" /> CodeViz Academy
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Become a Professional <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">Software Developer</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed font-sans"
          >
            Choose your learning roadmap, audit design-patterns, query interactive dependencies, and track your progress in real-time.
          </motion.p>

          {/* Autocomplete Search input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-md mx-auto relative px-2"
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <Search size={16} />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(!!e.target.value); }}
                onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); }}
                placeholder="Search roadmaps, skills or topics..."
                className="w-full bg-[#151b2a]/90 backdrop-blur border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 shadow-2xl transition-all"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Auto suggestions */}
            <AnimatePresence>
              {searchOpen && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-2 right-2 mt-2 bg-[#0d1222] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 text-left"
                >
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        suggestion.action();
                        setSearchQuery('');
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-slate-900 border-b border-white/5 last:border-0 text-left transition-colors"
                    >
                      <span className="text-base flex-shrink-0 text-violet-400">
                        {suggestion.icon === 'pin' ? <MapPin size={14} /> : <Award size={14} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{suggestion.title}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-sans">{suggestion.subtitle}</p>
                      </div>
                      <ChevronRight size={13} className="text-slate-600" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick stats counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-8 pt-6 select-none"
          >
            {[
              { label: 'Structured Paths', value: '45+' },
              { label: 'Curated Assets', value: '1,000+' },
              { label: 'Recommended Projects', value: '500+' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <span className="text-xl sm:text-2xl font-bold text-violet-400 font-mono">{stat.value}</span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-6xl mx-auto px-6 space-y-24 mt-12 relative z-10">

        {/* ─── 2️⃣ LEARNING DASHBOARD SECTION ─── */}
        <section id="dashboard" className="scroll-mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Active Roadmap Progress */}
            <div className="md:col-span-2 bg-[#121829]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">Current Focus</span>
                <h4 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <BookOpenCheck size={16} className="text-violet-400" />
                  Active Learning Track: {roadmap?.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-sans">{roadmap?.tagline}</p>
              </div>

              <div className="space-y-2 mt-8">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Track Mastery Progress</span>
                  <span className="font-bold text-white bg-violet-500/20 px-2 py-0.5 rounded border border-violet-500/20">{pct}%</span>
                </div>
                <div className="h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-violet-600 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Track Statistics Box */}
            <div className="bg-[#121829]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">Metrics Summary</span>
                <h4 className="text-base font-bold text-white mt-1">Curriculum Stats</h4>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6">
                {[
                  { label: 'Phases', value: stats.modules, color: 'text-violet-400' },
                  { label: 'Topics', value: stats.topics, color: 'text-cyan-400' },
                  { label: 'Projects', value: stats.projects, color: 'text-emerald-400' }
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-950/50 border border-white/5 rounded-2xl p-3 text-center">
                    <span className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
                    <span className="block text-[9px] text-slate-500 font-sans mt-0.5">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>


        {/* ─── 3️⃣ ROADMAP SELECTOR SECTION (Cards) ─── */}
        <section id="selector" className="space-y-6 scroll-mt-10">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Layers size={18} className="text-violet-400" />
              Select Learning Pathway
            </h3>
            <p className="text-xs text-slate-400 mt-1">Click a curriculum template to load its detailed dynamic timeline, spec manual and graph unlocks.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TRACKS.map(t => {
              const isActive = selectedTrackId === t.id;
              // Map mock data counts per track
              const estDuration = t.id === 'web-dev' ? '3 Months' : (t.id === 'dsa' ? '2 Months' : '3 Months');
              const diffLevel = t.id === 'web-dev' ? 'Beginner' : (t.id === 'dsa' ? 'Intermediate' : 'Intermediate');
              
              return (
                <motion.button
                  key={t.id}
                  onClick={() => handleTrackChange(t.id)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  className={`relative p-5 rounded-2xl text-left border cursor-pointer select-none transition-all flex flex-col justify-between h-40 overflow-hidden shadow-md group`}
                  style={{
                    borderColor: isActive ? t.color : 'rgba(255,255,255,0.05)',
                    backgroundColor: isActive ? `${t.color}0a` : 'rgba(18,24,41,0.4)',
                  }}
                >
                  {/* Glowing background spot on active/hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${t.color} 0%, transparent 70%)` }}
                  />

                  <div>
                    <span className="block group-hover:scale-110 transition-transform select-none mb-2">{renderTrackIcon(t.icon, t.color)}</span>
                    <h5 className="text-sm font-extrabold text-white mt-1 truncate">{t.label}</h5>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">est: {estDuration}</span>
                    <span 
                      className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded inline-block bg-slate-900 border"
                      style={{ color: t.color, borderColor: `${t.color}20` }}
                    >
                      {diffLevel}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>


        {/* ─── 4️⃣ ROADMAP TIMELINE & PHASE CARDS ─── */}
        <section id="timeline" className="space-y-8 scroll-mt-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Target size={18} className="text-violet-400" />
                Active Roadmap Node Timeline
              </h3>
              <p className="text-xs text-slate-400 mt-1">Audit topics sequentially. Expand nodes to view concept blueprints, setup instructions, best practices, and quizzes.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex gap-2 self-start sm:self-center select-none text-[10px] font-mono">
              {/* Difficulty Filter */}
              <div className="flex items-center bg-[#151b2a] border border-white/5 rounded-xl px-2.5 py-1.5 gap-1.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Level:</span>
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      difficultyFilter === diff 
                        ? 'bg-violet-500/20 text-violet-300 font-semibold' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Duration Filter */}
              <div className="flex items-center bg-[#151b2a] border border-white/5 rounded-xl px-2.5 py-1.5 gap-1.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Time:</span>
                {[
                  { id: 'All', label: 'All' },
                  { id: '1M', label: '≤1W' },
                  { id: '3M', label: '≤3W' },
                  { id: '6M', label: '>3W' }
                ].map(dur => (
                  <button
                    key={dur.id}
                    onClick={() => setDurationFilter(dur.id)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      durationFilter === dur.id 
                        ? 'bg-violet-500/20 text-violet-300 font-semibold' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Timeline Tree Flow (Left/Center) */}
            <div className="lg:col-span-2 space-y-6 relative pl-6">
              {/* Connective line */}
              <div className="absolute left-[9px] top-6 bottom-6 w-0.5 bg-slate-800 opacity-50" />

              {filteredPhases.map((phase, pi) => (
                <div key={phase.id} className="space-y-4">
                  {/* Phase card headers */}
                  <div className="flex items-center gap-3">
                    {/* Glowing point on phase */}
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10 shadow-lg border"
                      style={{ backgroundColor: trackColor, borderColor: '#020617' }}
                    >
                      {phase.phase}
                    </div>
                    <h4 className="text-sm font-bold text-white">{phase.title}</h4>
                    <span className="text-[10px] text-slate-500 bg-white/5 border px-2 py-0.5 rounded-full font-mono font-bold uppercase">Phase {phase.phase}</span>
                  </div>

                  {/* Connected child nodes list */}
                  <div className="space-y-3">
                    {phase.nodes.map((node) => {
                      const isCompleted = completedNodes.includes(node.id);
                      const isSelected = selectedNode?.id === node.id;

                      return (
                        <div 
                          key={node.id}
                          className="relative pl-6 group/node"
                        >
                          {/* Inner line connector node point */}
                          <button
                            onClick={() => handleMarkComplete(node.id)}
                            className="absolute left-[-23px] top-4 z-10 w-4 h-4 rounded-full border-[3px] border-slate-950 flex items-center justify-center cursor-pointer transition-transform duration-200 group-hover/node:scale-125"
                            style={{ 
                              backgroundColor: isCompleted ? '#10b981' : '#475569',
                              borderColor: '#020617' 
                            }}
                            title={isCompleted ? "Mark Incomplete" : "Mark Complete"}
                          />

                          {/* Node Card */}
                          <div 
                            onClick={() => handleNodeClick(node)}
                            className={`p-4 rounded-2xl border bg-slate-900/30 hover:bg-slate-900/60 transition-all cursor-pointer flex items-center justify-between shadow ${
                              isSelected ? 'ring-1 border-transparent' : 'border-white/5'
                            }`}
                            style={isSelected ? { 
                              ringColor: trackColor,
                              border: `1px solid ${trackColor}40`,
                              backgroundColor: `${trackColor}0a`
                            } : {}}
                          >
                            <div className="flex-1 min-w-0 pr-3">
                              <h5 className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300 group-hover/node:text-white'}`}>
                                {node.title}
                              </h5>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider font-bold">
                                {node.duration} · {node.difficulty}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              {isCompleted && (
                                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">
                                  Done
                                </span>
                              )}
                              <ChevronRight size={13} className="text-slate-600 group-hover/node:text-slate-400 transition-colors" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredPhases.length === 0 && (
                <div className="text-center py-16 border border-dashed border-white/5 rounded-3xl bg-slate-950/20 text-slate-500">
                  <BookOpenCheck size={32} className="mx-auto mb-2 opacity-35" />
                  <p className="text-xs">No roadmap topics match the active filters.</p>
                </div>
              )}
            </div>

            {/* ─── 5️⃣ PHASE CARDS (Right Panel Details Sidebar) ─── */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black block">Phase Foundations</span>
              {roadmap?.phases.map(phase => (
                <div 
                  key={phase.id} 
                  className="bg-slate-900/30 hover:bg-slate-900/50 border border-white/5 rounded-2xl p-5 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-3.5">
                    <div>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-bold block">Sprint Section</span>
                      <h4 className="text-xs font-bold text-white">{phase.title}</h4>
                    </div>
                    <span 
                      className="text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded border"
                      style={{ color: trackColor, borderColor: `${trackColor}20`, backgroundColor: `${trackColor}0a` }}
                    >
                      Phase {phase.phase}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal font-sans">
                    Includes {phase.nodes.length} core subject areas covering fundamentals, design requirements, and debugging implementations.
                  </p>

                  <div className="flex justify-between items-center mt-5 text-[10px] font-mono text-slate-500 uppercase">
                    <span>Difficulty</span>
                    <button 
                      onClick={() => handleNodeClick(phase.nodes[0])}
                      className="text-white font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      style={{ color: trackColor }}
                    >
                      Start Phase →
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ─── 9️⃣ KNOWLEDGE TOPOLOGY GRAPH ─── */}
        <section id="graph" className="scroll-mt-10">
          <KnowledgeGraph roadmapId={selectedTrackId} />
        </section>

        {/* ─── 7️⃣ DOCUMENTATION ENGINE (VS Code Feel) ─── */}
        <section id="docs" className="scroll-mt-10">
          <DocEngine trackId={selectedTrackId} />
        </section>

        {/* ─── 8️⃣ RESOURCE INDEX (Netflix Style Carousels) ─── */}
        <section id="resources" className="scroll-mt-10">
          <ResourceEngine trackId={selectedTrackId} />
        </section>

        {/* ─── 6️⃣ AI CAREER BLUEPRINT PLANNER ─── */}
        <section id="ai" className="scroll-mt-10">
          <AICareerEngine />
        </section>

      </div>

      {/* Slide drawer for concept details */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            trackColor={trackColor}
            onClose={() => setSelectedNode(null)}
            isCompleted={completedNodes.includes(selectedNode.id)}
            onToggleComplete={handleMarkComplete}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
