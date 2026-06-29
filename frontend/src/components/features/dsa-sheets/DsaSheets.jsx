import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, CheckCircle2, Circle, AlertCircle, RefreshCw, BarChart2,
  ChevronDown, ChevronRight, Play, ExternalLink, Loader2, Search,
  Filter, Zap, Target, Trophy, Youtube, BookOpen, Hash
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from 'recharts';

const SHEETS = [
  { key: 'striver',  label: "Striver A2Z",     badge: "450+",  color: "from-violet-600 to-violet-400"  },
  { key: 'babbar',   label: "Love Babbar",      badge: "450",   color: "from-cyan-600   to-cyan-400"    },
  { key: 'neetcode', label: "NeetCode 150",     badge: "150",   color: "from-emerald-600 to-emerald-400"},
];

const DIFFICULTY_COLORS = {
  Easy:   { text: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  Medium: { text: 'text-amber-400',   bg: 'bg-amber-400/10  border-amber-400/20'   },
  Hard:   { text: 'text-red-400',     bg: 'bg-red-400/10    border-red-400/20'     },
};

function groupByCategory(problems) {
  const grouped = {};
  for (const p of problems) {
    const cat = p.category || 'Uncategorized';
    const sub = p.subCategory || 'General';
    if (!grouped[cat]) grouped[cat] = {};
    if (!grouped[cat][sub]) grouped[cat][sub] = [];
    grouped[cat][sub].push(p);
  }
  return grouped;
}

export default function DsaSheets() {
  const navigate = useNavigate();
  const {
    sheetProgress,
    sheetsLoading,
    fetchSheetProgress,
    toggleProblemStatus,
    dsaProblems,
    dsaProblemsLoading,
    fetchDsaProblems,
  } = useStore();

  const [selectedSheet, setSelectedSheet] = useState('striver');
  const [toggleLoading, setToggleLoading] = useState({});
  const [openCategories, setOpenCategories] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Fetch both progress and problems when sheet changes
  useEffect(() => {
    fetchSheetProgress(selectedSheet);
    fetchDsaProblems(selectedSheet);
    setOpenCategories({});
    setSearchQuery('');
  }, [selectedSheet, fetchSheetProgress, fetchDsaProblems]);

  const completedIds = useMemo(
    () => new Set(sheetProgress.filter(p => p.sheetType === selectedSheet && p.status === 'completed').map(p => p.problemId)),
    [sheetProgress, selectedSheet]
  );

  const filteredProblems = useMemo(() => {
    return dsaProblems.filter(p => {
      const matchesSheet = p.sheetType === selectedSheet;
      const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
      const matchesStatus =
        filterStatus === 'All' ? true :
        filterStatus === 'Done' ? completedIds.has(p.problemId) :
        !completedIds.has(p.problemId);
      return matchesSheet && matchesSearch && matchesDiff && matchesStatus;
    });
  }, [dsaProblems, selectedSheet, searchQuery, filterDifficulty, filterStatus, completedIds]);

  const grouped = useMemo(() => groupByCategory(filteredProblems), [filteredProblems]);
  const totalProblems = dsaProblems.filter(p => p.sheetType === selectedSheet).length;
  const completedCount = dsaProblems.filter(p => p.sheetType === selectedSheet && completedIds.has(p.problemId)).length;
  const progressPercent = totalProblems ? Math.round((completedCount / totalProblems) * 100) : 0;

  // Auto-open first category
  useEffect(() => {
    const keys = Object.keys(grouped);
    if (keys.length > 0) {
      setOpenCategories(prev => {
        if (Object.keys(prev).length === 0) {
          return { [keys[0]]: true };
        }
        return prev;
      });
    }
  }, [grouped]);

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleToggleCheckbox = async (problem, isCompleted) => {
    const pid = problem.problemId;
    setToggleLoading(prev => ({ ...prev, [pid]: true }));
    try {
      await toggleProblemStatus(selectedSheet, pid, !isCompleted);
    } catch (err) {
      console.error(err);
    } finally {
      setToggleLoading(prev => ({ ...prev, [pid]: false }));
    }
  };

  // 7-day progress chart (cumulative solved)
  const chartData = useMemo(() => {
    const steps = 6;
    const now = new Date();
    
    // Start of the 7-day period (6 days ago at 00:00:00)
    const startDate = new Date();
    startDate.setDate(now.getDate() - steps);
    startDate.setHours(0, 0, 0, 0);

    const completedWithDates = sheetProgress
      .filter(p => p.sheetType === selectedSheet && p.status === 'completed')
      .map(p => ({ date: new Date(p.solvedAt || p.updatedAt || p.createdAt || Date.now()) }));

    // Count how many were solved during this 7-day window
    const solvedThisWeek = completedWithDates.filter(p => p.date >= startDate).length;
    
    // Define a realistic weekly goal (e.g. 7 problems)
    const weeklyGoal = Math.max(7, solvedThisWeek);

    return Array.from({ length: steps + 1 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      day.setHours(23, 59, 59, 999);

      // Solved since the start of the week up to this day
      const solvedUpToDay = completedWithDates.filter(p => p.date >= startDate && p.date <= day).length;
      const target = parseFloat(((weeklyGoal / steps) * i).toFixed(1));
      
      return {
        name: day.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }),
        "Solved": solvedUpToDay,
        "Target": target,
      };
    });
  }, [sheetProgress, selectedSheet]);

  const isLoading = sheetsLoading || dsaProblemsLoading;
  const categories = Object.keys(grouped);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-wide">
            DSA SHEET TRACKER
          </h2>
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
            CURATED PROBLEM SETS WITH INTEGRATED CODING SANDBOX
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-cyan-400 font-mono text-glow-cyan">{progressPercent}%</div>
          <div className="text-[10px] text-gray-500 font-mono uppercase">{completedCount}/{totalProblems} Solved</div>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="flex flex-wrap gap-3">
        {SHEETS.map(sheet => (
          <button
            key={sheet.key}
            onClick={() => setSelectedSheet(sheet.key)}
            className={`relative px-5 py-3 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all border overflow-hidden group ${
              selectedSheet === sheet.key
                ? 'bg-gradient-to-r from-violet-600/25 to-cyan-500/15 text-white border-violet-500/40 text-glow-cyan'
                : 'bg-white/[0.01] hover:bg-white/[0.04] border-white/5 text-gray-500 hover:text-gray-300'
            }`}
          >
            {sheet.label}
            <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
              selectedSheet === sheet.key
                ? 'bg-violet-500/30 text-violet-300'
                : 'bg-white/5 text-gray-600'
            }`}>
              {sheet.badge}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT: Checklist Panel ── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Search + Filter Row */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/40 transition-colors"
              />
            </div>
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`px-3 py-2 rounded-xl text-[10px] font-mono font-bold uppercase border transition-all ${
                  filterDifficulty === d
                    ? d === 'Easy'   ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : d === 'Medium' ? 'bg-amber-500/15   border-amber-500/30   text-amber-400'
                    : d === 'Hard'   ? 'bg-red-500/15     border-red-500/30     text-red-400'
                    : 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                    : 'border-white/5 text-gray-600 hover:text-gray-400'
                }`}
              >
                {d}
              </button>
            ))}
            {['All', 'Done', 'Todo'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-[10px] font-mono font-bold uppercase border transition-all ${
                  filterStatus === s
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                    : 'border-white/5 text-gray-600 hover:text-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Problem List */}
          <div className="glassmorphism rounded-3xl border-white/10 box-glow-violet overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-xs font-mono text-gray-500 uppercase animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                Fetching {totalProblems > 0 ? `${totalProblems}` : ''} problems...
              </div>
            ) : categories.length === 0 ? (
              <div className="py-16 text-center text-gray-600 font-mono text-xs">
                No problems match your filters.
              </div>
            ) : (
              <div>
                {categories.map((cat, ci) => {
                  const subCategories = grouped[cat];
                  const allProblemsInCat = Object.values(subCategories).flat();
                  const doneInCat = allProblemsInCat.filter(p => completedIds.has(p.problemId)).length;
                  const isOpen = !!openCategories[cat];

                  return (
                    <div key={cat} className={ci > 0 ? 'border-t border-white/5' : ''}>
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(cat)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                            <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300" />
                          </div>
                          <span className="text-sm font-bold text-white tracking-wide">{cat}</span>
                          <span className="text-[9px] font-mono text-gray-600 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-lg uppercase">
                            {allProblemsInCat.length} problems
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-emerald-400">{doneInCat}/{allProblemsInCat.length}</span>
                          <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all"
                              style={{ width: `${allProblemsInCat.length ? (doneInCat / allProblemsInCat.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </button>

                      {/* Subcategory + Problems */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key={cat}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            {Object.entries(subCategories).map(([sub, problems]) => (
                              <div key={sub}>
                                <div className="px-8 py-2 text-[9px] font-mono font-bold text-gray-600 uppercase tracking-widest bg-white/[0.01] border-y border-white/[0.03] flex items-center gap-2">
                                  <Hash size={8} />
                                  {sub}
                                </div>
                                <div>
                                  {problems.map((p, pi) => {
                                    const isCompleted = completedIds.has(p.problemId);
                                    const isL = toggleLoading[p.problemId];
                                    const diffInfo = DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS.Medium;

                                    return (
                                      <div
                                        key={p.problemId}
                                        className={`flex items-center justify-between px-8 py-3 border-b border-white/[0.03] transition-all group hover:bg-white/[0.02] ${
                                          isCompleted ? 'bg-emerald-950/10' : ''
                                        } ${pi === problems.length - 1 ? 'border-b-0' : ''}`}
                                      >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                          {/* Checkbox */}
                                          <button
                                            onClick={() => handleToggleCheckbox(p, isCompleted)}
                                            disabled={isL}
                                            className={`shrink-0 transition-all active:scale-90 ${
                                              isCompleted ? 'text-emerald-400' : 'text-gray-700 hover:text-white'
                                            }`}
                                          >
                                            {isL ? (
                                              <span className="w-4 h-4 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin block" />
                                            ) : isCompleted ? (
                                              <CheckCircle2 size={16} className="text-glow-cyan" />
                                            ) : (
                                              <Circle size={16} />
                                            )}
                                          </button>

                                          {/* Title */}
                                          <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-semibold truncate leading-snug ${
                                              isCompleted ? 'text-gray-500 line-through' : 'text-white'
                                            }`}>
                                              {p.title}
                                            </div>
                                          </div>

                                          {/* Difficulty badge */}
                                          <span className={`shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${diffInfo.bg} ${diffInfo.text}`}>
                                            {p.difficulty}
                                          </span>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                          {p.youtube && (
                                            <a
                                              href={p.youtube}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={e => e.stopPropagation()}
                                              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                              title="Watch Solution"
                                            >
                                              <Youtube size={12} />
                                            </a>
                                          )}
                                          {p.link && (
                                            <a
                                              href={p.link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={e => e.stopPropagation()}
                                              className="p-1.5 rounded-lg text-gray-600 hover:bg-violet-400/10 transition-all flex items-center justify-center"
                                              title={p.link.includes('leetcode.com') ? "Open on LeetCode" : "Open Link"}
                                            >
                                              {p.link.includes('leetcode.com') ? (
                                                <svg className="w-3.5 h-3.5 fill-[#FFA116]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.074-1.954l-5.32-5.594c-.062-.062-.125-.125-.187-.188l3.966-4.254c.484-.53.473-1.378-.023-1.895l-2.072-2.073c-.274-.274-.633-.427-.999-.427zM6.53 14.773l1.879-1.996a.915.915 0 0 1 1.272 0l1.876 1.996a.915.915 0 0 1 0 1.273l-1.876 1.996a.915.915 0 0 1-1.272 0L6.53 16.046a.915.915 0 0 1 0-1.273zm10.94 0l1.877-1.996a.915.915 0 0 1 1.273 0l1.877 1.996a.915.915 0 0 1 0 1.273l-1.877 1.996a.915.915 0 0 1-1.273 0l-1.877-1.996a.915.915 0 0 1 0-1.273z"/>
                                                </svg>
                                              ) : (
                                                <ExternalLink size={12} className="text-gray-600 hover:text-violet-400" />
                                              )}
                                            </a>
                                          )}
                                          {/* Solve in Sandbox */}
                                          <button
                                            onClick={() => navigate(`/dsa-sheets/solve/${p.problemId}`)}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/35 transition-all"
                                            title="Open in Sandbox"
                                          >
                                            <Play size={9} className="fill-current" /> Solve
                                          </button>
                                        </div>

                                        {/* XP tag */}
                                        <span className={`ml-3 font-mono text-[9px] shrink-0 ${isCompleted ? 'text-emerald-500' : 'text-gray-600'}`}>
                                          {isCompleted ? '+15 XP' : '15 XP'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Stats Panel ── */}
        <div className="space-y-4">

          {/* Progress Ring Card */}
          <div className="glassmorphism rounded-3xl p-6 border-white/10 box-glow-cyan">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2 mb-5">
              <BarChart2 size={14} className="text-cyan-400" /> Progress Overview
            </h3>

            {/* Big % ring */}
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#progressGrad)" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white font-mono">{progressPercent}%</span>
                <span className="text-[9px] text-gray-500 font-mono">DONE</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2">
                <div className="text-lg font-bold text-emerald-400 font-mono">{completedCount}</div>
                <div className="text-[9px] text-gray-600 font-mono uppercase">Done</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2">
                <div className="text-lg font-bold text-gray-300 font-mono">{totalProblems - completedCount}</div>
                <div className="text-[9px] text-gray-600 font-mono uppercase">Left</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2">
                <div className="text-lg font-bold text-violet-400 font-mono">{completedCount * 15}</div>
                <div className="text-[9px] text-gray-600 font-mono uppercase">XP</div>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="glassmorphism rounded-3xl p-5 border-white/10">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <Target size={13} className="text-cyan-400" /> 7-Day Progress
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="#374151" fontSize={8} tickLine={false} />
                  <YAxis stroke="#374151" fontSize={8} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '10px' }}
                    labelStyle={{ color: '#fff', fontFamily: 'monospace' }}
                    itemStyle={{ fontFamily: 'monospace' }}
                  />
                  <Line type="monotone" dataKey="Target" stroke="#4b5563" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="Solved" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="glassmorphism rounded-3xl p-5 border-white/10">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <Trophy size={13} className="text-amber-400" /> Difficulty Breakdown
            </h3>
            <div className="space-y-2.5">
              {['Easy', 'Medium', 'Hard'].map(diff => {
                const total = dsaProblems.filter(p => p.sheetType === selectedSheet && p.difficulty === diff).length;
                const done  = dsaProblems.filter(p => p.sheetType === selectedSheet && p.difficulty === diff && completedIds.has(p.problemId)).length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                const colors = DIFFICULTY_COLORS[diff];
                return (
                  <div key={diff}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-mono font-bold uppercase ${colors.text}`}>{diff}</span>
                      <span className="text-[10px] font-mono text-gray-500">{done}/{total}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          diff === 'Easy' ? 'bg-emerald-400' : diff === 'Medium' ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info tip */}
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3 text-xs text-gray-400 leading-relaxed">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-cyan-400" />
            <span>Click <strong className="text-white">Solve</strong> next to any problem to open it in the AI-powered coding sandbox with Monaco Editor.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
