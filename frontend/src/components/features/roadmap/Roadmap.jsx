import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ChevronRight, ChevronDown, ExternalLink, BookOpen, Code2,
  CheckCircle2, Circle, Lock, Zap, Target, Terminal, Lightbulb,
  Trophy, HelpCircle, ChevronLeft, Search, X, Clock, BarChart2
} from 'lucide-react';
import { TRACKS, ROADMAPS } from './roadmapData.js';

// ─── DIFFICULTY BADGE ────────────────────────────────────
function DifficultyBadge({ level }) {
  const map = {
    Beginner:     'bg-emerald-900/40 text-emerald-400 border-emerald-500/30',
    Intermediate: 'bg-amber-900/40 text-amber-400 border-amber-500/30',
    Advanced:     'bg-rose-900/40 text-rose-400 border-rose-500/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[level] || map.Beginner}`}>
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
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                margin: '0.75rem 0',
                padding: '1rem',
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-6 mb-3 pb-2 border-b border-white/10">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold text-slate-200 mt-5 mb-2">{children}</h3>,
        p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-3 text-sm">{children}</p>,
        ul: ({ children }) => <ul className="space-y-1.5 mb-3 pl-4">{children}</ul>,
        ol: ({ children }) => <ol className="space-y-1.5 mb-3 pl-4 list-decimal list-inside">{children}</ol>,
        li: ({ children }) => <li className="text-slate-300 text-sm flex gap-2"><span className="text-cyan-500 mt-1 flex-shrink-0">›</span><span>{children}</span></li>,
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4 rounded-lg border border-white/10">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
        th: ({ children }) => <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{children}</th>,
        td: ({ children }) => <td className="px-4 py-2 text-slate-300 border-t border-white/5 text-xs">{children}</td>,
        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
        a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">{children}</a>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-cyan-500 pl-4 py-1 my-3 bg-cyan-500/5 rounded-r-lg text-slate-300 text-sm italic">{children}</blockquote>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── QUIZ COMPONENT ──────────────────────────────────────
function QuizPanel({ quizzes, trackColor }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!quizzes?.length) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
      <HelpCircle size={40} className="opacity-30" />
      <p className="text-sm">No quiz questions for this topic</p>
    </div>
  );

  if (finished) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-48 gap-4">
      <Trophy size={48} className="text-amber-400" />
      <div className="text-center">
        <p className="text-2xl font-bold text-white">{score}/{quizzes.length}</p>
        <p className="text-slate-400 text-sm mt-1">
          {score === quizzes.length ? '🎉 Perfect score!' : score > quizzes.length / 2 ? '👍 Good job!' : '📚 Keep studying!'}
        </p>
      </div>
      <button onClick={() => { setCurrent(0); setSelected(null); setRevealed(false); setScore(0); setFinished(false); }}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: trackColor }}>
        Retry Quiz
      </button>
    </motion.div>
  );

  const q = quizzes[current];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Question {current + 1} of {quizzes.length}</span>
        <span className="text-xs text-slate-500">Score: {score}/{current}</span>
      </div>
      <p className="text-white font-medium text-sm leading-relaxed">{q.q}</p>
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          let cls = 'border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300';
          if (revealed) {
            if (i === q.answer) cls = 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
            else if (i === selected) cls = 'border-rose-500 bg-rose-500/20 text-rose-300';
            else cls = 'border-white/5 bg-white/5 text-slate-500 opacity-50';
          } else if (selected === i) cls = 'border-white/30 bg-white/10 text-white';
          return (
            <button key={i} disabled={revealed}
              onClick={() => setSelected(i)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm transition-all ${cls}`}>
              <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
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
          className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-30 transition-all"
          style={{ background: selected !== null ? trackColor : undefined, backgroundColor: selected === null ? 'rgba(255,255,255,0.05)' : undefined }}>
          Submit Answer
        </button>
      ) : (
        <button
          onClick={() => {
            setSelected(null);
            setRevealed(false);
            if (current + 1 < quizzes.length) setCurrent(c => c + 1);
            else setFinished(true);
          }}
          className="w-full py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: trackColor }}>
          {current + 1 < quizzes.length ? 'Next Question →' : 'See Results'}
        </button>
      )}
    </div>
  );
}

// ─── NODE DETAIL PANEL ───────────────────────────────────
const DETAIL_TABS = [
  { id: 'notes', label: 'Concept Notes', icon: BookOpen },
  { id: 'resources', label: 'Resources', icon: ExternalLink },
  { id: 'practices', label: 'Best Practices', icon: Lightbulb },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'setup', label: 'Setup Guide', icon: Terminal },
];

function NodeDetailPanel({ node, trackColor, onClose }) {
  const [activeTab, setActiveTab] = useState('notes');
  const availableTabs = DETAIL_TABS.filter(t => {
    if (t.id === 'setup' && !node.setup) return false;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="flex flex-col h-full bg-[#0d1117] border-l border-white/8"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/8 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white leading-snug">{node.title}</h3>
            <div className="flex items-center gap-3 mt-2">
              <DifficultyBadge level={node.difficulty} />
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={11} /> {node.duration}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-none">
          {availableTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
                style={isActive ? { background: `${trackColor}25`, color: trackColor, border: `1px solid ${trackColor}40` } : {}}>
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {activeTab === 'notes' && (
              <MarkdownContent content={node.notes || '*No notes available for this topic yet.*'} />
            )}

            {activeTab === 'resources' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">Curated from official documentation and industry-standard resources</p>
                {(node.resources || []).map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/15 transition-all group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${trackColor}20`, border: `1px solid ${trackColor}30` }}>
                      <ExternalLink size={14} style={{ color: trackColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium group-hover:text-cyan-300 transition-colors truncate">{r.label}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{r.url}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                  </a>
                ))}
                {(!node.resources || node.resources.length === 0) && (
                  <p className="text-slate-500 text-sm text-center py-6">No external resources listed yet</p>
                )}
              </div>
            )}

            {activeTab === 'practices' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-3">Industry best practices curated from production engineering teams</p>
                {(node.bestPractices || []).map((bp, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl border border-white/8 bg-white/3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${trackColor}20`, border: `1px solid ${trackColor}40` }}>
                      <span className="text-xs font-bold" style={{ color: trackColor }}>{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{bp}</p>
                  </div>
                ))}
                {(!node.bestPractices || node.bestPractices.length === 0) && (
                  <p className="text-slate-500 text-sm text-center py-6">Best practices coming soon</p>
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
  );
}

// ─── ROADMAP TREE ─────────────────────────────────────────
function RoadmapTree({ roadmap, trackColor, completedNodes, onNodeClick, selectedNodeId }) {
  const [expandedPhases, setExpandedPhases] = useState(() =>
    new Set(roadmap.phases.map(p => p.id))
  );

  const togglePhase = (id) => {
    setExpandedPhases(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  let nodeCount = 0;

  return (
    <div className="space-y-3 p-4">
      {roadmap.phases.map((phase, pi) => {
        const isOpen = expandedPhases.has(phase.id);
        return (
          <div key={phase.id} className="rounded-2xl border border-white/8 overflow-hidden">
            {/* Phase Header */}
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/3 hover:bg-white/6 transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: trackColor, color: 'white' }}>
                {phase.phase}
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-200">{phase.title}</span>
              <span className="text-xs text-slate-500 mr-2">{phase.nodes.length} topics</span>
              {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
            </button>

            {/* Nodes */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    {phase.nodes.map((node, ni) => {
                      const globalIndex = nodeCount++;
                      const isCompleted = completedNodes.includes(node.id);
                      const isSelected = selectedNodeId === node.id;
                      const isLocked = globalIndex > 0 && !completedNodes.includes(roadmap.phases.flatMap(p => p.nodes)[globalIndex - 1]?.id) && !isCompleted;

                      return (
                        <button
                          key={node.id}
                          onClick={() => !isLocked && onNodeClick(node)}
                          disabled={false}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                            isSelected ? 'ring-1' : 'hover:bg-white/5'
                          }`}
                          style={isSelected ? {
                            background: `${trackColor}15`,
                            ringColor: trackColor,
                            border: `1px solid ${trackColor}40`,
                          } : { border: '1px solid transparent' }}
                        >
                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 size={18} style={{ color: trackColor }} />
                            ) : (
                              <Circle size={18} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                            )}
                          </div>

                          {/* Title */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                              {node.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">{node.duration} · {node.difficulty}</p>
                          </div>

                          <ChevronRight size={14} className={`flex-shrink-0 transition-colors ${isSelected ? 'text-slate-300' : 'text-slate-700 group-hover:text-slate-500'}`} />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── TRACK SELECTOR SIDEBAR ──────────────────────────────
function TrackSidebar({ selectedTrack, onSelect }) {
  return (
    <div className="w-20 flex-shrink-0 border-r border-white/8 bg-[#0a0e14] flex flex-col gap-1 py-3 px-2">
      {TRACKS.map(track => {
        const isActive = selectedTrack === track.id;
        return (
          <button
            key={track.id}
            onClick={() => onSelect(track.id)}
            title={track.label}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
              isActive ? 'bg-white/8' : 'hover:bg-white/4'
            }`}
            style={isActive ? { border: `1px solid ${track.color}40`, background: `${track.color}12` } : { border: '1px solid transparent' }}
          >
            <span className="text-xl">{track.icon}</span>
            <span className="text-[9px] text-center leading-tight font-medium"
              style={{ color: isActive ? track.color : '#64748b' }}>
              {track.label.split(' ').map((w, i) => i < 2 ? w : '').filter(Boolean).join(' ')}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── PROGRESS HEADER ─────────────────────────────────────
function ProgressHeader({ roadmap, completedNodes, trackColor }) {
  const totalNodes = roadmap.phases.reduce((sum, p) => sum + p.nodes.length, 0);
  const pct = Math.round((completedNodes.length / totalNodes) * 100);

  return (
    <div className="px-4 py-3 border-b border-white/8 flex items-center gap-4 bg-[#0a0e14]">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-sm font-bold text-white">{roadmap.title}</h2>
          <span className="text-xs" style={{ color: trackColor }}>{pct}% complete</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: trackColor }}
          />
        </div>
        <p className="text-xs text-slate-600 mt-1">{roadmap.tagline}</p>
      </div>
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

  const roadmap = ROADMAPS[selectedTrackId];
  const track = TRACKS.find(t => t.id === selectedTrackId);
  const trackColor = track?.color || '#06b6d4';

  // All nodes flattened for search
  const allNodes = useMemo(() => {
    if (!roadmap) return [];
    return roadmap.phases.flatMap(p =>
      p.nodes.map(n => ({ ...n, phaseName: p.title, trackId: selectedTrackId }))
    );
  }, [roadmap, selectedTrackId]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results = [];
    TRACKS.forEach(t => {
      const r = ROADMAPS[t.id];
      if (!r) return;
      r.phases.forEach(p => {
        p.nodes.forEach(n => {
          if (n.title.toLowerCase().includes(q) || n.difficulty?.toLowerCase().includes(q)) {
            results.push({ ...n, phaseName: p.title, trackId: t.id, trackLabel: t.label, trackColor: t.color, trackIcon: t.icon });
          }
        });
      });
    });
    return results.slice(0, 10);
  }, [searchQuery]);

  const handleNodeClick = (node) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  };

  const handleMarkComplete = (nodeId) => {
    setCompletedNodes(prev =>
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const handleTrackChange = (trackId) => {
    setSelectedTrackId(trackId);
    setSelectedNode(null);
  };

  return (
    <div className="flex h-screen bg-[#070b10] text-gray-100 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Track Sidebar */}
      <TrackSidebar selectedTrack={selectedTrackId} onSelect={handleTrackChange} />

      {/* Roadmap Tree Panel */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-white/8 bg-[#0a0e14]">
        {roadmap && (
          <>
            <ProgressHeader roadmap={roadmap} completedNodes={completedNodes} trackColor={trackColor} />

            {/* Search Bar */}
            <div className="px-3 py-2 border-b border-white/8">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchOpen(!!e.target.value); }}
                  placeholder="Search any topic..."
                  className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-white/20 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Search Dropdown */}
              <AnimatePresence>
                {searchOpen && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute z-50 mt-1 w-72 bg-[#111827] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                  >
                    {searchResults.map(r => (
                      <button
                        key={`${r.trackId}-${r.id}`}
                        onClick={() => {
                          if (r.trackId !== selectedTrackId) handleTrackChange(r.trackId);
                          setTimeout(() => {
                            const nodeData = ROADMAPS[r.trackId]?.phases.flatMap(p => p.nodes).find(n => n.id === r.id);
                            if (nodeData) setSelectedNode(nodeData);
                          }, 100);
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left"
                      >
                        <span className="text-lg flex-shrink-0">{r.trackIcon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{r.title}</p>
                          <p className="text-xs text-slate-500">{r.trackLabel} · {r.phaseName}</p>
                        </div>
                        <DifficultyBadge level={r.difficulty} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto">
              <RoadmapTree
                roadmap={roadmap}
                trackColor={trackColor}
                completedNodes={completedNodes}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNode?.id}
              />
            </div>
          </>
        )}
      </div>

      {/* Detail Panel */}
      <div className="flex-1 min-w-0 flex flex-col">
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <div className="flex-1 flex flex-col">
              {/* Mark Complete bar */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-[#0a0e14] flex-shrink-0">
                <button
                  onClick={() => handleMarkComplete(selectedNode.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    completedNodes.includes(selectedNode.id)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'border border-white/15 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}>
                  {completedNodes.includes(selectedNode.id) ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  {completedNodes.includes(selectedNode.id) ? 'Completed ✓' : 'Mark Complete'}
                </button>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs text-slate-500">{selectedNode.phaseName || ''}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <NodeDetailPanel
                  node={selectedNode}
                  trackColor={trackColor}
                  onClose={() => setSelectedNode(null)}
                />
              </div>
            </div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-6 p-8"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl"
                  style={{ background: `${trackColor}15`, border: `2px dashed ${trackColor}30` }}>
                  {track?.icon}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0a0e14] border border-white/10 flex items-center justify-center">
                  <Zap size={14} style={{ color: trackColor }} />
                </div>
              </div>

              <div className="text-center max-w-md">
                <h3 className="text-xl font-bold text-white mb-2">{roadmap?.title}</h3>
                <p className="text-slate-400 text-sm">{roadmap?.tagline}</p>
              </div>

              {/* Quick Stats */}
              {roadmap && (
                <div className="flex gap-4">
                  {[
                    { label: 'Phases', value: roadmap.phases.length },
                    { label: 'Topics', value: roadmap.phases.reduce((s, p) => s + p.nodes.length, 0) },
                    { label: 'Completed', value: completedNodes.filter(id => roadmap.phases.flatMap(p => p.nodes).some(n => n.id === id)).length },
                  ].map(stat => (
                    <div key={stat.label} className="text-center px-6 py-4 rounded-2xl border border-white/8 bg-white/3">
                      <p className="text-2xl font-bold" style={{ color: trackColor }}>{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-slate-600 text-sm flex items-center gap-2">
                <ChevronLeft size={14} />
                Select a topic from the left panel to start learning
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
