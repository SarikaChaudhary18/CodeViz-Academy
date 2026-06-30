import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Bot, User, RefreshCw } from 'lucide-react';
import { api } from '../../../lib/api';

const INITIAL_MESSAGES = [
  {
    sender: 'bot',
    text: "Greetings, Learner. I am your Socratic Mentor. I will not solve your code for you; instead, I will ask questions to guide you. What programming concept or logic constraint are you struggling with today?"
  }
];

export default function SocraticMentor() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMessage = { sender: 'user', text: userText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'socratic',
        payload: userText
      });
      
      const botText = res.data?.response || "I am reflecting on your question...";
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    } catch (err) {
      console.error('Failed to get response from Socratic Mentor:', err.message);
      setMessages(prev => [...prev, { sender: 'bot', text: "My cognitive pathways are currently jammed. Let's try reflecting on the problem again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col justify-between bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm text-left">
      {/* Header */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-200 text-orange-600 flex items-center justify-center animate-pulse">
            <Brain size={18} />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-extrabold text-zinc-950 leading-tight">SOCRATIC AI MENTOR</h2>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest block">Guiding logic via inquiry</span>
          </div>
        </div>
        
        <button 
          onClick={() => setMessages(INITIAL_MESSAGES)}
          className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-650 transition-colors"
          title="Reset Thread"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
              msg.sender === 'user' ? 'bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-orange-600/10 border-orange-200 text-orange-600'
            }`}>
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div className={`p-4 rounded-2xl text-xs leading-relaxed text-left border ${
              msg.sender === 'user'
                ? 'bg-orange-600 text-white border-orange-500 rounded-tr-none'
                : 'bg-zinc-50 text-zinc-900 border-zinc-200 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-orange-600/10 border border-orange-200 text-orange-600 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-[10px] font-mono text-zinc-550 flex items-center gap-1.5 animate-pulse">
              Mentor is reflecting...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-zinc-50 border-t border-zinc-200 p-4 flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Explain your reasoning or ask about a concept..."
          className="flex-1 h-10 px-4 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900"
        />
        <button
          type="submit"
          className="h-10 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
