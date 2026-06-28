import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  ArrowRight,
  Target,
  BookOpen,
  Terminal,
  Users,
  Sparkles,
  Star,
  Check,
  ChevronDown,
  Github,
  Award,
  Shield,
  Search,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';
import { cn } from "../../lib/utils";

// Rotating features for hero subheading
const ROTATING_TOPICS = ["DSA Sheets", "Interactive Roadmaps", "ATS Resume Auditing", "Mock Interviews"];

// Grayscale Company List
const COMPANIES = [
  { name: "Google", logo: "Google" },
  { name: "Microsoft", logo: "Microsoft" },
  { name: "Amazon", logo: "Amazon" },
  { name: "Adobe", logo: "Adobe" },
  { name: "Meta", logo: "Meta" },
  { name: "Netflix", logo: "Netflix" }
];

// FAQS
const FAQS = [
  {
    q: "Is the coding sandbox free to practice?",
    a: "Yes! Our coding sandbox is completely free for practicing standard DSA sheets and basic language scripts. Upgrading to Pro unlocks custom test-case parameters and AI debugger logs."
  },
  {
    q: "How does the AI Resume Auditor scan my resume?",
    a: "Simply upload your resume in PDF format. Our parser extracts the text structures, evaluates them against 10 strict ATS and formatting rules, and gives you actionable feedback with copy-pasteable LaTeX code."
  },
  {
    q: "Can I coordinate mock interviews with peers?",
    a: "Absolutely! You can use our real-time websocket squads to connect with peers, track leaderboard rankings, review progress streams, and prepare for interviews collaboratively."
  },
  {
    q: "How many career roadmaps are available?",
    a: "We offer 5 predefined engineering tracks (Frontend, Backend, DSA, DevOps, Mobile) built directly from verified industry paths. Each track features step-by-step nodes, multiple-choice quizzes, and capstones."
  }
];

export default function Hero() {
  const navigate = useNavigate();
  const [topicIndex, setTopicIndex] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);

  // Stats Counters state
  const [stats, setStats] = useState({ roadmaps: 0, resources: 0, docs: 0, users: 0 });

  useEffect(() => {
    // Subheading rotation loop
    const interval = setInterval(() => {
      setTopicIndex((prev) => (prev + 1) % ROTATING_TOPICS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Stats incremental count animation
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setStats({
        roadmaps: Math.min(58, Math.floor((58 / steps) * step)),
        resources: Math.min(1500, Math.floor((1500 / steps) * step)),
        docs: Math.min(600, Math.floor((600 / steps) * step)),
        users: Math.min(20, Math.floor((20 / steps) * step)) // Representing 20K
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-indigo-600/30 selection:text-indigo-200 overflow-x-hidden relative">
      
      {/* Background Radial Ambient Gradients (Subtle 10% accent opacity max) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[400px] right-[-10%] w-[500px] h-[500px] bg-indigo-600/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1200px] left-[-10%] w-[500px] h-[500px] bg-violet-600/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none z-0" />

      {/* Modern Sticky Glass Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#030712]/75 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logo} alt="CodeViz Academy Logo" className="w-8 h-8 object-contain rounded-lg shadow-md border border-slate-800" />
            <span className="text-sm font-bold tracking-tight text-white font-mono uppercase">
              CodeViz Academy
            </span>
          </div>

          {/* Desktop Nav menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#bento" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Workspace</a>
            <a href="#pricing" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg border border-indigo-500/20 hover:border-indigo-400/40 transition-all cursor-pointer shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="relative z-10 w-full">
        
        {/* HERO SECTION */}
        <header className="max-w-7xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
          
          {/* Subtle Tag Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[11px] font-medium text-slate-400 shadow-inner mb-6"
          >
            <Sparkles size={11} className="text-indigo-400" />
            <span>Redesigned Modern Sandbox Platform</span>
          </motion.div>

          {/* Focal Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-3xl"
          >
            Build Skills. Track Progress. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Get Hired.
            </span>
          </motion.h1>

          {/* Subheading describing rotating core elements */}
          <div className="h-8 flex items-center justify-center mt-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={topicIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="text-sm font-mono tracking-widest text-indigo-400 font-bold uppercase"
              >
                {ROTATING_TOPICS[topicIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Brief Text Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-sm sm:text-base max-w-xl text-slate-400 mt-4 leading-relaxed"
          >
            CodeViz Academy is a unified preparation workspace. Track curriculum progress, test coding algorithms, analyze ATS formatting, and simulate mock interviews in real-time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-row gap-4 flex-wrap justify-center mt-10"
          >
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 font-semibold px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-[0.98] text-sm"
            >
              Start Learning <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-slate-900/80 font-semibold px-8 py-3.5 border border-slate-800 hover:bg-slate-880 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer text-sm"
            >
              Explore Sandbox
            </button>
          </motion.div>

          {/* Premium Product Mockup Dashboard Preview (CSS Coded Mockup) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-5xl mt-16 rounded-2xl border border-slate-800 bg-[#090d16]/80 p-3 shadow-2xl relative overflow-hidden group"
          >
            {/* Header window control dots */}
            <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-905">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono">studyquest.codeviz.academy/dashboard</div>
              <div className="w-8" />
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-12 gap-3 p-3 text-left">
              {/* Left sidebar nav mockup */}
              <div className="col-span-3 hidden md:flex flex-col gap-2.5 border-r border-slate-900 pr-3">
                <div className="h-6 bg-indigo-500/10 rounded border border-indigo-500/20 flex items-center px-2 text-[10px] text-indigo-400 font-mono font-bold">Active Track</div>
                <div className="h-7 bg-slate-900 rounded flex items-center px-2 text-[10px] text-slate-300 font-medium hover:bg-slate-800 cursor-pointer transition-colors">
                  <BookOpen size={10} className="mr-2 text-indigo-400" /> Web Development
                </div>
                <div className="h-7 bg-slate-900/40 rounded flex items-center px-2 text-[10px] text-slate-400 font-medium hover:bg-slate-800 cursor-pointer transition-colors">
                  <Terminal size={10} className="mr-2 text-slate-500" /> Algorithms Practice
                </div>
                <div className="h-7 bg-slate-900/40 rounded flex items-center px-2 text-[10px] text-slate-400 font-medium hover:bg-slate-800 cursor-pointer transition-colors">
                  <Target size={10} className="mr-2 text-slate-500" /> ATS Resume Audit
                </div>
                <div className="h-7 bg-slate-900/40 rounded flex items-center px-2 text-[10px] text-slate-400 font-medium hover:bg-slate-800 cursor-pointer transition-colors">
                  <Users size={10} className="mr-2 text-slate-500" /> Community Squads
                </div>
              </div>

              {/* Center Panel - Dashboard metrics */}
              <div className="col-span-12 md:col-span-9 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0e1322] border border-slate-800/60 p-3.5 rounded-xl">
                    <span className="block text-[9px] text-slate-500 font-mono font-semibold uppercase tracking-wider">Level Rank</span>
                    <span className="text-base font-bold text-white tracking-tight">Level 8 (Specialist)</span>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[70%]" />
                    </div>
                  </div>
                  <div className="bg-[#0e1322] border border-slate-800/60 p-3.5 rounded-xl">
                    <span className="block text-[9px] text-slate-500 font-mono font-semibold uppercase tracking-wider">Streak</span>
                    <span className="text-base font-bold text-orange-400 tracking-tight flex items-center gap-1">
                      🔥 14 Days
                    </span>
                  </div>
                  <div className="bg-[#0e1322] border border-slate-800/60 p-3.5 rounded-xl">
                    <span className="block text-[9px] text-slate-500 font-mono font-semibold uppercase tracking-wider">Quests Solved</span>
                    <span className="text-base font-bold text-green-400 tracking-tight">42 / 60</span>
                  </div>
                </div>

                {/* Simulated Content Block (Timeline nodes + active item detail) */}
                <div className="bg-[#0c101d] border border-slate-850 p-4 rounded-xl space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Current Sprint: Javascript Core</h4>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase font-mono font-semibold">Active Node</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    {/* Visual node line preview */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-[10px] text-indigo-400 font-bold font-mono">1</div>
                      <div className="h-0.5 w-6 bg-indigo-500" />
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-[10px] text-indigo-400 font-bold font-mono">2</div>
                      <div className="h-0.5 w-6 bg-slate-800" />
                      <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold font-mono">3</div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-200">Topic: Closures & Scopes</span>
                        <span className="block text-[8px] text-slate-500">Estimated duration: 25 mins</span>
                      </div>
                      <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-md active:scale-[0.98]">
                        Complete Node
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </header>

        {/* TRUSTED BY COMPANIES */}
        <section className="border-t border-slate-900 bg-[#030712]/50 py-10 w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              Trusted by learners preparing for technical interview pipelines at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-45 hover:opacity-75 transition-opacity">
              {COMPANIES.map((company, index) => (
                <span
                  key={index}
                  className="text-lg md:text-xl font-extrabold tracking-tight text-slate-500 font-sans hover:text-indigo-400 cursor-default transition-colors"
                >
                  {company.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* LEARNING STATISTICS */}
        <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-900">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl backdrop-blur-sm">
              <span className="block text-3xl md:text-4xl font-extrabold text-white tracking-tight">{stats.roadmaps}</span>
              <span className="block text-[10px] text-slate-500 font-mono uppercase mt-2">Active Career Tracks</span>
            </div>
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl backdrop-blur-sm">
              <span className="block text-3xl md:text-4xl font-extrabold text-white tracking-tight">{stats.resources}+</span>
              <span className="block text-[10px] text-slate-500 font-mono uppercase mt-2">Curated Resources</span>
            </div>
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl backdrop-blur-sm">
              <span className="block text-3xl md:text-4xl font-extrabold text-white tracking-tight">{stats.docs}+</span>
              <span className="block text-[10px] text-slate-500 font-mono uppercase mt-2">Documentation Guides</span>
            </div>
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl backdrop-blur-sm">
              <span className="block text-3xl md:text-4xl font-extrabold text-white tracking-tight">{stats.users}K+</span>
              <span className="block text-[10px] text-slate-500 font-mono uppercase mt-2">Active Students</span>
            </div>
          </div>
        </section>

        {/* BENTO FEATURE WORKSPACE PREVIEW */}
        <section id="bento" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase">Visual Preview</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              A Unified Platform. No Clutter.
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Why use five separate applications? Coordinate your code, resume auditing, interactive checklists, and community feeds inside one dashboard.
            </p>
          </div>

          {/* Bento layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Interactive Roadmap Preview */}
            <div className="col-span-1 md:col-span-2 border border-slate-855 bg-[#090d16]/60 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors">
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MODULE 01</span>
                <h3 className="text-lg font-bold text-white tracking-tight">Structured Learning Roadmaps</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                  Follow visual path guidelines configured from top syllabus templates. Complete coding nodes, pass checklists, and evaluate your milestone stats.
                </p>
              </div>

              {/* Node Graph Mockup */}
              <div className="bg-[#04060b] border border-slate-900 p-4 rounded-xl mt-6 flex flex-col items-center sm:flex-row justify-around gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">START</span>
                  <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-xs font-bold font-mono">HTML Basics</div>
                </div>
                <div className="h-0.5 w-6 bg-green-500/40 hidden sm:block" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold">CURRENT</span>
                  <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-500 text-indigo-400 rounded-lg text-xs font-bold font-mono">CSS Grid & Layouts</div>
                </div>
                <div className="h-0.5 w-6 bg-slate-850 hidden sm:block" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">LOCKED</span>
                  <div className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg text-xs font-bold font-mono">JavaScript Scopes</div>
                </div>
              </div>
            </div>

            {/* Box 2: Resume scoring index */}
            <div className="border border-slate-855 bg-[#090d16]/60 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors">
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MODULE 02</span>
                <h3 className="text-lg font-bold text-white tracking-tight">ATS Resume Auditor</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Evaluate formatting density metrics, sections alignment, and get instant recommendations to pass corporate filter gates.
                </p>
              </div>

              {/* Score mockup */}
              <div className="bg-[#04060b] border border-slate-900 p-4 rounded-xl mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-medium">Format Evaluation</span>
                  <span className="text-xs font-mono font-bold text-green-400">91%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[91%]" />
                </div>
                <div className="space-y-1.5 text-[9px] text-slate-500 font-mono">
                  <div className="flex items-center gap-1.5 text-green-400">✓ ATS structure parsed correctly</div>
                  <div className="flex items-center gap-1.5 text-green-400">✓ Decoupled table structures detected</div>
                  <div className="flex items-center gap-1.5 text-amber-500">⚠ Action density is slightly low</div>
                </div>
              </div>
            </div>

            {/* Box 3: Coding Sandbox Mockup */}
            <div className="border border-slate-855 bg-[#090d16]/60 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors">
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MODULE 03</span>
                <h3 className="text-lg font-bold text-white tracking-tight">DSA Code Sandbox</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Write solution algorithms in a robust sandbox. Includes dynamic tests execution, code state persistence, and language runtimes.
                </p>
              </div>

              {/* Editor Mockup */}
              <div className="bg-[#04060b] border border-slate-900 rounded-xl mt-6 overflow-hidden font-mono text-[10px] text-slate-400">
                <div className="bg-slate-905 px-3 py-1.5 border-b border-slate-950 flex items-center justify-between text-slate-500">
                  <span>bubble_sort.js</span>
                  <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">JavaScript</span>
                </div>
                <div className="p-3.5 space-y-1">
                  <p><span className="text-indigo-400">function</span> <span className="text-yellow-400">bubbleSort</span>(arr) &#123;</p>
                  <p className="pl-4">let len = arr.length;</p>
                  <p className="pl-4"><span className="text-indigo-400">for</span> (let i = 0; i &lt; len; i++) &#123;</p>
                  <p className="pl-8 text-slate-500">// optimize loop swaps</p>
                  <p className="pl-4">&#125;</p>
                  <p>&#125;</p>
                </div>
              </div>
            </div>

            {/* Box 4: Communities Leaderboard */}
            <div className="col-span-1 md:col-span-2 border border-slate-855 bg-[#090d16]/60 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors">
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MODULE 04</span>
                <h3 className="text-lg font-bold text-white tracking-tight">Active Peer Leaderboards</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                  Join WebSocket-driven chat groups, compare progress points on live leaderboards, check daily completions, and prepare in dynamic squads.
                </p>
              </div>

              {/* Leaderboard Mockup */}
              <div className="bg-[#04060b] border border-slate-900 p-4 rounded-xl mt-6 space-y-2.5">
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-900 pb-1.5">
                  <span>Rankings</span>
                  <span>Daily XP</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">1</span>
                    <span className="text-slate-200">SarikaChaudhary</span>
                  </div>
                  <span className="text-indigo-400 font-mono font-bold">1,240 XP</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">2</span>
                    <span className="text-slate-200">OperatorStudy</span>
                  </div>
                  <span className="text-indigo-400 font-mono font-bold">980 XP</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE CODEVIZ */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase">Platform Pillars</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              Built for Software Engineers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Target size={18} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 group-hover:text-indigo-400 transition-colors">Targeted DSA Sheets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by target companies standards to build high-demand problem solving metrics without solving duplicate questions.
              </p>
            </div>

            <div className="space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Terminal size={18} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 group-hover:text-indigo-400 transition-colors">Interactive Documentation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review concepts directly alongside code syntax checklists, filterable by track topics, and save links inside your local state parameters.
              </p>
            </div>

            <div className="space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users size={18} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 group-hover:text-indigo-400 transition-colors">Multiverse Peer Groups</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Practice together. Sync status points over WebSockets and track global placement metrics collectively.
              </p>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              Success Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-slate-850 bg-[#090d16]/30 p-8 rounded-2xl space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The structured roadmap tracks kept me highly focused. I tracked HTML/CSS frameworks, practiced compiler scripts in the sandbox, and cracked my placement OA without jumping between platforms."
              </p>
              <div>
                <span className="block text-xs font-bold text-white">Ankit Sharma</span>
                <span className="block text-[9px] text-slate-500 font-mono uppercase">Software Intern, Adobe</span>
              </div>
            </div>

            <div className="border border-slate-850 bg-[#090d16]/30 p-8 rounded-2xl space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "CodeViz's ATS Resume Auditor scanned my LaTeX file structure and identified missing sections immediately. After making the recommended overrides, my response rate from tech applications improved dramatically."
              </p>
              <div>
                <span className="block text-xs font-bold text-white">Riya Patel</span>
                <span className="block text-[9px] text-slate-500 font-mono uppercase">Associate Engineer, Amazon</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING PLANS */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase">Membership Tiers</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              Accelerate Your Career Scaling
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Free Tier */}
            <div className="border border-slate-850 bg-[#090d16]/40 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">FREE SANDBOX</h3>
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="text-4xl font-black">₹99</span>
                    <span className="text-[10px] text-slate-500 font-mono">/ MONTH</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Start tracking algorithms, complete baseline DSA sheets, and explore default roadmaps.
                </p>
                <ul className="space-y-2.5 text-[11px] text-slate-400 pt-6 border-t border-slate-905 font-mono">
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> 905 DSA Practice Problems</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Basic Code Execution</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Community Chat Rooms</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Standard Roadmap Paths</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="w-full mt-8 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                INITIALIZE ACCOUNT
              </button>
            </div>

            {/* Pro Tier (Recommended) */}
            <div className="border-2 border-indigo-600 bg-[#0c1222] p-8 rounded-2xl flex flex-col justify-between hover:border-indigo-500 transition-all shadow-xl shadow-indigo-600/5 relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white font-mono text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                RECOMMENDED
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest">PRO DEVELOPER</h3>
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="text-4xl font-black">₹399</span>
                    <span className="text-[10px] text-slate-500 font-mono">/ MONTH</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Full-stack tool suite for aggressive technical interview preparation and profile validation.
                </p>
                <ul className="space-y-2.5 text-[11px] text-slate-300 pt-6 border-t border-slate-905 font-mono">
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Everything in Free Sandbox</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> AI-Powered Resume Auditor</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> AI-Assisted Mock Interviews</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Custom Input Sandbox Testing</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Priority Hackathon Pipeline</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-indigo-600/10"
              >
                UPGRADE TO PRO
              </button>
            </div>

            {/* Team Tier */}
            <div className="border border-slate-850 bg-[#090d16]/40 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">TEAM STACK</h3>
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="text-4xl font-black">₹699</span>
                    <span className="text-[10px] text-slate-500 font-mono">/ MONTH</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Shared workspace features designed for bootcamp cohorts, hacker groups, and university squads.
                </p>
                <ul className="space-y-2.5 text-[11px] text-slate-400 pt-6 border-t border-slate-905 font-mono">
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Everything in Pro Developer</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Dedicated Shared Squad Rooms</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Batch Performance Analytics</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Custom Interview Pipelines</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-indigo-400" /> Priority Live Support</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="w-full mt-8 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-855 text-white font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                CREATE TEAM SQUAD
              </button>
            </div>

          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section id="faq" className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-900">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase">FAQ</span>
            <h2 className="text-3xl font-black text-white tracking-tight leading-none">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="border border-slate-850 rounded-xl bg-[#090d16]/30 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-slate-400 transition-transform duration-200",
                      activeFaq === index && "transform rotate-180 text-white"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-[11px] text-slate-400 leading-relaxed border-t border-slate-900/40">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* MODERN PROFESSIONAL FOOTER */}
        <footer className="border-t border-slate-900 bg-[#02050c] text-slate-400 py-16 w-full">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-900 pb-12">
            
            {/* Logo and Tagline column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <img src={logo} alt="CodeViz Logo" className="w-7 h-7 object-contain rounded-lg border border-slate-800" />
                <span className="text-xs font-black tracking-wider text-white font-mono uppercase">CodeViz Academy</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm">
                A structured engineering workspace providing step-by-step tracks, sandbox code compilations, ATS auditor scorecards, and live peer networks.
              </p>
            </div>

            {/* Links column 1 */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">Product</span>
              <ul className="space-y-2 text-[11px]">
                <li><a href="#features" className="hover:text-white transition-colors">Platform Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Options</a></li>
                <li><span className="text-slate-600 cursor-not-allowed">Product Roadmap</span></li>
              </ul>
            </div>

            {/* Links column 2 */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">Resources</span>
              <ul className="space-y-2 text-[11px]">
                <li><span onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">Learning Dashboard</span></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Help & FAQ</a></li>
                <li><a href="https://github.com/SarikaChaudhary18/CodeViz-Academy" className="hover:text-white flex items-center gap-1 transition-colors"><Github size={10} /> GitHub Source</a></li>
              </ul>
            </div>

            {/* Links column 3 */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">Legal</span>
              <ul className="space-y-2 text-[11px]">
                <li><span onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">Support Form</span></li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
            <span>© 2026 CodeViz Academy. All rights reserved.</span>
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-850 px-4 py-2 rounded-full cursor-default">
              <span>DESIGNED FOR GENERAL PLACEMENT ACCELERATION</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
