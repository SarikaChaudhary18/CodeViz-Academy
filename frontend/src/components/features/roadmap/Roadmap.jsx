import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  Map, MapPin, Award, CheckCircle2, ChevronRight, HelpCircle,
  Lock, Send, Loader2, RefreshCw, Zap, BookOpen, ExternalLink,
  Play, Youtube, Sparkles, BookOpenCheck, Check, AlertCircle, Trophy, AwardIcon
} from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { api } from '../../../lib/api';

const PDF_ROADMAP_IDS = ['frontend', 'backend', 'full-stack', 'api-design', 'software-architect'];

const TRACK_COLORS = {
  frontend:            { from: 'from-cyan-500', to: 'to-blue-600', text: 'text-cyan-400', border: 'border-cyan-500/20', shadow: 'shadow-cyan-500/20', rgb: '6, 182, 212' },
  backend:             { from: 'from-emerald-500', to: 'to-teal-600', text: 'text-emerald-400', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/20', rgb: '16, 185, 129' },
  'full-stack':        { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-400', border: 'border-violet-500/20', shadow: 'shadow-violet-500/20', rgb: '139, 92, 246' },
  'api-design':        { from: 'from-amber-500', to: 'to-orange-600', text: 'text-amber-400', border: 'border-amber-500/20', shadow: 'shadow-amber-500/20', rgb: '245, 158, 11' },
  'software-architect': { from: 'from-rose-500', to: 'to-red-600', text: 'text-rose-400', border: 'border-rose-500/20', shadow: 'shadow-rose-500/20', rgb: '244, 63, 94' }
};

const DEFAULT_COLOR = { from: 'from-cyan-500', to: 'to-blue-600', text: 'text-cyan-400', border: 'border-cyan-500/20', shadow: 'shadow-cyan-500/20', rgb: '6, 182, 212' };

function getColor(roadmapId) {
  return TRACK_COLORS[roadmapId] || DEFAULT_COLOR;
}

const YOUTUBE_RECOMMENDATIONS = [
  {
    category: "Frontend & Full Stack",
    playlists: [
      {
        title: "Sigma Web Development Course - HTML, CSS, JS & Node",
        channel: "CodeWithHarry",
        url: "https://www.youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w",
        thumbnail: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=60",
        tag: "Web Dev"
      },
      {
        title: "Modern JavaScript & Web Development Essentials",
        channel: "Sheryians Coding School",
        url: "https://www.youtube.com/playlist?list=PLbtI3_MArDOk_A-GnYHPOiHSxlK2Vd3Zn",
        thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=60",
        tag: "JavaScript"
      }
    ]
  },
  {
    category: "Data Structures & Algorithms (DSA)",
    playlists: [
      {
        title: "Striver's DSA A-to-Z Placement Playlist",
        channel: "take U forward",
        url: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz",
        thumbnail: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=600&auto=format&fit=crop&q=60",
        tag: "DSA"
      },
      {
        title: "Supreme DSA Placement Boot Camp",
        channel: "CodeHelp - Babbar",
        url: "https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA",
        thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=60",
        tag: "DSA"
      }
    ]
  },
  {
    category: "Backend & Systems Development",
    playlists: [
      {
        title: "Backend Web Development with Node.js & JavaScript",
        channel: "Chai aur Code",
        url: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60",
        tag: "Backend"
      }
    ]
  }
];

export default function Roadmap() {
  const {
    roadmaps, roadmapsLoading, fetchRoadmaps,
    activeRoadmap, activeRoadmapLoading, fetchRoadmapDetails,
    roadmapProgress, fetchRoadmapProgress, submitRoadmapCapstone
  } = useStore();

  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [activeNodeIndex, setActiveNodeIndex] = useState(null);
  
  // Capstone submission states
  const [projectUrl, setProjectUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capstoneError, setCapstoneError] = useState('');
  const [capstoneSuccess, setCapstoneSuccess] = useState(false);

  // 50-Question Quiz States
  const [nodeQuizzes, setNodeQuizzes] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizStatus, setQuizStatus] = useState(null); // 'correct' | 'incorrect' | null

  // YouTube Live Scraper cache state
  const [liveYoutubeData, setLiveYoutubeData] = useState({});
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  const containerRef = useRef(null);

  // Load roadmap list on mount
  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  // Fetch Live YouTube Playlist oEmbed data
  useEffect(() => {
    const fetchYoutubeMetadata = async () => {
      setYoutubeLoading(true);
      try {
        const urls = YOUTUBE_RECOMMENDATIONS.flatMap(category => category.playlists.map(p => p.url));
        const fetchedData = {};
        
        await Promise.all(
          urls.map(async (url) => {
            try {
              const res = await api.get(`/roadmaps/playlist-metadata?url=${encodeURIComponent(url)}`);
              if (res.status === 'success') {
                fetchedData[url] = {
                  title: res.data.title,
                  channel: res.data.author_name,
                  thumbnail: res.data.thumbnail_url
                };
              }
            } catch (err) {
              console.warn(`Failed to retrieve oEmbed for ${url}:`, err.message);
            }
          })
        );
        
        setLiveYoutubeData(fetchedData);
      } catch (err) {
        console.error('Error fetching youtube details:', err);
      } finally {
        setYoutubeLoading(false);
      }
    };
    fetchYoutubeMetadata();
  }, []);

  // Filter roadmaps list in frontend
  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(rm => PDF_ROADMAP_IDS.includes(rm.roadmapId));
  }, [roadmaps]);

  // Auto-select first roadmap
  useEffect(() => {
    if (filteredRoadmaps.length > 0 && !selectedRoadmapId) {
      setSelectedRoadmapId(filteredRoadmaps[0].roadmapId);
    }
  }, [filteredRoadmaps, selectedRoadmapId]);

  // Load details whenever selected roadmap changes
  useEffect(() => {
    if (!selectedRoadmapId) return;
    fetchRoadmapDetails(selectedRoadmapId);
    fetchRoadmapProgress(selectedRoadmapId);
    setActiveNodeIndex(null);
    setSelectedOption(null);
    setQuizStatus(null);
    setProjectUrl('');
    setCapstoneError('');
    setCapstoneSuccess(false);
    setQuizStarted(false);
    setQuizFinished(false);
    setNodeQuizzes([]);
  }, [selectedRoadmapId, fetchRoadmapDetails, fetchRoadmapProgress]);

  const currentNodes = activeRoadmap?.nodes || [];
  const color = getColor(selectedRoadmapId);

  // Parse completed nodes array robustly
  const completedNodesList = useMemo(() => {
    if (!roadmapProgress) return [];
    if (Array.isArray(roadmapProgress)) {
      return roadmapProgress[0]?.completedNodes || [];
    }
    return roadmapProgress.completedNodes || [];
  }, [roadmapProgress]);

  // GSAP Entrance animation for skill tree nodes
  useEffect(() => {
    if (currentNodes.length > 0 && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.skill-tree-node'),
        { scale: 0.3, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'back.out(1.2)' }
      );
    }
  }, [selectedRoadmapId, currentNodes]);

  // Node position mapping (dynamic based on grid spacing inside a viewBox of 1000x1000)
  const getNodeCoordinates = (index, total) => {
    if (total <= 1) return { left: '50%', top: '50%', x: 500, y: 500 };
    const y = (index / (total - 1)) * 720 + 140;
    
    let x = 500;
    if (index % 4 === 1) x = 780;
    else if (index % 4 === 3) x = 220;
    
    return {
      left: `${(x / 1000) * 100}%`,
      top: `${(y / 1000) * 100}%`,
      x,
      y
    };
  };

  // Generate background SVG connector path
  const svgConnectorPath = useMemo(() => {
    const total = currentNodes.length;
    if (total <= 1) return '';
    let d = '';
    for (let i = 0; i < total; i++) {
      const current = getNodeCoordinates(i, total);
      if (i === 0) {
        d += `M ${current.x} ${current.y}`;
      } else {
        const prev = getNodeCoordinates(i - 1, total);
        const cp1x = prev.x;
        const cp1y = prev.y + (current.y - prev.y) * 0.55;
        const cp2x = current.x;
        const cp2y = prev.y + (current.y - prev.y) * 0.45;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
      }
    }
    return d;
  }, [currentNodes]);

  // Start 50 MCQ Quiz challenge session
  const startQuizChallenge = async (roadmapId, nodeIndex) => {
    setLoadingQuiz(true);
    setQuizStarted(true);
    setQuizFinished(false);
    setCurrentQuestionIdx(0);
    setQuizScore(0);
    setSelectedOption(null);
    setQuizStatus(null);
    try {
      const res = await api.get(`/roadmaps/${roadmapId}/node/${nodeIndex}/quiz`);
      if (res.status === 'success') {
        setNodeQuizzes(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Quiz submission handler
  const handleQuizSubmit = (correctAnswerIdx) => {
    if (selectedOption === null) return;
    if (selectedOption === correctAnswerIdx) {
      setQuizStatus('correct');
      setQuizScore(prev => prev + 1);
    } else {
      setQuizStatus('incorrect');
    }
  };

  // Advance to next MCQ question or finish
  const advanceQuestion = () => {
    if (currentQuestionIdx + 1 < nodeQuizzes.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setQuizStatus(null);
    } else {
      setQuizFinished(true);
    }
  };

  // Capstone submission handler
  const handleCapstoneSubmit = async (e, nodeIdx) => {
    e.preventDefault();
    if (!projectUrl.trim()) {
      setCapstoneError('Project link is required.');
      return;
    }
    if (!projectUrl.startsWith('http://') && !projectUrl.startsWith('https://')) {
      setCapstoneError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsSubmitting(true);
    setCapstoneError('');
    try {
      await submitRoadmapCapstone(selectedRoadmapId, nodeIdx, projectUrl.trim());
      setCapstoneSuccess(true);
      setProjectUrl('');
      fetchRoadmapProgress(selectedRoadmapId);
    } catch (err) {
      setCapstoneError(err.message || 'Submission failed. Please check your URL and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeNode = activeNodeIndex !== null ? currentNodes[activeNodeIndex] : null;
  const isActiveNodeCompleted = activeNodeIndex !== null && completedNodesList.includes(activeNodeIndex);
  const isActiveNodeUnlocked = activeNodeIndex !== null && (activeNodeIndex === 0 || completedNodesList.includes(activeNodeIndex - 1) || isActiveNodeCompleted);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-wide font-sans">
          STUDYQUEST ROADMAP TREE
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          2D SKILL TREE PATHWAYS WITH INTERACTIVE 50-QUESTION QUIZZES & CAPSTONES
        </p>
      </div>

      {/* Track tabs */}
      <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4">
        {roadmapsLoading ? (
          <div className="flex items-center gap-2 text-gray-500 text-xs font-mono animate-pulse">
            <Loader2 size={13} className="animate-spin" /> Loading roadmaps...
          </div>
        ) : filteredRoadmaps.map((rm) => {
          const c = getColor(rm.roadmapId);
          return (
            <button
              key={rm.roadmapId}
              onClick={() => setSelectedRoadmapId(rm.roadmapId)}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedRoadmapId === rm.roadmapId
                  ? `bg-gradient-to-r ${c.from}/20 ${c.to}/10 text-white ${c.border}`
                  : 'bg-white/[0.01] hover:bg-white/[0.03] border-transparent text-gray-500'
              }`}
            >
              {rm.title}
            </button>
          );
        })}
      </div>

      {/* 2D Grid Skill Tree View & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: 2D Skill Tree Diagram */}
        <div className="lg:col-span-2 relative min-h-[550px] sm:min-h-[700px] bg-zinc-950/40 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center p-4">
          {activeRoadmapLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs font-mono py-24 animate-pulse">
              <Loader2 size={16} className="animate-spin text-cyan-400" />
              Compiling path connections & rendering nodes...
            </div>
          ) : (
            <div ref={containerRef} className="w-full max-w-xl aspect-[4/5] relative">
              
              {/* SVG Connector Path with glowing filters */}
              {svgConnectorPath && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" fill="none">
                  <defs>
                    <linearGradient id={`line-grad-${selectedRoadmapId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={`rgba(${color.rgb}, 0.2)`} />
                      <stop offset="50%" stopColor={`rgba(${color.rgb}, 1)`} />
                      <stop offset="100%" stopColor={`rgba(${color.rgb}, 0.2)`} />
                    </linearGradient>
                    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Glowing shadow path */}
                  <motion.path
                    d={svgConnectorPath}
                    stroke={`rgba(${color.rgb}, 0.25)`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    filter="url(#neon-glow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />

                  {/* Sharp core path */}
                  <motion.path
                    d={svgConnectorPath}
                    stroke={`url(#line-grad-${selectedRoadmapId})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                </svg>
              )}

              {/* Interactive Nodes */}
              {currentNodes.map((node, index) => {
                const coords = getNodeCoordinates(index, currentNodes.length);
                const isCompleted = completedNodesList.includes(index);
                const isUnlocked = index === 0 || completedNodesList.includes(index - 1) || isCompleted;
                const isActive = activeNodeIndex === index;

                return (
                  <button
                    key={`${selectedRoadmapId}-node-${index}`}
                    style={{ left: coords.left, top: coords.top }}
                    onClick={() => {
                      setActiveNodeIndex(index);
                      setSelectedOption(null);
                      setQuizStatus(null);
                      setProjectUrl('');
                      setCapstoneError('');
                      setCapstoneSuccess(false);
                      setQuizStarted(false);
                      setQuizFinished(false);
                      setNodeQuizzes([]);
                    }}
                    className={`skill-tree-node absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-300 z-10 cursor-pointer ${
                      isActive 
                        ? `ring-4 ring-offset-4 ring-offset-zinc-950 ring-${color.from.replace('from-', '')}` 
                        : 'hover:scale-110'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all shadow-lg ${
                      isCompleted
                        ? `bg-gradient-to-br ${color.from} ${color.to} border-transparent text-zinc-950 shadow-[0_0_15px_rgba(${color.rgb},0.4)]`
                        : isUnlocked
                          ? 'bg-zinc-900 border-zinc-500 text-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 size={24} className="stroke-[2.5]" />
                      ) : !isUnlocked ? (
                        <Lock size={18} />
                      ) : (
                        <span className="text-sm font-mono font-black">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Tooltip Label */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-white/5 backdrop-blur-md px-2.5 py-1 rounded-md pointer-events-none min-w-[120px] text-center shadow-lg transition-opacity duration-300 opacity-60 hover:opacity-100">
                      <p className="text-[9px] font-bold text-white tracking-wide uppercase line-clamp-1">
                        {node.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Skill Tree Node Details / Interactive Quizzes & Capstones */}
        <div className="lg:col-span-1 glassmorphism rounded-3xl border-white/5 p-6 flex flex-col min-h-[450px]">
          
          <AnimatePresence mode="wait">
            {activeNode === null ? (
              <motion.div
                key="empty-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-500">
                  <MapPin size={28} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">SELECT A MILESTONE</h4>
                  <p className="text-xs text-zinc-500 max-w-[220px] mx-auto mt-2 leading-relaxed">
                    Click any node on the skill tree map to reveal dynamic concepts, 50-question quizzes, and project capstones.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`node-details-${activeNodeIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  {/* Title Bar */}
                  <div className="border-b border-white/5 pb-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-mono uppercase tracking-widest ${color.text}`}>
                        MILESTONE STAGE 0{activeNodeIndex + 1}
                      </span>
                      {isActiveNodeCompleted && (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                          Verified <Check size={10} />
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide mt-1">
                      {activeNode.title}
                    </h3>
                  </div>

                  {/* Node Concept Text */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Description</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {activeNode.description}
                    </p>
                  </div>

                  {/* MCQ Quiz Section */}
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      <HelpCircle size={12} className={color.text} />
                      Milestone Concept Quiz
                    </div>

                    {!quizStarted ? (
                      <div className="bg-zinc-950/20 border border-white/5 p-4 rounded-2xl text-center space-y-3">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Test your depth with 50 challenging conceptual multiple-choice questions dynamically generated for this milestone.
                        </p>
                        <button
                          onClick={() => startQuizChallenge(selectedRoadmapId, activeNodeIndex)}
                          className="px-4 py-2 bg-zinc-900 border border-white/10 hover:border-cyan-500/30 text-white rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all"
                        >
                          Start 50-MCQ Challenge
                        </button>
                      </div>
                    ) : loadingQuiz ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-2">
                        <Loader2 size={24} className="animate-spin text-cyan-400" />
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider animate-pulse">
                          Generating 50 MCQs via LLM (First launch takes 10s)...
                        </p>
                      </div>
                    ) : quizFinished ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center space-y-3">
                        <Trophy className="mx-auto text-amber-500" size={32} />
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">CHALLENGE COMPLETE</h4>
                          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{quizScore} / {nodeQuizzes.length}</p>
                          <p className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5">Correct Answers</p>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                          <p className="text-[10px] font-mono text-emerald-400 uppercase font-black">
                            ✦ Earned +{quizScore * 2} XP!
                          </p>
                        </div>
                        <button
                          onClick={() => startQuizChallenge(selectedRoadmapId, activeNodeIndex)}
                          className="px-4 py-2 bg-zinc-950/60 border border-white/5 hover:border-emerald-500/20 text-zinc-300 rounded-xl text-[9px] font-mono uppercase tracking-widest transition-all"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* HUD / Progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase">
                            <span>Question {currentQuestionIdx + 1} of {nodeQuizzes.length}</span>
                            <span>Score: {quizScore}</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 transition-all duration-300"
                              style={{ width: `${((currentQuestionIdx + 1) / nodeQuizzes.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Question */}
                        {nodeQuizzes[currentQuestionIdx] && (
                          <div className="space-y-3">
                            <p className="text-xs text-zinc-200 leading-relaxed font-semibold">
                              {nodeQuizzes[currentQuestionIdx].question}
                            </p>

                            <div className="space-y-2">
                              {nodeQuizzes[currentQuestionIdx].options.map((option, idx) => (
                                <button
                                  key={idx}
                                  disabled={quizStatus !== null}
                                  onClick={() => {
                                    setSelectedOption(idx);
                                    setQuizStatus(null);
                                  }}
                                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex justify-between items-center ${
                                    selectedOption === idx
                                      ? quizStatus === 'correct'
                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                        : quizStatus === 'incorrect'
                                          ? 'bg-red-500/10 border-red-500/40 text-red-400'
                                          : `bg-${color.from.replace('from-', '')}/10 border-${color.from.replace('from-', '')}/40 text-white`
                                      : 'bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/[0.03]'
                                  }`}
                                >
                                  <span>{option}</span>
                                  {selectedOption === idx && (
                                    quizStatus === 'correct' ? (
                                      <Check size={12} className="text-emerald-400" />
                                    ) : quizStatus === 'incorrect' ? (
                                      <AlertCircle size={12} className="text-red-400" />
                                    ) : null
                                  )}
                                </button>
                              ))}
                            </div>

                            {quizStatus !== null && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-xl border text-[11px] leading-relaxed font-sans ${
                                  quizStatus === 'correct'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}
                              >
                                <div className="font-bold uppercase tracking-wider mb-1 font-mono text-[9px] flex items-center gap-1">
                                  {quizStatus === 'correct' ? <Check size={10} /> : <AlertCircle size={10} />}
                                  {quizStatus === 'correct' ? 'Correct Option Explanation' : 'Explanation (Correct Answer Highlight)'}
                                </div>
                                <p className="text-zinc-300">
                                  {quizStatus !== 'correct' && (
                                    <span className="block text-zinc-400 font-bold mb-1 font-mono uppercase text-[8px]">
                                      Correct Option: {nodeQuizzes[currentQuestionIdx].options[nodeQuizzes[currentQuestionIdx].answer]}
                                    </span>
                                  )}
                                  {nodeQuizzes[currentQuestionIdx].explanation || 'No detailed explanation is available.'}
                                </p>
                              </motion.div>
                            )}

                            {quizStatus === null ? (
                              <button
                                onClick={() => handleQuizSubmit(nodeQuizzes[currentQuestionIdx].answer)}
                                disabled={selectedOption === null}
                                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all disabled:opacity-50"
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <button
                                onClick={advanceQuestion}
                                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-cyan-500/30 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                              >
                                Next Question <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Capstone Project Section */}
                  {activeNode.capstone && (
                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        <Award size={12} className="text-amber-500" />
                        Hands-on Capstone Mission
                      </div>
                      
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans bg-zinc-950/20 p-3 rounded-xl border border-white/5">
                        {activeNode.capstone}
                      </p>

                      {isActiveNodeCompleted ? (
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest">Capstone Verified</p>
                            <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate max-w-[200px]">XP Awarded (+250 XP)</p>
                          </div>
                        </div>
                      ) : isActiveNodeUnlocked ? (
                        <form onSubmit={(e) => handleCapstoneSubmit(e, activeNodeIndex)} className="space-y-3">
                          <div>
                            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                              Deployment or Git Repository URL
                            </label>
                            <input
                              type="text"
                              value={projectUrl}
                              onChange={(e) => setProjectUrl(e.target.value)}
                              placeholder="https://github.com/..."
                              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-950/40 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          {capstoneError && (
                            <p className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                              <AlertCircle size={10} /> {capstoneError}
                            </p>
                          )}

                          {capstoneSuccess && (
                            <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                              <Check size={10} /> Mission submitted successfully!
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-2.5 bg-gradient-to-r ${color.from} ${color.to} text-zinc-950 font-bold uppercase rounded-xl text-[10px] font-mono tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md`}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 size={12} className="animate-spin" /> Verifying...
                              </>
                            ) : (
                              <>
                                Submit Mission & Unlock Next <Send size={10} />
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 p-3 rounded-xl text-zinc-500">
                          <Lock size={16} />
                          <p className="text-[9px] font-mono uppercase tracking-widest">
                            Complete previous milestone to unlock submission
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* YouTube Recommendations Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Youtube size={20} className="text-red-500" />
            Curated Playlists & Recommendations
          </h3>
          <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">
            Live metadata parsed directly from YouTube recommendations API proxy
          </p>
        </div>

        <div className="space-y-8">
          {YOUTUBE_RECOMMENDATIONS.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest border-l-2 border-cyan-500 pl-2">
                {section.category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.playlists.map((playlist, pIdx) => {
                  const live = liveYoutubeData[playlist.url];
                  const title = live?.title || playlist.title;
                  const channel = live?.channel || playlist.channel;
                  const thumbnail = live?.thumbnail || playlist.thumbnail;

                  return (
                    <motion.a
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      key={pIdx}
                      href={playlist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glassmorphism rounded-2xl overflow-hidden border-white/5 hover:border-cyan-500/20 flex flex-col sm:flex-row transition-all relative group"
                    >
                      {/* Thumbnail container */}
                      <div className="w-full sm:w-40 h-28 relative overflow-hidden bg-zinc-900 shrink-0">
                        {youtubeLoading && !live ? (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700">
                            <Loader2 size={16} className="animate-spin" />
                          </div>
                        ) : (
                          <img 
                            src={thumbnail} 
                            alt={title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                            <Play size={12} className="fill-current ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                          {playlist.tag}
                        </span>
                      </div>

                      {/* Playlist details */}
                      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider truncate block">
                            Channel: {channel}
                          </span>
                          <h5 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wide mt-1.5 line-clamp-2 leading-relaxed">
                            {title}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400 mt-3 uppercase tracking-wider">
                          Play Course Playlist <ExternalLink size={10} />
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
