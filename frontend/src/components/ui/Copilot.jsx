import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Image as ImageIcon, Send, ArrowRight, Bot, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../hooks/useStore';

function formatMessageText(text) {
  if (!text) return '';
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const lang = match ? match[1] : '';
      const code = match ? match[2] : part.slice(3, -3);
      return (
        <pre key={i} className="bg-zinc-900 border border-white/5 rounded-xl p-3 my-2.5 font-mono text-[10px] text-zinc-300 overflow-x-auto w-full max-w-full">
          {lang && <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5">{lang}</span>}
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

export default function Copilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null); // base64
  const [mimeType, setMimeType] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am your CodeViz AI Copilot. You can ask me coding questions or upload a screenshot/image of a problem or error, and I will help you debug!' }
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const { user, fetchProfile } = useStore();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Max size is 2MB.");
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // base64 string
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() && !image) return;

    const userPrompt = prompt;
    const userImage = image;
    const userMime = mimeType;

    // Append user message
    setMessages(prev => [
      ...prev,
      { role: 'user', text: userPrompt, image: userImage }
    ]);

    setPrompt('');
    setImage(null);
    setMimeType(null);
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/copilot/chat', {
        prompt: userPrompt,
        image: userImage,
        mimeType: userMime,
        history: messages.map(msg => ({ role: msg.role, text: msg.text }))
      });

      // Update local profile to sync quota
      if (fetchProfile) {
        fetchProfile();
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: response.data.response }
      ]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to get response from Copilot');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Error: ${err.message || 'Failed to complete AI request.'}`, isError: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setMimeType(null);
  };

  return (
    <>
      {/* Floating Copilot Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center text-white cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.3)] relative"
        >
          {isOpen ? <X size={20} /> : <Sparkles size={20} className="animate-pulse" />}
        </motion.button>
      </div>

      {/* Copilot Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-22 right-6 w-96 h-[500px] z-50 rounded-2xl bg-zinc-950/95 border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-md"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Bot size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">CODEVIZ COPILOT</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">ACTIVE</span>
                  </div>
                </div>
              </div>
              
              {/* Daily Quota Indicator */}
              <div className="text-right">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
                  DAILY AI QUOTA
                </span>
                <span className="text-xs font-mono font-bold text-violet-400">
                  {user?.aiUsageToday || 0} / {parseInt(import.meta.env.VITE_DAILY_AI_LIMIT || "5", 10)} USED
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.image && (
                    <div className="mb-1 max-w-[70%] border border-white/10 rounded-lg overflow-hidden">
                      <img src={msg.image} alt="Upload" className="max-h-32 object-contain" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white font-semibold'
                      : msg.isError 
                      ? 'bg-rose-950/20 border border-rose-500/20 text-rose-300'
                      : 'bg-white/[0.02] border border-white/5 text-zinc-300'
                  }`}>
                    {formatMessageText(msg.text)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono animate-pulse">
                  <Cpu size={12} className="animate-spin text-violet-400" /> WAKING MODEL AND EXAMINING PROMPT...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-white/[0.01] space-y-2">
              
              {/* Selected Image Preview */}
              {image && (
                <div className="relative inline-flex items-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-zinc-400">
                  <ImageIcon size={12} className="text-cyan-400" />
                  <span className="max-w-[120px] truncate">Image selected</span>
                  <button type="button" onClick={removeImage} className="hover:text-white">
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Upload Image (Multimodal)"
                >
                  <ImageIcon size={15} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask a question or upload code image..."
                  className="flex-1 bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder-zinc-500 font-sans"
                />

                <button
                  type="submit"
                  disabled={loading || (!prompt.trim() && !image)}
                  className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 text-white disabled:text-zinc-600 rounded-xl transition-all cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
