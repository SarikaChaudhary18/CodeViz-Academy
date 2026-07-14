import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Cpu, Bot, Lightbulb, Code2, Brain, Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../hooks/useStore';

// Helper to format messages and highlight inline and block code snippets
function formatMessageText(text) {
  if (!text) return '';
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const lang = match ? match[1] : '';
      const code = match ? match[2] : part.slice(3, -3);
      return (
        <pre key={i} className="bg-zinc-900/90 border border-white/5 rounded-xl p-3 my-2.5 font-mono text-[10px] text-zinc-300 overflow-x-auto w-full max-w-full">
          {lang && <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mb-1">{lang}</span>}
          <code>{code}</code>
        </pre>
      );
    }
    const inlineParts = part.split(/(`[^`]+`)/g);
    const renderedInline = inlineParts.map((subPart, j) => {
      if (subPart.startsWith('`') && subPart.endsWith('`')) {
        return (
          <code key={j} className="bg-white/10 text-cyan-300 px-1 py-0.5 rounded font-mono text-[10px] mx-0.5">
            {subPart.slice(1, -1)}
          </code>
        );
      }
      return subPart.split('\n').map((line, k, arr) => (
        <React.Fragment key={k}>
          {line}
          {k < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    });
    return <span key={i}>{renderedInline}</span>;
  });
}

export default function AITutorSidebar({ isOpen, onClose, problemContext, userCode, selectedLang }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const chatEndRef = useRef(null);
  const { user, checkAuth } = useStore();

  // Reset or initialize conversation on problem change
  useEffect(() => {
    if (problemContext?.title) {
      setMessages([
        { 
          role: 'assistant', 
          text: `Hi! I'm your AI SDE Tutor. How can I help you with **${problemContext.title}**?\n\nChoose one of the quick actions below, or ask any question about your code or strategy.` 
        }
      ]);
    }
  }, [problemContext?.title]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendPrompt = async (messageText, isQuickAction = false, actionLabel = '') => {
    if (!messageText.trim()) return;

    // Add user message to UI
    const displayMsg = isQuickAction ? `[Quick Action] ${actionLabel}` : messageText;
    setMessages(prev => [...prev, { role: 'user', text: displayMsg }]);
    
    setPrompt('');
    setLoading(true);
    setErrorMsg(null);

    // Formulate context-aware prompt
    let finalPrompt = messageText;
    if (isQuickAction || userCode) {
      finalPrompt = `You are tutoring the user on the coding problem: "${problemContext.title}".
Problem description: ${problemContext.description || 'N/A'}
Constraints: ${problemContext.constraints || 'N/A'}

Selected programming language: ${selectedLang}
User's current code:
\`\`\`${selectedLang}
${userCode || '// No code written yet'}
\`\`\`

Request from user:
${messageText}`;
    }

    try {
      const response = await api.post('/copilot/chat', {
        prompt: finalPrompt,
        history: messages.map(msg => ({ role: msg.role, text: msg.text }))
      });

      // Refresh daily limit usage from backend user profile state
      if (checkAuth) {
        await checkAuth();
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: response.data.response }
      ]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to get response from AI Tutor.');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Error: ${err.message || 'Failed to connect to tutor service.'}`, isError: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionKey) => {
    if (loading) return;
    
    let messageText = '';
    let actionLabel = '';

    switch(actionKey) {
      case 'hint':
        actionLabel = '💡 Request a Hint';
        messageText = `Provide a small, clever hint (without writing direct solution code) to help me move forward with this problem. Explain the core intuition/direction.`;
        break;
      case 'review':
        actionLabel = '🔍 Review My Code';
        messageText = `Review my current code. Check for syntax correctness, edge-case bugs, or possible optimizations. Walk through the time and space complexity, and guide me on how to improve it.`;
        break;
      case 'explain':
        actionLabel = '🛠️ Explain Logic';
        messageText = `Break down the optimal logical approach and mathematical or algorithmic intuition needed to solve this problem. Do not write full solution code, just explain step-by-step in plain English.`;
        break;
      case 'dryrun':
        actionLabel = '📋 Dry Run';
        messageText = `Walk through my current code step-by-step (dry run) with the first example test case to show how variables change state.`;
        break;
      default:
        return;
    }

    handleSendPrompt(messageText, true, actionLabel);
  };

  const clearHistory = () => {
    if (problemContext?.title) {
      setMessages([
        { 
          role: 'assistant', 
          text: `Conversation restarted! How can I help you with **${problemContext.title}**?` 
        }
      ]);
      setErrorMsg(null);
    }
  };

  const dailyLimit = parseInt(import.meta.env.VITE_DAILY_AI_LIMIT || '5', 10);
  const usageToday = user?.aiUsageToday || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '30%', minWidth: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="border-l border-white/5 flex flex-col bg-[#08090d] h-full overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Bot size={15} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wider">AI CODELAB TUTOR</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">Connected</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={clearHistory}
                title="Reset Tutor Chat"
                className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Quota HUD */}
          <div className="px-4 py-2 border-b border-white/5 bg-cyan-500/[0.01] flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">DAILY AI TUTOR QUOTA:</span>
            <span className={`font-bold ${usageToday >= dailyLimit ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
              {usageToday} / {dailyLimit} USED
            </span>
          </div>

          {/* Chat Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
          >
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-500 text-black font-semibold shadow-[0_2px_10px_rgba(6,182,212,0.25)]'
                      : msg.isError
                      ? 'bg-rose-950/20 border border-rose-500/20 text-rose-300'
                      : 'bg-white/[0.02] border border-white/5 text-zinc-300'
                  }`}
                >
                  {formatMessageText(msg.text)}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono animate-pulse">
                <Cpu size={12} className="animate-spin text-cyan-400" /> THINKING & ANALYZING CONTEXT...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions Panel */}
          <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01]">
            <span className="text-[9px] font-mono text-zinc-500 tracking-wider uppercase block mb-2">Tutor Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleQuickAction('hint')}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 hover:border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold transition-all disabled:opacity-50 text-left cursor-pointer"
              >
                <Lightbulb size={11} className="shrink-0" /> Request Hint
              </button>
              <button 
                onClick={() => handleQuickAction('review')}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/15 hover:border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold transition-all disabled:opacity-50 text-left cursor-pointer"
              >
                <Code2 size={11} className="shrink-0" /> Review Code
              </button>
              <button 
                onClick={() => handleQuickAction('explain')}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/15 hover:border-violet-500/30 text-violet-300 text-[10px] font-mono font-bold transition-all disabled:opacity-50 text-left cursor-pointer"
              >
                <Brain size={11} className="shrink-0" /> Explain Logic
              </button>
              <button 
                onClick={() => handleQuickAction('dryrun')}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 hover:border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold transition-all disabled:opacity-50 text-left cursor-pointer"
              >
                <Play size={11} className="shrink-0" /> Dry Run
              </button>
            </div>
          </div>

          {/* Form Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(prompt);
            }} 
            className="p-3 border-t border-white/5 bg-[#07080a]"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask the AI Tutor a question..."
                className="flex-1 bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder-zinc-600 font-sans"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-black disabled:text-zinc-600 rounded-xl transition-all cursor-pointer"
              >
                <Send size={13} />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
