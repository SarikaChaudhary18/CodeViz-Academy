import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Search, Star, CheckCircle, ChevronDown, ChevronUp, 
  HelpCircle, Shield, Award, Sparkles, Filter, Check, StarOff, Loader2 
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useStore } from '../../../hooks/useStore';

export default function CompanyPrep() {
  const { user, setUser } = useStore();
  
  // Data loading states
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [progress, setProgress] = useState({ completedQuestions: [], starredQuestions: [] });
  
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expanded question drawer state
  const [expandedId, setExpandedId] = useState(null);

  // XP animation state
  const [xpAnimation, setXpAnimation] = useState(null); // { questionId, x, y }

  // Load questions and categories
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/company-prep/questions');
        if (res.status === 'success') {
          setQuestions(res.data.questions || []);
          setCategories(['All', ...(res.data.categories || [])]);
          setDifficulties(['All', ...(res.data.difficulties || [])]);
        }
      } catch (err) {
        console.error('Failed to load questions:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProgress = async () => {
      setProgressLoading(true);
      try {
        const res = await api.get('/company-prep/progress');
        if (res.status === 'success') {
          setProgress(res.data || { completedQuestions: [], starredQuestions: [] });
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
      } finally {
        setProgressLoading(false);
      }
    };

    fetchQuestions();
    fetchProgress();
  }, []);

  // Filtered questions memo
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchCat = selectedCategory === 'All' || q.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchDiff = selectedDifficulty === 'All' || q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      const matchSearch = !searchQuery || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchDiff && matchSearch;
    });
  }, [questions, selectedCategory, selectedDifficulty, searchQuery]);

  // Star toggle handler
  const handleToggleStar = async (questionId) => {
    try {
      const res = await api.post('/company-prep/toggle-star', { questionNumber: questionId });
      if (res.status === 'success') {
        setProgress(prev => ({
          ...prev,
          starredQuestions: res.data.starredQuestions
        }));
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  // Completion toggle handler (XP awarding)
  const handleToggleComplete = async (e, questionId) => {
    e.stopPropagation();
    try {
      const res = await api.post('/company-prep/toggle-complete', { questionNumber: questionId });
      if (res.status === 'success') {
        const isNowCompleted = res.data.completedQuestions.includes(questionId);
        
        // Trigger floating +20 XP particle animation if checked
        if (isNowCompleted) {
          const rect = e.target.getBoundingClientRect();
          setXpAnimation({
            id: questionId,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          setTimeout(() => setXpAnimation(null), 1000);
        }

        setProgress(prev => ({
          ...prev,
          completedQuestions: res.data.completedQuestions
        }));

        // Update global user XP
        if (res.newXp && useStore.getState().setUser) {
          useStore.getState().setUser({
            ...user,
            xp: res.newXp,
            level: res.newLevel
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle complete:', err);
    }
  };

  // Stats calculations
  const totalCount = questions.length;
  const completedCount = progress.completedQuestions?.length || 0;
  const starredCount = progress.starredQuestions?.length || 0;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 pb-16 relative">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-wide font-sans flex items-center gap-2">
            <Briefcase className="text-cyan-400" size={28} />
            COMPANY PREP PORTAL
          </h2>
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
            INTERVIEW Q&A PREPARATION SOURCE GENERATED DIRECTLY FROM VERIFIED CSV
          </p>
        </div>

        {/* Stats Summary cards */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Completion Card */}
          <div className="flex-1 min-w-[120px] bg-zinc-950/40 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-[9px] font-mono text-zinc-500 uppercase">Progress</p>
              <p className="text-base font-bold text-white font-mono">{completedCount} / {totalCount}</p>
            </div>
          </div>

          {/* Starred Card */}
          <div className="flex-1 min-w-[120px] bg-zinc-950/40 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Star size={20} className="fill-current" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-zinc-500 uppercase">Starred</p>
              <p className="text-base font-bold text-white font-mono">{starredCount} Saved</p>
            </div>
          </div>

          {/* Progress Bar Card */}
          <div className="flex-1 min-w-[150px] bg-zinc-950/40 border border-white/5 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-[9px] font-mono uppercase text-zinc-400">
              <span>Completion Rate</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter HUD & Question List Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-950/20 border border-white/5 rounded-3xl p-5 space-y-6">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-white/5">
              <Filter size={14} className="text-cyan-400" /> Filters
            </h3>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Category</label>
              <div className="flex flex-col gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-mono text-left uppercase transition-all border ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-white font-bold'
                        : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-mono uppercase transition-all border ${
                      selectedDifficulty === diff
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-white font-bold'
                        : 'bg-zinc-950/40 border-white/5 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Search Box & Question Sheet */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-zinc-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interview questions, correct answers, topics..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/5 bg-zinc-950/20 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          {/* Question List */}
          <div className="bg-zinc-950/20 border border-white/5 rounded-3xl overflow-hidden">
            {loading || progressLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <Loader2 className="animate-spin text-cyan-400" size={24} />
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider animate-pulse">
                  Parsing local CSV questions...
                </p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-2">
                <HelpCircle size={28} className="text-zinc-600" />
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">No matching questions found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredQuestions.map((q) => {
                  const isExpanded = expandedId === q.id;
                  const isCompleted = progress.completedQuestions?.includes(q.id);
                  const isStarred = progress.starredQuestions?.includes(q.id);

                  // Color mapping based on difficulty
                  const diffColor = q.difficulty.toLowerCase() === 'easy' 
                    ? 'text-emerald-400 bg-emerald-500/10' 
                    : q.difficulty.toLowerCase() === 'medium'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-rose-400 bg-rose-500/10';

                  return (
                    <div 
                      key={q.id} 
                      className={`transition-colors duration-200 ${isExpanded ? 'bg-white/[0.015]' : 'hover:bg-white/[0.005]'}`}
                    >
                      {/* Row Clickable Header */}
                      <div 
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Complete Checkbox */}
                          <button
                            onClick={(e) => handleToggleComplete(e, q.id)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all relative ${
                              isCompleted 
                                ? 'bg-cyan-500 border-transparent text-zinc-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                                : 'border-white/10 hover:border-cyan-500/40 text-transparent'
                            }`}
                          >
                            <Check size={14} className="stroke-[3]" />
                            {xpAnimation?.id === q.id && (
                              <motion.span
                                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                                animate={{ opacity: 0, y: -30, scale: 1.2 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="absolute text-[10px] font-mono font-bold text-cyan-400 pointer-events-none"
                              >
                                +20 XP
                              </motion.span>
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[9px] font-mono text-zinc-500">#{q.id}</span>
                              <span className="px-2 py-0.5 rounded-full text-[8px] font-mono uppercase bg-zinc-900 border border-white/5 text-zinc-400">
                                {q.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono uppercase ${diffColor}`}>
                                {q.difficulty}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white mt-1.5 uppercase tracking-wide truncate pr-4">
                              {q.question}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Star Action */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(q.id);
                            }}
                            className={`p-2 rounded-xl border transition-all ${
                              isStarred 
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <Star size={14} className={isStarred ? 'fill-current' : ''} />
                          </button>

                          {isExpanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                        </div>
                      </div>

                      {/* Expandable Answer Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden border-t border-white/5"
                          >
                            <div className="p-5 pl-14 bg-zinc-950/20 text-xs font-sans text-zinc-300 leading-relaxed border-l-2 border-cyan-500/40">
                              <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-2">
                                <Sparkles size={11} /> Correct Explanation
                              </div>
                              <p className="font-sans text-zinc-300">
                                {q.answer}
                              </p>
                            </div>
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

      </div>

    </div>
  );
}
