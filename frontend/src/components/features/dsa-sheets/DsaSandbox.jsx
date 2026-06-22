import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Send, ChevronDown, ChevronUp, BookOpen,
  Terminal, Lightbulb, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Copy, RotateCcw, Clock, Zap, Code2, FileText,
  Hash, RefreshCw, ExternalLink, Youtube, Brain
} from 'lucide-react';

const LANGUAGES = [
  { key: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { key: 'python',     label: 'Python',     monaco: 'python'     },
  { key: 'cpp',        label: 'C++',         monaco: 'cpp'        },
  { key: 'java',       label: 'Java',        monaco: 'java'       },
];

const DIFFICULTY_COLOR = {
  Easy:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  Hard:   'text-red-400    bg-red-400/10    border-red-400/20',
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
    user,
  } = useStore();

  const [selectedLang, setSelectedLang] = useState('javascript');
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

  // Load problem on mount
  useEffect(() => {
    if (problemId) {
      fetchProblemDetails(problemId);
    }
  }, [problemId, fetchProblemDetails]);

  // Fetch sheet progress for completed check
  useEffect(() => {
    if (activeProblem?.sheetType) {
      fetchSheetProgress(activeProblem.sheetType);
    }
  }, [activeProblem?.sheetType, fetchSheetProgress]);

  // Set starter code when problem & language changes
  useEffect(() => {
    if (activeProblem?.templates?.[selectedLang]) {
      setCode(activeProblem.templates[selectedLang]);
    } else if (activeProblem) {
      const defaults = {
        javascript: `/**\n * ${activeProblem.title}\n */\nfunction solution() {\n  // Your code here\n}\n`,
        python:     `# ${activeProblem.title}\nclass Solution:\n    def solve(self):\n        pass\n`,
        cpp:        `// ${activeProblem.title}\n#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};\n`,
        java:       `// ${activeProblem.title}\nclass Solution {\n    public void solve() {\n        \n    }\n}\n`,
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
      if (result?.success && result?.xpGained > 0) {
        setXpToast(`+${result.xpGained} XP`);
        setTimeout(() => setXpToast(null), 3000);
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

  const currentResult = submitResult || runResult;

  return (
    <div className="h-screen bg-[#07080a] flex flex-col overflow-hidden text-white">

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
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#09090e] shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dsa-sheets')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-mono"
          >
            <ArrowLeft size={14} /> Sheets
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm truncate max-w-[240px]">{activeProblem.title}</span>
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
              className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-violet-400 transition-colors border border-white/5 rounded-lg px-2.5 py-1.5"
            >
              <ExternalLink size={11} /> LeetCode
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
        <div className="w-[42%] min-w-[320px] flex flex-col border-r border-white/5 overflow-hidden">

          {/* Description Tabs */}
          <div className="flex gap-0 border-b border-white/5 shrink-0 bg-[#09090e]">
            {[
              { key: 'problem',   icon: FileText, label: 'Problem'  },
              { key: 'editorial', icon: Brain,    label: 'Editorial' },
              { key: 'hints',     icon: Lightbulb, label: 'Hints'   },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveDescTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeDescTab === tab.key
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
          <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

            {activeDescTab === 'problem' && (
              <>
                <div>
                  <h1 className="text-xl font-bold text-white mb-1">{activeProblem.title}</h1>
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
                    className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: activeProblem.description
                        ? activeProblem.description
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                            .replace(/`(.*?)`/g, '<code class="bg-white/5 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
                            .replace(/\n/g, '<br/>')
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
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all border ${
                    selectedLang === lang.key
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
                  { key: 'output',    icon: Terminal,     label: 'Output'      },
                  { key: 'testcases', icon: Code2,        label: 'Test Cases'  },
                  { key: 'custom',    icon: FileText,     label: 'Custom Input'},
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setOutputPanel(p => p === tab.key ? 'hidden' : tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border-b-2 ${
                      outputPanel === tab.key
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
                            <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold font-mono ${
                              currentResult.success
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
                            {currentResult.errorMessage && (
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
                          activeProblem.testCases.map((tc, i) => (
                            <div key={i} className="grid grid-cols-2 gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs font-mono">
                              <div>
                                <span className="text-[9px] text-gray-500 uppercase tracking-wider">Input</span>
                                <pre className="mt-1 text-cyan-300 whitespace-pre-wrap break-all">{tc.input}</pre>
                              </div>
                              <div>
                                <span className="text-[9px] text-gray-500 uppercase tracking-wider">Expected Output</span>
                                <pre className="mt-1 text-emerald-300 whitespace-pre-wrap break-all">{tc.expectedOutput}</pre>
                              </div>
                            </div>
                          ))
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
      </div>
    </div>
  );
}
