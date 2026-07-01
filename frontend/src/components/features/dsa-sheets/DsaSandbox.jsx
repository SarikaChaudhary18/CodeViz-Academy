import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import fahSound from '../../../assets/fahhhhh.mp3';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import AITutorSidebar from '../../ui/AITutorSidebar';
import {
  ArrowLeft, Play, Send, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, BookOpen,
  Terminal, Lightbulb, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Copy, RotateCcw, Clock, Zap, Code2, FileText,
  Hash, RefreshCw, ExternalLink, Youtube, Brain
} from 'lucide-react';

const LANGUAGES = [
  { key: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { key: 'python', label: 'Python', monaco: 'python' },
  { key: 'cpp', label: 'C++', monaco: 'cpp' },
  { key: 'java', label: 'Java', monaco: 'java' },
];

const DIFFICULTY_COLOR = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  Hard: 'text-red-400    bg-red-400/10    border-red-400/20',
};

const MONACO_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontLigatures: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: 'on',
  renderLineHighlight: 'all',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  padding: { top: 20, bottom: 20 },
  tabSize: 2,
  wordWrap: 'on',
  automaticLayout: true,
};

// ── Lightweight Markdown → HTML renderer ──────────────────────────────────
function renderMarkdown(md = '') {
  // Fenced code blocks ```lang\n...\n```
  let html = md.replace(
    /```(\w*)\n?([\s\S]*?)```/g,
    (_, lang, code) =>
      `<pre class="bg-[#0d1117] border border-white/8 rounded-xl p-4 my-3 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
  );

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-slate-200 mt-5 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-white mt-6 mb-2 pb-1.5 border-b border-white/10">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-white mt-4 mb-2">$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="text-white italic">$1</strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-white/8 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');

  // Bullet lists — convert consecutive lines starting with * or -
  html = html.replace(/(^[\*\-] .+$\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map(line => `<li class="flex gap-2 text-slate-300"><span class="text-violet-400 mt-1 flex-shrink-0">›</span><span>${line.replace(/^[\*\-] /, '')}</span></li>`)
      .join('');
    return `<ul class="space-y-1.5 my-3 pl-1">${items}</ul>`;
  });

  // Numbered lists
  html = html.replace(/(^\d+\. .+$\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map(line => `<li class="text-slate-300 ml-4 list-decimal">${line.replace(/^\d+\. /, '')}</li>`)
      .join('');
    return `<ol class="space-y-1.5 my-3 list-decimal pl-5">${items}</ol>`;
  });

  // Paragraphs — blank-line separated blocks that aren't already HTML
  html = html
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<[hupol]/.test(block) || /^<pre/.test(block)) return block;
      return `<p class="text-slate-300 leading-relaxed mb-3 text-sm">${block.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}

// ── Confetti Celebration Component (Party Popper Effect) ──────────────────
function ConfettiCelebration() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const newPieces = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2.5}s`,
      duration: `${1.8 + Math.random() * 2.5}s`,
      size: `${8 + Math.random() * 8}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: `${Math.random() * 360}deg`
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration} linear ${p.delay} forwards`,
            transform: `rotate(${p.tilt})`,
          }}
        />
      ))}
    </div>
  );
}

// ── Play Celebration Sound ──────────────────────────────────────
const playCelebrationSound = () => {
  try {
    const audio = new Audio(fahSound);
    audio.volume = 0.6;
    audio.play().catch(e => console.log('Audio playback blocked or failed:', e));
  } catch (e) {
    console.log('Audio error:', e);
  }
};

export default function DsaSandbox() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const {
    activeProblem,
    activeProblemLoading,
    fetchProblemDetails,
    runSandboxCode,
    submitSandboxCode,
    sheetProgress,
    fetchSheetProgress,
    dsaProblems,
    fetchDsaProblems,
    user,
    checkAuth,
  } = useStore();

  const [selectedLang, setSelectedLang] = useState('cpp');
  const [showTutor, setShowTutor] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [outputPanel, setOutputPanel] = useState('hidden'); // 'hidden' | 'output' | 'testcases' | 'editorial'
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDescTab, setActiveDescTab] = useState('problem'); // 'problem' | 'editorial' | 'hints'
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [xpToast, setXpToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  const fetchedSheetTypeRef = useRef(null);
  const fetchedProgressSheetTypeRef = useRef(null);

  // Load problem on mount
  useEffect(() => {
    if (problemId) {
      fetchProblemDetails(problemId);
    }
  }, [problemId, fetchProblemDetails]);

  // Reset results and timer on problem change
  useEffect(() => {
    setRunResult(null);
    setSubmitResult(null);
    setElapsedTime(0);
    setOutputPanel('hidden');
    setShowConfetti(false);
  }, [problemId]);

  // Load sheet problems list for next/prev navigation
  useEffect(() => {
    if (activeProblem?.sheetType) {
      if (fetchedSheetTypeRef.current !== activeProblem.sheetType) {
        fetchDsaProblems(activeProblem.sheetType);
        fetchedSheetTypeRef.current = activeProblem.sheetType;
      }
    }
  }, [activeProblem?.sheetType, fetchDsaProblems]);

  // Find previous and next problems for navigation
  const currentIndex = dsaProblems.findIndex(p => p.problemId === problemId);
  const prevProblem = currentIndex > 0 ? dsaProblems[currentIndex - 1] : null;
  const nextProblem = currentIndex >= 0 && currentIndex < dsaProblems.length - 1 ? dsaProblems[currentIndex + 1] : null;

  // Fetch sheet progress for completed check
  useEffect(() => {
    if (activeProblem?.sheetType) {
      if (fetchedProgressSheetTypeRef.current !== activeProblem.sheetType) {
        fetchSheetProgress(activeProblem.sheetType);
        fetchedProgressSheetTypeRef.current = activeProblem.sheetType;
      }
    }
  }, [activeProblem?.sheetType, fetchSheetProgress]);

  // Set starter code when problem & language changes
  useEffect(() => {
    if (activeProblem?.templates?.[selectedLang]) {
      setCode(activeProblem.templates[selectedLang]);
    } else if (activeProblem) {
      const defaults = {
        javascript: `/**\n * ${activeProblem.title}\n */\nfunction solution() {\n  // Your code here\n}\n`,
        python: `# ${activeProblem.title}\nclass Solution:\n    def solve(self):\n        pass\n`,
        cpp: `class Solution {\npublic:\n    void solve() {\n        // Write your C++ code here\n    }\n};\n`,
        java: `class Solution {\n    public void solve() {\n        // Write your Java code here\n    }\n}\n`,
      };
      setCode(defaults[selectedLang] || '// Start coding...');
    }
  }, [activeProblem, selectedLang]);

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  // Auto start timer when problem loads
  useEffect(() => {
    if (activeProblem && !activeProblemLoading) {
      setTimerActive(true);
    }
  }, [activeProblem, activeProblemLoading]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleRun = useCallback(async () => {
    if (!activeProblem || !code.trim()) return;
    setIsRunning(true);
    setRunResult(null);
    setOutputPanel('output');
    try {
      const result = await runSandboxCode(activeProblem.problemId, selectedLang, code, customInput);
      setRunResult(result);
      setOutputPanel('testcases');
      if (result?.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (err) {
      setRunResult({ success: false, compilerOutput: err.message || 'Execution failed.', passedCount: 0, totalCount: 0 });
    } finally {
      setIsRunning(false);
    }
  }, [activeProblem, code, selectedLang, customInput, runSandboxCode]);

  const handleSubmit = useCallback(async () => {
    if (!activeProblem || !code.trim()) return;
    setIsSubmitting(true);
    setSubmitResult(null);
    setOutputPanel('output');
    try {
      const result = await submitSandboxCode(activeProblem.problemId, selectedLang, code);
      setSubmitResult(result);
      setOutputPanel('testcases');
      if (result?.success) {
        setShowConfetti(true);
        playCelebrationSound();
        setTimeout(() => setShowConfetti(false), 5000);
        if (result?.xpGained > 0) {
          setXpToast(`+${result.xpGained} XP`);
          setTimeout(() => setXpToast(null), 3000);
        }
      }
    } catch (err) {
      setSubmitResult({ success: false, compilerOutput: err.message || 'Submission failed.', passedCount: 0, totalCount: 0 });
    } finally {
      setIsSubmitting(false);
    }
  }, [activeProblem, code, selectedLang, submitSandboxCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    if (activeProblem?.templates?.[selectedLang]) {
      setCode(activeProblem.templates[selectedLang]);
    }
  };

  const isCompleted = sheetProgress?.some(
    p => p.problemId === activeProblem?.problemId && p.status === 'completed'
  );

  if (activeProblemLoading) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center flex-col gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
          <div className="absolute w-10 h-10 rounded-full border-4 border-cyan-400/10 border-b-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <div className="text-center">
          <p className="text-xs font-mono tracking-widest text-cyan-400 uppercase animate-pulse">
            AI Hydrating Problem...
          </p>
          <p className="text-[10px] text-gray-600 font-mono mt-1">Generating description & test cases</p>
        </div>
      </div>
    );
  }

  if (!activeProblem) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center flex-col gap-4">
        <XCircle size={40} className="text-red-400" />
        <p className="text-white font-mono">Problem not found.</p>
        <button onClick={() => navigate('/dsa-sheets')} className="text-cyan-400 font-mono text-sm hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Sheets
        </button>
      </div>
    );
  }

  // Helper to remove duplicate title from AI generated description
  const cleanDescription = (desc = '') => {
    let clean = desc.trim();
    const titleEscaped = activeProblem?.title ? activeProblem.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') : '';
    if (titleEscaped) {
      // Matches heading style title like '# Basic Hashing' or '**Basic Hashing**' case-insensitively at the start
      const regex = new RegExp(`^(?:#|##|###|\\*\\*)\\s*${titleEscaped}\\s*(?:#|##|###|\\*\\*|\\n)*`, 'i');
      clean = clean.replace(regex, '');
    }
    return clean;
  };

  return (
    <div className="h-screen bg-[#07080a] flex flex-col overflow-hidden text-white" style={{ background: '#07080a' }}>

      {/* ── Party Popper Confetti Celebration ── */}
      {showConfetti && <ConfettiCelebration />}

      {/* ── XP Toast ── */}
      <AnimatePresence>
        {xpToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold font-mono text-sm px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
          >
            <Zap size={16} className="fill-current" /> {xpToast} Awarded!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Nav Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0" style={{ background: '#09090e' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dsa-sheets')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-mono"
          >
            <ArrowLeft size={14} /> Sheets
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => prevProblem && navigate(`/dsa-sheets/solve/${prevProblem.problemId}`)}
              disabled={!prevProblem}
              className="p-1 rounded-md border border-white/5 bg-white/[0.02] text-gray-400 hover:text-white disabled:opacity-20 disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-all"
              title="Previous Problem"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => nextProblem && navigate(`/dsa-sheets/solve/${nextProblem.problemId}`)}
              disabled={!nextProblem}
              className="p-1 rounded-md border border-white/5 bg-white/[0.02] text-gray-400 hover:text-white disabled:opacity-20 disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-all"
              title="Next Problem"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm truncate max-w-[240px]" style={{ color: '#ffffff' }}>{activeProblem.title}</span>
            {isCompleted && (
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            )}
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border font-mono uppercase ${DIFFICULTY_COLOR[activeProblem.difficulty] || DIFFICULTY_COLOR.Medium}`}>
            {activeProblem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all
            ${timerActive ? 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5' : 'text-gray-500 border-white/10'}`}
            onClick={() => setTimerActive(t => !t)}
          >
            <Clock size={12} />
            {formatTime(elapsedTime)}
          </div>

          {/* External Link */}
          {activeProblem.link && (
            <a
              href={activeProblem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-violet-400 transition-colors border border-white/5 rounded-lg px-2.5 py-1.5"
            >
              {activeProblem.link.includes('leetcode.com') ? (
                <>
                  <svg className="w-3.5 h-3.5 fill-[#FFA116]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.074-1.954l-5.32-5.594c-.062-.062-.125-.125-.187-.188l3.966-4.254c.484-.53.473-1.378-.023-1.895l-2.072-2.073c-.274-.274-.633-.427-.999-.427zM6.53 14.773l1.879-1.996a.915.915 0 0 1 1.272 0l1.876 1.996a.915.915 0 0 1 0 1.273l-1.876 1.996a.915.915 0 0 1-1.272 0L6.53 16.046a.915.915 0 0 1 0-1.273zm10.94 0l1.877-1.996a.915.915 0 0 1 1.273 0l1.877 1.996a.915.915 0 0 1 0 1.273l-1.877 1.996a.915.915 0 0 1-1.273 0l-1.877-1.996a.915.915 0 0 1 0-1.273z"/>
                  </svg>
                  LeetCode
                </>
              ) : (
                <>
                  <ExternalLink size={11} /> Link
                </>
              )}
            </a>
          )}
          {activeProblem.youtube && (
            <a
              href={activeProblem.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-red-400 transition-colors border border-white/5 rounded-lg px-2.5 py-1.5"
            >
              <Youtube size={11} /> Video
            </a>
          )}

          {/* AI Tutor Toggle */}
          <button
            onClick={() => setShowTutor(!showTutor)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
              showTutor
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
            }`}
          >
            <Brain size={13} className={showTutor ? 'animate-pulse' : ''} />
            AI Tutor
          </button>

          {/* Run & Submit */}
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white text-xs font-mono font-bold transition-all disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="fill-current" />}
            Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-mono font-bold transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Submit
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL: Problem Description ── */}
        <div 
          className="w-[42%] min-w-[320px] flex flex-col border-r border-white/5 overflow-hidden"
          style={{ background: '#0a0a0f', color: '#cbd5e1' }}
        >

          {/* Description Tabs */}
          <div className="flex gap-0 border-b border-white/5 shrink-0" style={{ background: '#07070b' }}>
            {[
              { key: 'problem', icon: FileText, label: 'Problem' },
              { key: 'editorial', icon: Brain, label: 'Editorial' },
              { key: 'hints', icon: Lightbulb, label: 'Hints' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveDescTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 ${activeDescTab === tab.key
                    ? 'text-white border-violet-500'
                    : 'text-gray-600 border-transparent hover:text-gray-400'
                  }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Description Content */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-5" 
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent', background: '#0a0a0f', color: '#cbd5e1' }}
          >

            {activeDescTab === 'problem' && (
              <>
                <div>
                  <h1 className="text-xl font-bold text-white mb-1" style={{ color: '#ffffff' }}>{activeProblem.title}</h1>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase">
                    <Hash size={10} />
                    <span>{activeProblem.category}</span>
                    <span>·</span>
                    <span>{activeProblem.subCategory}</span>
                    <span>·</span>
                    <span className="text-violet-400">{activeProblem.sheetType} sheet</span>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="prose prose-invert prose-sm max-w-none">
                  <div
                    className="text-gray-300 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: activeProblem.description
                        ? renderMarkdown(cleanDescription(activeProblem.description))
                        : `<em class="text-gray-500">Loading problem description...</em>`
                    }}
                  />
                </div>

                {/* Examples */}
                {activeProblem.examples?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Examples</h3>
                    {activeProblem.examples.map((ex, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2 text-xs font-mono">
                        <div>
                          <span className="text-gray-500 uppercase text-[9px] tracking-wider">Input</span>
                          <pre className="mt-1 text-emerald-300 whitespace-pre-wrap break-all">{ex.input}</pre>
                        </div>
                        <div>
                          <span className="text-gray-500 uppercase text-[9px] tracking-wider">Output</span>
                          <pre className="mt-1 text-cyan-300 whitespace-pre-wrap break-all">{ex.output}</pre>
                        </div>
                        {ex.explanation && (
                          <div>
                            <span className="text-gray-500 uppercase text-[9px] tracking-wider">Explanation</span>
                            <p className="mt-1 text-gray-400 font-sans">{ex.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {activeProblem.constraints && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">Constraints</h3>
                    <div
                      className="text-xs text-gray-400 font-mono bg-white/[0.02] border border-white/5 rounded-xl p-4 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: activeProblem.constraints
                          .replace(/`(.*?)`/g, '<code class="text-cyan-300">$1</code>')
                          .replace(/\n/g, '<br/>')
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {activeDescTab === 'editorial' && (
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Brain size={16} className="text-violet-400" /> Editorial / Optimal Approach
                </h3>
                {activeProblem.editorial ? (
                  <div
                    className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: activeProblem.editorial
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/`(.*?)`/g, '<code class="bg-white/5 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-sm italic">Editorial will appear after you attempt the problem.</p>
                )}
              </div>
            )}

            {activeDescTab === 'hints' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-400" /> Strategic Hints
                </h3>
                {[
                  { num: 1, text: 'Break down the problem into smaller subproblems and identify the core data structure needed.' },
                  { num: 2, text: 'Think about the time and space complexity requirements. Can you solve it in O(N) time?' },
                  { num: 3, text: 'Consider edge cases: empty input, single element, all duplicates, extreme values.' },
                ].map(hint => (
                  <div key={hint.num} className="flex gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center">
                      {hint.num}
                    </span>
                    <p className="text-xs text-gray-400 leading-relaxed">{hint.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Editor + Output ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#09090e] shrink-0">
            {/* Language Selector */}
            <div className="flex gap-1">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.key}
                  onClick={() => setSelectedLang(lang.key)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all border ${selectedLang === lang.key
                      ? 'bg-violet-600/25 border-violet-500/40 text-violet-300'
                      : 'border-transparent text-gray-600 hover:text-gray-400'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-white border border-white/5 rounded-lg px-2.5 py-1.5 transition-all"
              >
                {copied ? <CheckCircle2 size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-white border border-white/5 rounded-lg px-2.5 py-1.5 transition-all"
              >
                <RotateCcw size={11} /> Reset
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.key === selectedLang)?.monaco || 'javascript'}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={MONACO_OPTIONS}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('sandbox-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [
                    { token: 'comment', foreground: '4b5563', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'a78bfa' },
                    { token: 'string', foreground: '34d399' },
                    { token: 'number', foreground: 'f9a8d4' },
                    { token: 'type', foreground: '67e8f9' },
                  ],
                  colors: {
                    'editor.background': '#07080a',
                    'editor.lineHighlightBackground': '#ffffff08',
                    'editorLineNumber.foreground': '#2d3748',
                    'editorLineNumber.activeForeground': '#6b7280',
                    'editor.selectionBackground': '#7c3aed40',
                    'editorCursor.foreground': '#a78bfa',
                    'scrollbarSlider.background': '#ffffff10',
                    'scrollbarSlider.hoverBackground': '#ffffff18',
                  }
                });
              }}
              onMount={(editor, monaco) => {
                monaco.editor.setTheme('sandbox-dark');
              }}
            />
          </div>

          {/* ── Output Drawer ── */}
          <div className="border-t border-white/5 shrink-0">
            {/* Output Tabs */}
            <div className="flex items-center justify-between px-4 bg-[#09090e]">
              <div className="flex">
                {[
                  { key: 'output', icon: Terminal, label: 'Output' },
                  { key: 'testcases', icon: Code2, label: 'Test Cases' },
                  { key: 'custom', icon: FileText, label: 'Custom Input' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setOutputPanel(p => p === tab.key ? 'hidden' : tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border-b-2 ${outputPanel === tab.key
                        ? 'text-white border-cyan-500'
                        : 'text-gray-600 border-transparent hover:text-gray-400'
                      }`}
                  >
                    <tab.icon size={11} />
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setOutputPanel(p => p === 'hidden' ? 'output' : 'hidden')}
                className="text-gray-600 hover:text-white transition-colors"
              >
                {outputPanel === 'hidden' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {outputPanel !== 'hidden' && (
                <motion.div
                  key="output-drawer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 220, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-[#07080a]"
                >
                  <div className="h-full p-4 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

                    {/* Output Tab */}
                    {outputPanel === 'output' && (
                      <div className="space-y-3 h-full">
                        {(isRunning || isSubmitting) && (
                          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs animate-pulse">
                            <Loader2 size={13} className="animate-spin" />
                            {isSubmitting ? 'Submitting solution via AI compiler...' : 'Running test cases...'}
                          </div>
                        )}

                        {currentResult && !isRunning && !isSubmitting && (
                          <>
                            {/* Status Banner */}
                            <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold font-mono ${currentResult.success
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                              }`}>
                              {currentResult.success
                                ? <><CheckCircle2 size={16} /> Accepted — {currentResult.passedCount}/{currentResult.totalCount} tests passed</>
                                : <><XCircle size={16} /> {currentResult.errorMessage ? 'Wrong Answer' : 'Runtime Error'} — {currentResult.passedCount}/{currentResult.totalCount} tests passed</>
                              }
                              {submitResult?.xpGained > 0 && (
                                <span className="ml-auto text-[10px] text-violet-400 flex items-center gap-1">
                                  <Zap size={10} className="fill-current" /> +{submitResult.xpGained} XP
                                </span>
                              )}
                            </div>

                            {/* Compiler Output */}
                            {currentResult.compilerOutput && (
                              <pre className="font-mono text-xs text-gray-400 bg-white/[0.02] border border-white/5 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {currentResult.compilerOutput}
                              </pre>
                            )}

                            {/* Error details */}
                            {currentResult.errorMessage && !currentResult.success && !/^(none|no errors|no error|no errors found|null|undefined)$/i.test(currentResult.errorMessage.trim()) && (
                              <div className="flex gap-2 text-xs font-mono text-red-400 bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                <span className="whitespace-pre-wrap">{currentResult.errorMessage}</span>
                              </div>
                            )}
                          </>
                        )}

                        {!currentResult && !isRunning && !isSubmitting && (
                          <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                            <Terminal size={24} />
                            <p className="text-xs font-mono">Click Run to execute your code</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Test Cases Tab */}
                    {outputPanel === 'testcases' && (
                      <div className="space-y-2">
                        {activeProblem.testCases?.length > 0 ? (
                          activeProblem.testCases.map((tc, i) => {
                            const tr = currentResult?.testResults?.[i];
                            const hasResult = tr !== undefined && tr.yourOutput !== undefined;
                            // Compute passed from actual output comparison, not AI's passed field
                            const normalize = (s) => String(s ?? '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                            const passed = hasResult
                              ? normalize(tr.yourOutput) === normalize(tc.expectedOutput)
                              : false;
                            return (
                              <div key={i} className={`border rounded-xl p-3 text-xs font-mono transition-colors ${
                                hasResult
                                  ? passed
                                    ? 'bg-emerald-500/5 border-emerald-500/25'
                                    : 'bg-red-500/5 border-red-500/25'
                                  : 'bg-white/[0.02] border-white/5'
                              }`}>
                                {/* Header row with test number and badge */}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Test {i + 1}</span>
                                  {hasResult && (
                                    <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                                      passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                      {passed ? '✓ Passed' : '✗ Failed'}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">Input</span>
                                    <pre className="mt-1 text-cyan-300 whitespace-pre-wrap break-all">{tc.input}</pre>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">Expected</span>
                                    <pre className="mt-1 text-emerald-300 whitespace-pre-wrap break-all">{tc.expectedOutput}</pre>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">Your Output</span>
                                    {hasResult ? (
                                      <pre className={`mt-1 whitespace-pre-wrap break-all ${passed ? 'text-emerald-300' : 'text-red-400'}`}>
                                        {tr.yourOutput ?? '—'}
                                      </pre>
                                    ) : (
                                      <p className="mt-1 text-gray-600">— run to see</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-500 text-xs font-mono text-center py-4">
                            Test cases will load after AI hydration...
                          </p>
                        )}
                      </div>
                    )}

                    {/* Custom Input Tab */}
                    {outputPanel === 'custom' && (
                      <div className="h-full flex flex-col gap-2">
                        <p className="text-[10px] font-mono text-gray-500 uppercase">Custom Test Input</p>
                        <textarea
                          value={customInput}
                          onChange={e => setCustomInput(e.target.value)}
                          placeholder="Enter custom input here..."
                          className="flex-1 w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-xs font-mono text-white placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500/40 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT PANEL: AI Tutor Chat Sidebar ── */}
        <AITutorSidebar
          isOpen={showTutor}
          onClose={() => setShowTutor(false)}
          problemContext={activeProblem}
          userCode={code}
          selectedLang={selectedLang}
        />
      </div>
    </div>
  );
}
