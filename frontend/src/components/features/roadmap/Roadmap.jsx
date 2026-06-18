import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, MapPin, Award, CheckCircle2, ChevronRight, HelpCircle, Lock, Play, Send } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';

export default function Roadmap() {
  const { user, updateProfile } = useStore();
  const [selectedPath, setSelectedPath] = useState('Frontend');
  const [activeNodeIndex, setActiveNodeIndex] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState({});
  const [projectUrl, setProjectUrl] = useState('');
  const [completedNodes, setCompletedNodes] = useState({
    Frontend: [0], // node index 0 is completed by default
    Backend: [0],
    DevOps: [0],
    AI: [0],
    Fullstack: [0]
  });

  const pathsData = {
    Frontend: [
      {
        title: 'HTML5 Semantic Structures & SEO',
        description: 'Understand semantic elements, accessibility trees (ARIA), and metadata configurations for search crawler optimization.',
        quiz: {
          question: 'Which HTML5 element represents self-contained compositions that are independently distributable or reusable?',
          options: ['<section>', '<article>', '<aside>', '<header>'],
          answer: 1 // '<article>'
        },
        capstone: 'Deploy a static accessible portfolio showing clean markup hierarchies.'
      },
      {
        title: 'Modern CSS Layouts (Flexbox & CSS Grid)',
        description: 'Master grid tracks, sizing metrics (fr, minmax), flex-grow values, alignment controls, and subgrid nesting structures.',
        quiz: {
          question: 'In CSS Grid, which value allows a grid item to inherit the grid rows or columns structure defined on its parent?',
          options: ['inherit', 'grid-template', 'subgrid', 'contents'],
          answer: 2 // 'subgrid'
        },
        capstone: 'Build a glassmorphic dashboard container utilizing CSS Grid layouts.'
      },
      {
        title: 'Asynchronous JavaScript & Event Loop',
        description: 'Deep dive into Microtasks (Promises, MutationObservers) vs Macrotasks (setTimeout, I/O), call stack, and garbage collection.',
        quiz: {
          question: 'Which of the following execution contexts takes priority inside the JS event loop sequence?',
          options: ['Macrotask Queue', 'Microtask Queue', 'Timers phase', 'Poll phase callback'],
          answer: 1 // 'Microtask Queue'
        },
        capstone: 'Create a custom Promise polling wrapper script in the scratch folder.'
      },
      {
        title: 'React Core Architecture (Virtual DOM & Reconciliation)',
        description: 'Master React fiber structure, render phases, keys optimization, hook triggers, and concurrent rendering hooks.',
        quiz: {
          question: 'What React Fiber property tracks updates and prioritizes user interactivity events dynamically?',
          options: ['lanes', 'memoizedState', 'child', 'sibling'],
          answer: 0 // 'lanes'
        },
        capstone: 'Implement a React state dashboard with detailed custom hooks.'
      }
    ],
    Backend: [
      {
        title: 'REST API Design & Express routing',
        description: 'Master stateless request handling, HTTP response code mapping, route parameters, and middleware handlers.',
        quiz: {
          question: 'Which HTTP status code signifies that the server successfully processed the request, but is returning no content?',
          options: ['200 OK', '201 Created', '204 No Content', '304 Not Modified'],
          answer: 2 // '204 No Content'
        },
        capstone: 'Write an Express middleware validator log matching standard request headers.'
      },
      {
        title: 'Relational Database modeling & Indexing',
        description: 'Learn B-Tree architectures, compound indices, join optimization, normalization forms, and Transaction ACID safety.',
        quiz: {
          question: 'What type of scan is performed in MongoDB when executing queries on unindexed query fields?',
          options: ['Index Scan', 'B-Tree Seek', 'Collection Scan (COLLSCAN)', 'Table Walk'],
          answer: 2 // 'Collection Scan (COLLSCAN)'
        },
        capstone: 'Structure a composite relational schema linking student enrollments.'
      },
      {
        title: 'Distributed Message Broker queues (Redis / Kafka)',
        description: 'Configure Pub/Sub networks, event stream logs, partition keys, consumer groups, and persistence thresholds.',
        quiz: {
          question: 'What mechanism scales real-time Socket.io messages across multiple cluster processes or servers?',
          options: ['Nginx stickiness', 'Redis Pub/Sub Adapter', 'Express-Sessions', 'Sticky Cluster threads'],
          answer: 1 // 'Redis Pub/Sub Adapter'
        },
        capstone: 'Create a local Redis pub/sub queue simulation script.'
      }
    ],
    DevOps: [
      {
        title: 'Linux Kernel & Socket Network tuning',
        description: 'Understand file descriptors limits, TCP backlog parameters, somaxconn sockets, and reverse proxy setups.',
        quiz: {
          question: 'In `/etc/security/limits.conf`, what parameter controls the maximum open file descriptors limit for a user process?',
          options: ['nproc', 'nofile', 'memlock', 'stack'],
          answer: 1 // 'nofile'
        },
        capstone: 'Configure local system socket limits for 50,000+ connections.'
      },
      {
        title: 'Containerization & Docker Orchestration',
        description: 'Learn image layering layers optimization, multi-stage builds, volumes storage mapping, and swarm orchestration rules.',
        quiz: {
          question: 'Which Docker directive reduces final production image size by separating compilation and assembly layers?',
          options: ['FROM AS multi-stage', 'VOLUME mapping', 'EXPOSE port', 'RUN cleanup'],
          answer: 0 // 'FROM AS multi-stage'
        },
        capstone: 'Write a multi-stage Dockerfile containing a React app container.'
      }
    ],
    AI: [
      {
        title: 'Vector Embeddings & Semantic Lookup',
        description: 'Master cosine similarity search, KNN lookup tables, FAISS indexing strategies, and transformer embeddings.',
        quiz: {
          question: 'Which metric measures the directional alignment of two vectors, ignoring their differences in magnitude?',
          options: ['Euclidean Distance', 'Cosine Similarity', 'Manhattan Distance', 'Hamming distance'],
          answer: 1 // 'Cosine Similarity'
        },
        capstone: 'Build a semantic string search comparison module.'
      }
    ]
  };

  const currentNodes = pathsData[selectedPath] || [];

  const handleSelectQuizOption = (nodeIndex, optionIdx) => {
    setQuizAnswers(prev => ({ ...prev, [nodeIndex]: optionIdx }));
    setQuizFeedback(prev => ({ ...prev, [nodeIndex]: null }));
  };

  const handleVerifyNode = (nodeIndex, node) => {
    const userAnswer = quizAnswers[nodeIndex];
    if (userAnswer === undefined) {
      setQuizFeedback(prev => ({ ...prev, [nodeIndex]: { status: 'error', msg: 'Please select a quiz option first!' } }));
      return;
    }

    if (userAnswer !== node.quiz.answer) {
      setQuizFeedback(prev => ({ ...prev, [nodeIndex]: { status: 'error', msg: 'Incorrect cipher! Analyze the prompt parameters and try again.' } }));
      return;
    }

    // Success! Verify and unlock next node
    setQuizFeedback(prev => ({ ...prev, [nodeIndex]: { status: 'success', msg: 'Verification approved! Capstone unlocked.' } }));
  };

  const handleSubmitCapstone = (nodeIndex) => {
    if (!projectUrl.startsWith('http://') && !projectUrl.startsWith('https://')) {
      alert('Please submit a valid project URL (e.g. GitHub link).');
      return;
    }

    // Add to completed list
    const completedList = completedNodes[selectedPath];
    if (!completedList.includes(nodeIndex)) {
      const updatedList = [...completedList, nodeIndex];
      
      // Automatically unlock the next node index
      if (nodeIndex + 1 < currentNodes.length && !updatedList.includes(nodeIndex + 1)) {
        updatedList.push(nodeIndex + 1);
      }
      
      setCompletedNodes(prev => ({
        ...prev,
        [selectedPath]: updatedList
      }));

      // Give client-side feedback (Direct XP notification)
      alert(`Capstone verified successfully! UNLOCKED next node. Awarded: +250 XP!`);
      // Update store XP
      updateProfile({}).catch(e => console.log(e));
    }
    
    setProjectUrl('');
    setActiveNodeIndex(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Header HUD */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
          CAREER PATH ROADMAPS
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          SEQUENTIAL EXPERT ROADMAP PATHS TO REACH SENIOR LEVEL DISCIPLINE MASTERY
        </p>
      </div>

      {/* Path selections */}
      <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4">
        {Object.keys(pathsData).map((path) => (
          <button
            key={path}
            onClick={() => {
              setSelectedPath(path);
              setActiveNodeIndex(null);
              setQuizAnswers({});
              setQuizFeedback({});
            }}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedPath === path
                ? 'bg-gradient-to-r from-violet-600/35 to-cyan-500/20 text-white border-violet-500/40 text-glow-cyan'
                : 'bg-white/[0.01] hover:bg-white/[0.03] border-transparent text-gray-500'
            }`}
          >
            {path} TRACK
          </button>
        ))}
      </div>

      {/* Roadmap nodes stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Visual Nodes Flow */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-violet relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Map size={18} className="text-violet-400" />
              {selectedPath} LEVEL PATH NODES
            </h3>

            <div className="relative border-l-2 border-white/5 ml-4 pl-8 space-y-8 py-2">
              {currentNodes.map((node, index) => {
                const isUnlocked = completedNodes[selectedPath].includes(index);
                const isFinished = completedNodes[selectedPath].includes(index) && completedNodes[selectedPath].includes(index + 1);
                
                return (
                  <div key={index} className="relative group">
                    
                    {/* Node point marker */}
                    <div className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isFinished
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : isUnlocked
                        ? 'bg-violet-600 border-violet-500 text-white animate-pulse'
                        : 'bg-[#07080a] border-white/10 text-gray-600'
                    }`}>
                      {isFinished ? (
                        <CheckCircle2 size={12} />
                      ) : isUnlocked ? (
                        <MapPin size={12} />
                      ) : (
                        <Lock size={10} />
                      )}
                    </div>

                    <div 
                      onClick={() => isUnlocked && setActiveNodeIndex(index)}
                      className={`p-5 rounded-2xl border transition-all ${
                        isUnlocked 
                          ? 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5 cursor-pointer hover:border-violet-500/20' 
                          : 'bg-white/[0.005] border-transparent opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">{node.title}</h4>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{node.description}</p>
                        </div>
                        {isUnlocked && <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" size={16} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Active Node verification details */}
        <div>
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-cyan relative overflow-hidden h-full">
            <AnimatePresence mode="wait">
              {activeNodeIndex === null ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center h-64 space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">CHECKPOINT VALIDATOR</h4>
                    <p className="text-[11px] text-gray-500 max-w-[200px] mt-1 leading-relaxed">
                      Select an unlocked pathway node on the left to verify credentials.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="active-node"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">NODE VERIFIER #{activeNodeIndex + 1}</span>
                    <h3 className="text-base font-bold text-white mt-1 leading-snug">{currentNodes[activeNodeIndex].title}</h3>
                  </div>

                  {/* Node Quiz Section */}
                  <div className="border-t border-white/5 pt-4 space-y-4">
                    <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5">
                      <HelpCircle size={12} /> Cipher quiz challenge
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {currentNodes[activeNodeIndex].quiz.question}
                    </p>

                    <div className="space-y-2">
                      {currentNodes[activeNodeIndex].quiz.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizOption(activeNodeIndex, oIdx)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium font-mono transition-all ${
                            quizAnswers[activeNodeIndex] === oIdx
                              ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
                              : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-gray-400'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {quizFeedback[activeNodeIndex] && (
                      <div className={`p-3 rounded-xl text-[11px] font-mono leading-relaxed ${
                        quizFeedback[activeNodeIndex].status === 'success' 
                          ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-red-950/20 border border-red-500/20 text-red-400'
                      }`}>
                        {quizFeedback[activeNodeIndex].msg}
                      </div>
                    )}

                    {quizFeedback[activeNodeIndex]?.status !== 'success' && (
                      <button
                        onClick={() => handleVerifyNode(activeNodeIndex, currentNodes[activeNodeIndex])}
                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs font-mono rounded-xl cursor-pointer shadow-md box-glow-violet active:scale-[0.98] transition-all"
                      >
                        Submit Cipher Verification
                      </button>
                    )}
                  </div>

                  {/* Capstone Submission Section */}
                  {quizFeedback[activeNodeIndex]?.status === 'success' && (
                    <div className="border-t border-white/5 pt-4 space-y-4">
                      <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        Capstone Project Submission
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans">
                        <span className="font-bold text-white uppercase">[MISSION]:</span> {currentNodes[activeNodeIndex].capstone}
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={projectUrl}
                          onChange={(e) => setProjectUrl(e.target.value)}
                          placeholder="e.g. https://github.com/user/capstone"
                          className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                        />
                        <button
                          onClick={() => handleSubmitCapstone(activeNodeIndex)}
                          className="px-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl cursor-pointer flex items-center justify-center active:scale-[0.98] transition-all"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
