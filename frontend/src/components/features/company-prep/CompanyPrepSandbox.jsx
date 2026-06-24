import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Send, ChevronDown, ChevronUp, BookOpen,
  Terminal, Lightbulb, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Copy, RotateCcw, Clock, Zap, FileText, Hash
} from 'lucide-react';
import { api } from '../../../lib/api';

const LANGUAGES = [
  { key: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { key: 'python',     label: 'Python',     monaco: 'python'     },
  { key: 'cpp',        label: 'C++',         monaco: 'cpp'        },
  { key: 'java',       label: 'Java',        monaco: 'java'       },
];

const DIFFICULTY_COLOR = {
  easy:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  medium: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  hard:   'text-red-400    bg-red-400/10    border-red-400/20',
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

const parseMarkdown = (md) => {
  if (!md) return '';

  // 1. Unescape any escaped HTML spans from the AI response
  let text = md
    .replace(/&lt;span class="compiler"&gt;/g, '<span class="compiler">')
    .replace(/&lt;span class="interpreter"&gt;/g, '<span class="interpreter">')
    .replace(/&lt;\/span&gt;/g, '</span>')
    .replace(/&lt;br\s*\/?&gt;/g, '\n')
    .replace(/&lt;code&gt;/g, '<code>')
    .replace(/&lt;\/code&gt;/g, '</code>')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  const lines = text.split('\n');
  let html = [];
  let inList = false;
  let listType = null;
  let inCodeBlock = false;
  let codeContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        html.push(`<pre class="bg-[#040507] border border-white/5 p-4 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto my-4 select-text"><code>${codeContent.join('\n')}</code></pre>`);
        codeContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      codeContent.push(escaped);
      continue;
    }

    // List item close check
    const isListItem = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed);
    if (inList && !isListItem && trimmed !== '') {
      html.push(`</${listType}>`);
      inList = false;
      listType = null;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      html.push(`<h3 class="text-sm font-bold text-white mt-6 mb-2.5 uppercase tracking-wider">${trimmed.slice(4)}</h3>`);
    } else if (trimmed.startsWith('## ')) {
      html.push(`<h2 class="text-base font-bold text-white mt-7 mb-3 uppercase tracking-wider">${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith('# ')) {
      html.push(`<h1 class="text-lg font-bold text-white mt-8 mb-4 uppercase tracking-wider">${trimmed.slice(2)}</h1>`);
    }
    // Unordered lists
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        if (inList) html.push(`</${listType}>`);
        html.push('<ul class="list-disc pl-5 space-y-1.5 my-3 text-gray-300 text-sm">');
        inList = true;
        listType = 'ul';
      }
      html.push(`<li>${trimmed.slice(2)}</li>`);
    }
    // Ordered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        if (!inList || listType !== 'ol') {
          if (inList) html.push(`</${listType}>`);
          html.push('<ol class="list-decimal pl-5 space-y-1.5 my-3 text-gray-300 text-sm">');
          inList = true;
          listType = 'ol';
        }
        html.push(`<li>${match[2]}</li>`);
      }
    }
    // Empty line
    else if (trimmed === '') {
      if (inList) {
        html.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
    }
    // Paragraph
    else {
      html.push(`<p class="text-gray-300 text-sm leading-relaxed my-3">${line}</p>`);
    }
  }

  if (inList) {
    html.push(`</${listType}>`);
  }
  if (inCodeBlock) {
    html.push(`<pre class="bg-[#040507] border border-white/5 p-4 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto my-4 select-text"><code>${codeContent.join('\n')}</code></pre>`);
  }

  let parsedHtml = html.join('\n');

  // Inline styling replacements:
  parsedHtml = parsedHtml.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  parsedHtml = parsedHtml.replace(/\*(.*?)\*/g, '<em class="text-gray-200 italic">$1</em>');
  parsedHtml = parsedHtml.replace(/`(.*?)`/g, '<code class="bg-white/[0.04] text-cyan-300 border border-white/5 px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>');

  // Overrides to match standard custom span class designs:
  parsedHtml = parsedHtml.replace(
    /class="compiler"/g, 
    'class="bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded text-xs font-mono font-bold inline-block my-0.5"'
  );
  parsedHtml = parsedHtml.replace(
    /class="interpreter"/g, 
    'class="bg-violet-950/40 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded text-xs font-mono font-bold inline-block my-0.5"'
  );

  return parsedHtml;
};

export default function CompanyPrepSandbox({ question, onClose, onComplete }) {
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [outputPanel, setOutputPanel] = useState('hidden'); // 'hidden' | 'output' | 'custom'
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDescTab, setActiveDescTab] = useState('problem'); // 'problem' | 'explanation' | 'hints'
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [xpToast, setXpToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  // Dynamic details loading state
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Fetch dynamic coding exercise details on mount
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await api.get(`/company-prep/questions/${question.id}`);
        if (res.status === 'success') {
          setDetails(res.data);
          // Pre-populate with starter template
          if (res.data?.templates?.[selectedLang]) {
            setCode(res.data.templates[selectedLang]);
          }
        }
      } catch (err) {
        console.error('Failed to load sandbox details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    if (question?.id) {
      fetchQuestionDetails();
    }
  }, [question?.id]);

  // Sync templates on language change
  useEffect(() => {
    if (details?.templates?.[selectedLang]) {
      setCode(details.templates[selectedLang]);
    }
  }, [selectedLang, details]);

  // Timer loop
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleRun = useCallback(async () => {
    if (!question || !code.trim()) return;
    setIsRunning(true);
    setRunResult(null);
    setOutputPanel('output');
    try {
      const result = await api.post('/company-prep/questions/run', {
        questionId: question.id,
        language: selectedLang,
        code,
        customInput
      });
      if (result.status === 'success') {
        setRunResult(result.data);
      } else {
        throw new Error(result.message || 'Execution failed.');
      }
    } catch (err) {
      setRunResult({ success: false, compilerOutput: err.message || 'Execution failed.', passedCount: 0, totalCount: 2 });
    } finally {
      setIsRunning(false);
    }
  }, [question, code, selectedLang, customInput]);

  const handleSubmit = useCallback(async () => {
    if (!question || !code.trim()) return;
    setIsSubmitting(true);
    setSubmitResult(null);
    setOutputPanel('output');
    try {
      const result = await api.post('/company-prep/questions/submit', {
        questionId: question.id,
        language: selectedLang,
        code
      });
      if (result.status === 'success') {
        setSubmitResult(result.data);
        if (result.data?.success) {
          if (result.data.xpGained > 0) {
            setXpToast(`+${result.data.xpGained} XP`);
            setTimeout(() => setXpToast(null), 3000);
          }
          if (onComplete) {
            onComplete(question.id, result.data.progress, result.data.newXp, result.data.newLevel);
          }
        }
      } else {
        throw new Error(result.message || 'Submission failed.');
      }
    } catch (err) {
      setSubmitResult({ success: false, compilerOutput: err.message || 'Submission failed.', passedCount: 0, totalCount: 3 });
    } finally {
      setIsSubmitting(false);
    }
  }, [question, code, selectedLang, onComplete]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    if (details?.templates?.[selectedLang]) {
      setCode(details.templates[selectedLang]);
    }
  };

  if (loadingDetails) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07080a] flex items-center justify-center flex-col gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
          <div className="absolute w-10 h-10 rounded-full border-4 border-cyan-400/10 border-b-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <div className="text-center">
          <p className="text-xs font-mono tracking-widest text-cyan-400 uppercase animate-pulse">
            AI GENERATING PROGRAMMING EXERCISE...
          </p>
          <p className="text-[10px] text-gray-600 font-mono mt-1">Hydrating code templates and validation parameters</p>
        </div>
      </div>
    );
  }

  const currentResult = submitResult || runResult;
  const difficultyLower = question.difficulty?.toLowerCase() || 'medium';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 z-50 bg-[#07080a] flex flex-col overflow-hidden text-white"
    >
      {/* ── XP Toast ── */}
      <AnimatePresence>
        {xpToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-extrabold font-mono text-sm px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.4)] flex items-center gap-2"
          >
            <Zap size={16} className="fill-current animate-bounce" /> {xpToast} Earned! Code Accepted.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Nav Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#09090e] shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-mono cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Prep
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm truncate max-w-[240px]">{question.question}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border font-mono uppercase ${DIFFICULTY_COLOR[difficultyLower] || DIFFICULTY_COLOR.medium}`}>
            {question.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all
            ${timerActive ? 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5' : 'text-gray-500 border-white/10'}`}
            onClick={() => setTimerActive(t => !t)}
          >
            <Clock size={12} />
            {formatTime(elapsedTime)}
          </div>

          {/* Run & Submit */}
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white text-xs font-mono font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="fill-current" />}
            Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 text-black text-xs font-mono font-bold transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
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
              { key: 'problem',     icon: FileText, label: 'Problem Description'  },
              { key: 'explanation', icon: BookOpen, label: 'Correct Answer' },
              { key: 'hints',       icon: Lightbulb, label: 'Hints' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveDescTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeDescTab === tab.key
                    ? 'text-white border-cyan-500'
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
            
            {activeDescTab === 'problem' && details && (
              <>
                <div>
                  <h1 className="text-lg font-bold text-white mb-1 uppercase">{question.question}</h1>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase">
                    <Hash size={10} />
                    <span>{question.category}</span>
                    <span>·</span>
                    <span className="text-cyan-400">Exercise #{question.id}</span>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none">
                  <div 
                    className="text-gray-300 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: details.description
                        ? parseMarkdown(details.description)
                        : `Write a program implementation that solves the topic of ${question.question}.`
                    }}
                  />
                </div>

                {/* Constraints Card */}
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Evaluation Parameters</h3>
                  <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1.5">
                    <li>Logical correctness & concept demonstration.</li>
                    <li>Readability, modularity, and code efficiency.</li>
                    <li>Handling of extreme inputs, null states, and edge cases.</li>
                  </ul>
                </div>
              </>
            )}

            {activeDescTab === 'explanation' && (
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={16} className="text-cyan-400" /> Optimal Interview Explanation
                </h3>
                <div className="bg-cyan-950/10 border border-cyan-500/10 rounded-xl p-5 text-sm text-gray-300 leading-relaxed border-l-2 border-l-cyan-400">
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdown(question.answer) }} />
                </div>
              </div>
            )}

            {activeDescTab === 'hints' && details && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-400" /> Hints & Tips
                </h3>
                {(details.hints || []).map((hint, idx) => (
                  <div key={idx} className="flex gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="text-xs text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseMarkdown(hint) }} />
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
            <div className="flex gap-1">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.key}
                  onClick={() => setSelectedLang(lang.key)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    selectedLang === lang.key
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
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
                className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-white border border-white/5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
              >
                {copied ? <CheckCircle2 size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-white border border-white/5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
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
                    { token: 'keyword', foreground: '22d3ee' },
                    { token: 'string', foreground: '34d399' },
                    { token: 'number', foreground: 'f9a8d4' },
                    { token: 'type', foreground: '67e8f9' },
                  ],
                  colors: {
                    'editor.background': '#07080a',
                    'editor.lineHighlightBackground': '#ffffff08',
                    'editorLineNumber.foreground': '#2d3748',
                    'editorLineNumber.activeForeground': '#6b7280',
                    'editor.selectionBackground': '#0891b233',
                    'editorCursor.foreground': '#22d3ee',
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
                  { key: 'output', icon: Terminal, label: 'Compiler Output' },
                  { key: 'custom', icon: FileText, label: 'Custom Input' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setOutputPanel(p => p === tab.key ? 'hidden' : tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
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
                className="text-gray-600 hover:text-white transition-colors cursor-pointer"
              >
                {outputPanel === 'hidden' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {outputPanel !== 'hidden' && (
                <motion.div
                  key="output-drawer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 200, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-[#07080a]"
                >
                  <div className="h-full p-4 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                    
                    {/* Output Log */}
                    {outputPanel === 'output' && (
                      <div className="space-y-3 h-full">
                        {(isRunning || isSubmitting) && (
                          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs animate-pulse">
                            <Loader2 size={13} className="animate-spin" />
                            {isSubmitting ? 'Evaluating code via AI verification engine...' : 'Executing code...'}
                          </div>
                        )}

                        {currentResult && !isRunning && !isSubmitting && (
                          <>
                            {/* Status */}
                            <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold font-mono ${
                              currentResult.success
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>
                              {currentResult.success
                                ? <><CheckCircle2 size={16} /> Solution Accepted — Correct implementation verified!</>
                                : <><XCircle size={16} /> Incorrect — Verification failed.</>
                              }
                              {submitResult?.xpGained > 0 && (
                                <span className="ml-auto text-[10px] text-cyan-400 flex items-center gap-1 font-bold">
                                  <Zap size={10} className="fill-current animate-bounce" /> +{submitResult.xpGained} XP
                                </span>
                              )}
                            </div>

                            {/* Logs */}
                            {currentResult.compilerOutput && (
                              <pre className="font-mono text-xs text-gray-400 bg-white/[0.02] border border-white/5 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {currentResult.compilerOutput}
                              </pre>
                            )}

                            {/* Error Details */}
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
                            <p className="text-xs font-mono">Run your code to see output logs</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Custom Input */}
                    {outputPanel === 'custom' && (
                      <div className="h-full flex flex-col gap-2">
                        <p className="text-[10px] font-mono text-gray-500 uppercase">Input arguments / execution context</p>
                        <textarea
                          value={customInput}
                          onChange={e => setCustomInput(e.target.value)}
                          placeholder="Provide test arguments here..."
                          className="flex-1 w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-xs font-mono text-white placeholder-gray-600 resize-none focus:outline-none focus:border-cyan-500/40 transition-colors"
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
    </motion.div>
  );
}
