import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Target, ShieldCheck, Clock, CheckCircle2, Play, RefreshCw, AlertCircle } from 'lucide-react';

export default function CompanyPrep() {
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [isSandboxActive, setIsSandboxActive] = useState(false);
  const [sandboxTimeLeft, setSandboxTimeLeft] = useState(15 * 60); // 15 minutes
  const [answerInput, setAnswerInput] = useState('');
  const [checklist, setChecklist] = useState({
    clarified: false,
    bruteForce: false,
    optimized: false,
    complexities: false,
    dryRun: false,
  });
  const [assessmentScore, setAssessmentScore] = useState(null);

  // Timed sandbox count down
  useEffect(() => {
    let interval = null;
    if (isSandboxActive && sandboxTimeLeft > 0) {
      interval = setInterval(() => {
        setSandboxTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (sandboxTimeLeft === 0) {
      setIsSandboxActive(false);
      evaluateSandbox();
    }
    return () => clearInterval(interval);
  }, [isSandboxActive, sandboxTimeLeft]);

  const companiesData = {
    Google: {
      color: 'from-blue-600 to-red-500',
      difficulty: 'Hard (Algorithmic / Graph heavy)',
      topics: ['Dynamic Programming', 'Graph Algorithms', 'Tries & Maps', 'Interval scheduling'],
      questions: [
        { id: 'g1', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays' },
        { id: 'g2', title: 'Word Ladder', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-ladder' },
        { id: 'g3', title: 'Count of Smaller Numbers After Self', difficulty: 'Hard', url: 'https://leetcode.com/problems/count-of-smaller-numbers-after-self' },
        { id: 'g4', title: 'Find Median from Data Stream', difficulty: 'Hard', url: 'https://leetcode.com/problems/find-median-from-data-stream' },
        { id: 'g5', title: 'Merge k Sorted Lists', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists' }
      ],
      sandboxPrompt: 'Given an array of strings products and a string searchWord. Design a system that suggests at most three product names from products after each character of searchWord is typed. Suggested products should share a common prefix with searchWord. If there are more than three products, return the three lexicographically minimum products. Write your implementation structure and analyze runtime complexity.'
    },
    Meta: {
      color: 'from-indigo-600 to-cyan-500',
      difficulty: 'Medium-Hard (Speed & Optimized Big-O)',
      topics: ['Binary Search', 'Sliding Window', 'Two Pointers', 'Trees / BFS & DFS'],
      questions: [
        { id: 'm1', title: 'Subarray Sum Equals K', difficulty: 'Medium', url: 'https://leetcode.com/problems/subarray-sum-equals-k' },
        { id: 'm2', title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree' },
        { id: 'm3', title: 'Minimum Window Substring', difficulty: 'Hard', url: 'https://leetcode.com/problems/minimum-window-substring' },
        { id: 'm4', title: 'Binary Tree Right Side View', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-right-side-view' },
        { id: 'm5', title: 'Valid Palindrome II', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome-ii' }
      ],
      sandboxPrompt: 'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level). Write an optimized BFS approach using a Queue and explain the spatial complexity of saving nodes.'
    },
    Amazon: {
      color: 'from-amber-600 to-orange-400',
      difficulty: 'Medium (Arrays, Strings & Design)',
      topics: ['Priority Queues / Heaps', 'LRU Caching', 'Greedy Optimization', 'Topological Sort'],
      questions: [
        { id: 'a1', title: 'LRU Cache Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache' },
        { id: 'a2', title: 'Course Schedule II', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule-ii' },
        { id: 'a3', title: 'Reorganize String', difficulty: 'Medium', url: 'https://leetcode.com/problems/reorganize-string' },
        { id: 'a4', title: 'Analyze User Website Visit Pattern', difficulty: 'Medium', url: 'https://leetcode.com/problems/analyze-user-website-visit-pattern' },
        { id: 'a5', title: 'K Closest Points to Origin', difficulty: 'Medium', url: 'https://leetcode.com/problems/k-closest-points-to-origin' }
      ],
      sandboxPrompt: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) Cache. Implement it using a Doubly Linked List and a Hash Map. Show the nodes structure and explain how get(key) and put(key, value) operate in O(1) time.'
    },
    Netflix: {
      color: 'from-red-700 to-rose-600',
      difficulty: 'Medium (Concurrency & Design)',
      topics: ['Subarrays', 'Monotonic Stack', 'Multithreading patterns', 'System Design bases'],
      questions: [
        { id: 'n1', title: 'Sliding Window Maximum', difficulty: 'Hard', url: 'https://leetcode.com/problems/sliding-window-maximum' },
        { id: 'n2', title: 'Next Greater Element I', difficulty: 'Easy', url: 'https://leetcode.com/problems/next-greater-element-i' },
        { id: 'n3', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram' },
        { id: 'n4', title: 'Design Twitter', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-twitter' },
        { id: 'n5', title: 'Top K Frequent Elements', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements' }
      ],
      sandboxPrompt: 'Given an array of integers heights representing the histogram\'s bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram. Implement an optimized stack-based O(N) solution.'
    },
    Uber: {
      color: 'from-gray-800 to-black',
      difficulty: 'Hard (Graphs, Concurrency, Maps)',
      topics: ['Dijkstra Algorithm', 'QuadTrees', 'Design / GeoHash', 'Dynamic Programming'],
      questions: [
        { id: 'u1', title: 'Bus Routes', difficulty: 'Hard', url: 'https://leetcode.com/problems/bus-routes' },
        { id: 'u2', title: 'Construct Quad Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/construct-quad-tree' },
        { id: 'u3', title: 'Word Search II', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-search-ii' },
        { id: 'u4', title: 'Design Underground System', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-underground-system' },
        { id: 'u5', title: 'Shortest Path in a Grid with Obstacles Elimination', difficulty: 'Hard', url: 'https://leetcode.com/problems/shortest-path-in-a-grid-with-obstacles-elimination' }
      ],
      sandboxPrompt: 'You are designing a ridesharing map matcher. Given N taxi coordinates on a coordinate grid, find the closest k drivers to a target user coordinate in O(N log k) time. Write pseudo-code and explain which data structures minimize lookup delay.'
    }
  };

  const activeData = companiesData[selectedCompany];

  const startSandbox = () => {
    setIsSandboxActive(true);
    setSandboxTimeLeft(15 * 60);
    setAnswerInput('');
    setChecklist({
      clarified: false,
      bruteForce: false,
      optimized: false,
      complexities: false,
      dryRun: false,
    });
    setAssessmentScore(null);
  };

  const evaluateSandbox = () => {
    setIsSandboxActive(false);
    
    // Evaluate checklist checkboxes score
    const completedItems = Object.values(checklist).filter(v => v === true).length;
    const score = Math.round((completedItems / 5) * 100);
    setAssessmentScore(score);
  };

  const formatSandboxTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-8">
      
      {/* Header HUD */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
          COMPANY PREP HUBS
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          TARGETED COMPANY CURRICULUMS AND SIMULATED CODING SANDBOXES
        </p>
      </div>

      {/* Target Tabs Selection */}
      <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4">
        {Object.keys(companiesData).map((company) => (
          <button
            key={company}
            onClick={() => {
              if (!isSandboxActive) {
                setSelectedCompany(company);
                setAssessmentScore(null);
              }
            }}
            disabled={isSandboxActive}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedCompany === company
                ? 'bg-gradient-to-r from-violet-600/35 to-cyan-500/20 text-white border-violet-500/40 text-glow-cyan'
                : 'bg-white/[0.01] hover:bg-white/[0.03] border-transparent text-gray-500 disabled:opacity-30'
            }`}
          >
            {company}
          </button>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Topic list and High frequency questions */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-violet relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 tracking-wide uppercase flex items-center gap-2">
              <Target size={18} className="text-violet-400" />
              {selectedCompany} TOPIC AND CODING MATRIX
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-3">Target Skill Competencies</h4>
                <div className="flex flex-wrap gap-2">
                  {activeData.topics.map((topic, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-cyan-300 font-mono"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Assessment Profile</h4>
                <p className="text-sm font-semibold text-white">{activeData.difficulty}</p>
                <span className="text-[10px] text-cyan-400 font-mono mt-1 block">FOCUS AREAS: SYSTEM STABILITY & EDGE CONDITIONS</span>
              </div>
            </div>

            {/* List of High-Frequency Questions */}
            <div className="border-t border-white/5 pt-6">
              <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-4">Core Question Matrix</h4>
              <div className="space-y-3">
                {activeData.questions.map((q) => (
                  <a
                    key={q.id}
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-sm font-semibold text-white">{q.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        q.difficulty === 'Hard' ? 'text-red-400 bg-red-950/20' : q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-950/20' : 'text-emerald-400 bg-emerald-950/20'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">Solve External &rarr;</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Timed Sandbox Assessment */}
        <div>
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-cyan relative overflow-hidden h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Clock size={18} className="text-cyan-400" />
                  TIMED ASSESSMENT
                </h3>
                {isSandboxActive && (
                  <span className="font-mono text-xs text-rose-400 text-glow-cyan bg-rose-950/20 border border-rose-500/20 px-2 py-0.5 rounded animate-pulse">
                    {formatSandboxTime(sandboxTimeLeft)}
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!isSandboxActive && !assessmentScore ? (
                  <motion.div 
                    key="start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Begin a simulated 15-minute Google-style coding assessment. Write pseudo-code, structure classes, and outline time limits. Complete the behavioral verification grid to grade your performance.
                    </p>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3 text-xs text-amber-300 font-mono">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>Warning: Starting the assessment lock-picks this panel. Options cannot be changed.</span>
                    </div>
                    <button
                      onClick={startSandbox}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-cyan-500/10 active:scale-[0.98] transition-all"
                    >
                      <Play size={14} /> Start Simulated Sandbox
                    </button>
                  </motion.div>
                ) : isSandboxActive ? (
                  <motion.div 
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 flex-1 flex flex-col"
                  >
                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl max-h-48 overflow-y-auto">
                      <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Sandbox Scenario Prompt</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">{activeData.sandboxPrompt}</p>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Pseudo-code / Solution Draft</label>
                      <textarea
                        rows={6}
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        placeholder="class Solution:&#10;  def suggestProducts(self, products, searchWord):&#10;    # Write implementation here..."
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-mono resize-none leading-relaxed"
                      />
                    </div>

                    {/* Behavioral Grid Checkboxes */}
                    <div>
                      <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Self-Assessment Grid</h4>
                      <div className="space-y-2">
                        {[
                          { key: 'clarified', label: 'Asked clarifying questions/edge conditions' },
                          { key: 'bruteForce', label: 'Stated Brute Force approach first' },
                          { key: 'optimized', label: 'Designed optimized dynamic algorithm' },
                          { key: 'complexities', label: 'Stated Time & Space complexities' },
                          { key: 'dryRun', label: 'Dry ran variables step-by-step' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.01] border border-white/5 rounded-lg text-[10px] text-gray-400 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={checklist[item.key]}
                              onChange={(e) => setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                              className="accent-cyan-400 w-3 h-3 rounded"
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={evaluateSandbox}
                      className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg box-glow-violet active:scale-[0.98] transition-all mt-4"
                    >
                      Submit Sandbox Assessment
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                      <ShieldCheck size={36} />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Assessment Complete</h4>
                      <p className="text-xs text-gray-500">Graded based on self-evaluation guidelines</p>
                    </div>

                    <div className="py-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <span className="text-5xl font-extrabold text-glow-cyan text-emerald-400 font-mono">{assessmentScore}%</span>
                    </div>

                    <div className="text-left space-y-2 max-h-36 overflow-y-auto p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[11px] text-gray-400 font-mono leading-relaxed">
                      <span className="text-gray-500 font-bold uppercase">[SUBMITTED DRAFT]:</span>
                      <pre className="mt-1 font-mono text-[10px] text-gray-300 whitespace-pre-wrap">{answerInput || 'No solution pseudo-code drafted.'}</pre>
                    </div>

                    <button
                      onClick={startSandbox}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-gray-300 font-bold text-xs rounded-xl transition-all"
                    >
                      <RefreshCw size={12} /> Retry Challenge
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-[9px] text-gray-500 text-center font-mono mt-6">ALIGNED WITH INTERVIEW PROCESS METRICS</p>
          </div>
        </div>

      </div>
    </div>
  );
}
