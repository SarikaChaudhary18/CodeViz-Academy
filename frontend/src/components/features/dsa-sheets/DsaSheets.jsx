import React, { useEffect, useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, CheckCircle2, Circle, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function DsaSheets() {
  const {
    sheetProgress,
    sheetsLoading,
    fetchSheetProgress,
    toggleProblemStatus
  } = useStore();

  const [selectedSheet, setSelectedSheet] = useState('striver');
  const [toggleLoading, setToggleLoading] = useState({});

  useEffect(() => {
    fetchSheetProgress(selectedSheet);
  }, [selectedSheet, fetchSheetProgress]);

  const sheetsQuestions = {
    striver: [
      { id: 's1', title: 'Two Sum', topic: 'Arrays & Hashing', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum' },
      { id: 's2', title: 'Reverse Linked List', topic: 'Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list' },
      { id: 's3', title: 'Merge Intervals', topic: 'Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals' },
      { id: 's4', title: 'Top K Frequent Elements', topic: 'Heaps / Priority Queues', difficulty: 'Medium', link: 'https://leetcode.com/problems/top-k-frequent-elements' },
      { id: 's5', title: 'Longest Palindromic Substring', topic: 'Dynamic Programming', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring' }
    ],
    babbar: [
      { id: 'b1', title: 'Reverse the Array', topic: 'Arrays', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-string' },
      { id: 'b2', title: 'Find Min and Max in Array', topic: 'Arrays', difficulty: 'Easy', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array' },
      { id: 'b3', title: 'Kth Smallest Element', topic: 'Heaps', difficulty: 'Medium', link: 'https://leetcode.com/problems/kth-largest-element-in-an-array' },
      { id: 'b4', title: 'Sort an Array of 0s, 1s, 2s', topic: 'Arrays', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-colors' },
      { id: 'b5', title: 'Cyclically Rotate an Array by One', topic: 'Arrays', difficulty: 'Easy', link: 'https://leetcode.com/problems/rotate-array' }
    ],
    neetcode: [
      { id: 'n1', title: 'Contains Duplicate', topic: 'Arrays & Hashing', difficulty: 'Easy', link: 'https://leetcode.com/problems/contains-duplicate' },
      { id: 'n2', title: 'Valid Anagram', topic: 'Arrays & Hashing', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-anagram' },
      { id: 'n3', title: 'Group Anagrams', topic: 'Arrays & Hashing', difficulty: 'Medium', link: 'https://leetcode.com/problems/group-anagrams' },
      { id: 'n4', title: 'Product of Array Except Self', topic: 'Arrays & Hashing', difficulty: 'Medium', link: 'https://leetcode.com/problems/product-of-array-except-self' },
      { id: 'n5', title: 'Longest Consecutive Sequence', topic: 'Arrays & Hashing', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-consecutive-sequence' }
    ]
  };

  const activeQuestions = sheetsQuestions[selectedSheet] || [];
  
  // Calculate completed count
  const completedProblems = sheetProgress
    .filter(p => p.sheetType === selectedSheet && p.status === 'completed')
    .map(p => p.problemId);

  const completedCount = activeQuestions.filter(q => completedProblems.includes(q.id)).length;
  const progressPercent = Math.round((completedCount / activeQuestions.length) * 100);

  // Generate 7-day timeline progress data representing a burn-down chart
  const generateChartData = () => {
    const data = [];
    const totalQuestions = activeQuestions.length || 1;
    const steps = 6; // 7 days (index 0 to 6)
    
    const completedWithDates = sheetProgress
      .filter(p => p.sheetType === selectedSheet && p.status === 'completed')
      .map(p => {
        const dateStr = p.solvedAt || p.updatedAt || p.createdAt;
        const d = dateStr ? new Date(dateStr) : new Date();
        return {
          problemId: p.problemId,
          date: d
        };
      });

    for (let i = 0; i <= steps; i++) {
      // Calculate the target day
      const day = new Date();
      day.setHours(23, 59, 59, 999); // end of that day
      day.setDate(day.getDate() - (steps - i));
      
      // Count how many questions were completed on or before this day's end
      const completedBeforeOrOnThisDay = completedWithDates.filter(p => p.date <= day).length;
      const actualRemaining = Math.max(0, totalQuestions - completedBeforeOrOnThisDay);
      
      // Estimated / Ideal Remaining (linear burndown from totalQuestions to 0)
      const estimatedRemaining = Math.max(0, parseFloat((totalQuestions - (totalQuestions / steps) * i).toFixed(1)));
      
      const formattedDate = day.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
      
      data.push({
        name: formattedDate,
        "Actual Burndown": actualRemaining,
        "Estimated Burndown": estimatedRemaining
      });
    }
    return data;
  };
  const chartData = generateChartData();

  const handleToggleCheckbox = async (problemId, isCurrentlyCompleted) => {
    setToggleLoading(prev => ({ ...prev, [problemId]: true }));
    try {
      await toggleProblemStatus(selectedSheet, problemId, !isCurrentlyCompleted);
    } catch (err) {
      alert(err.message || 'Failed to update problem status.');
    } finally {
      setToggleLoading(prev => ({ ...prev, [problemId]: false }));
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header HUD */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
          INTERACTIVE DSA SHEETS
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          TABBED PROBLEM CHECKLISTS WITH PERSISTED PROGRESS INTEGRATION & EXPERIENCE FEEDBACK
        </p>
      </div>

      {/* Sheet Selection tabs */}
      <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4">
        {[
          { key: 'striver', label: 'Striver A-Z Sheet' },
          { key: 'babbar', label: 'Love Babbar 450' },
          { key: 'neetcode', label: 'NeetCode 150' }
        ].map((sheet) => (
          <button
            key={sheet.key}
            onClick={() => setSelectedSheet(sheet.key)}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedSheet === sheet.key
                ? 'bg-gradient-to-r from-violet-600/35 to-cyan-500/20 text-white border-violet-500/40 text-glow-cyan'
                : 'bg-white/[0.01] hover:bg-white/[0.03] border-transparent text-gray-500'
            }`}
          >
            {sheet.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Checklist panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-violet relative overflow-hidden">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <Code size={18} className="text-violet-400" />
                Problem Checklist Matrix
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-lg">
                SECTOR SYNCED
              </span>
            </div>

            {sheetsLoading ? (
              <div className="text-center py-12 text-xs font-mono text-gray-500 uppercase animate-pulse flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin" />
                Synchronizing checklist states...
              </div>
            ) : (
              <div className="space-y-3">
                {activeQuestions.map((q) => {
                  const isCompleted = completedProblems.includes(q.id);
                  const isL = toggleLoading[q.id];

                  return (
                    <div 
                      key={q.id}
                      className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${
                        isCompleted 
                          ? 'bg-emerald-950/5 border-emerald-500/20 hover:border-emerald-500/40' 
                          : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleCheckbox(q.id, isCompleted)}
                          disabled={isL}
                          className={`shrink-0 transition-transform active:scale-95 ${
                            isCompleted ? 'text-emerald-400' : 'text-gray-600 hover:text-white'
                          }`}
                        >
                          {isL ? (
                            <span className="w-5 h-5 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin block" />
                          ) : isCompleted ? (
                            <CheckCircle2 size={20} className="text-glow-cyan" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                        
                        <div>
                          <a
                            href={q.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm font-semibold hover:text-cyan-400 transition-colors leading-snug ${
                              isCompleted ? 'text-gray-400 line-through' : 'text-white'
                            }`}
                          >
                            {q.title}
                          </a>
                          <div className="flex gap-2 items-center mt-1 text-[9px] font-mono text-gray-500 uppercase">
                            <span>{q.topic}</span>
                            <span>&bull;</span>
                            <span className={`font-bold ${
                              q.difficulty === 'Hard' ? 'text-red-400' : q.difficulty === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                            }`}>{q.difficulty}</span>
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-[10px] text-gray-500 tracking-wider">
                        {isCompleted ? '+15 XP Gained' : '+15 XP Reward'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Progress Radar & stats */}
        <div>
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-cyan relative overflow-hidden h-full flex flex-col justify-between">
            <div className="space-y-6">
              
              <h3 className="text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <BarChart2 size={18} className="text-cyan-400" />
                SHEETS PROGRESS
              </h3>

              <div className="text-center py-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Completion rate</h4>
                <div className="text-5xl font-extrabold text-glow-cyan text-cyan-400 font-mono">{progressPercent}%</div>
                <p className="text-[10px] text-gray-400 font-mono">
                  {completedCount} OF {activeQuestions.length} CHALLENGES MET
                </p>
              </div>

              {/* Progress Burndown Chart */}
              <div className="h-44 w-full bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={8} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={8} tickLine={false} domain={[0, activeQuestions.length || 5]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#070b19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontSize: '10px', fontFamily: 'monospace' }}
                      itemStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#fff', marginTop: '-5px' }}
                      verticalAlign="top"
                      height={28}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Estimated Burndown" 
                      stroke="#84cc16" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#84cc16' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Actual Burndown" 
                      stroke="#06b6d4" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#06b6d4' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Informative advice */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3 text-xs text-gray-400 leading-relaxed font-sans">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-cyan-400" />
                <span>
                  Solving DSA sheet problems syncs directly with user database entries. Complete daily algorithms quests by checking off items.
                </span>
              </div>

            </div>

            <p className="text-[9px] text-gray-500 text-center font-mono mt-6">ALIGNED WITH INTERVIEW DSA METRICS</p>
          </div>
        </div>

      </div>
    </div>
  );
}
