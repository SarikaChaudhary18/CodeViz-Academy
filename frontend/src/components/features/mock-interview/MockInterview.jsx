import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../hooks/useStore';
import { Terminal, Send, Play, RefreshCw, Award, User, Bot, AlertCircle } from 'lucide-react';

export default function MockInterview() {
  const { user, logActivity } = useStore();
  
  const [role, setRole] = useState('Frontend Developer');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [scoreFeedback, setScoreFeedback] = useState(null);
  const chatEndRef = useRef(null);

  const interviewQuestions = {
    'Frontend Developer': [
      'Welcome! Let us start by talking about your React experience. How do you optimize React component re-renders under high metrics loads?',
      'Excellent. Let us talk about CSS strategies. When building design systems, how do you handle responsive typography without bloating utility variables?',
      'Good approach. Now, design a custom hook that handles WebSocket connection states and reconnects with exponential backoff. How would you structure this in React?',
      'Finally, tell me about a time you had a technical disagreement with a team member regarding frontend structure. How did you align?'
    ],
    'Backend Developer': [
      'Welcome to the technical screening. Let us begin: how do you manage MongoDB client connection pooling and optimize index usage for high-read collections?',
      'Makes sense. Now, explain sticky sessions in sticky load balancers. Why is this critical when scaling WebSockets across a multi-server node cluster?',
      'Let us review rate limiting. If you had to build an IP rate limiter from scratch, what algorithm (e.g. Token Bucket, Sliding Window) would you implement and why?',
      'Finally, describe a scenario where you had to debug a production memory leak or query bottleneck. What steps did you take?'
    ],
    'DevOps Engineer': [
      'Welcome! Let us begin: what system network parameters do you configure in Linux kernels to scale socket descriptors for high-load TCP connections?',
      'Good. When designing CI/CD pipelines, how do you handle secrets rotation and avoid storing build credentials inside Git logs?',
      'Describe your strategy for multi-stage Docker builds. How do you optimize Docker image size and ensure container security in production?',
      'Finally, tell me about a time when a critical database container crashed. How did you restore services without losing state?'
    ],
    'AI Engineer': [
      'Welcome. Let us begin: how do you construct vector embeddings for long documents, and which search metrics (e.g., Cosine, Euclidean) do you recommend for semantic lookups?',
      'Understood. How do you handle LLM prompt injections and ensure that output APIs consistently return parsed JSON structures?',
      'Let us talk about fine-tuning. When would you choose fine-tuning a model over context-based Retrieval-Augmented Generation (RAG)?',
      'Finally, tell me about a time you optimized training parameters or resource usage to scale training models efficiently.'
    ]
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog]);

  const startInterview = () => {
    setIsSessionActive(true);
    setChatLog([
      {
        sender: 'bot',
        text: `Aria (Google Technical Recruiter): Hello! I am Aria, and I will be conducting your technical screening today for the ${role} path. I will ask you four questions. Let's begin!`
      },
      {
        sender: 'bot',
        text: interviewQuestions[role][0]
      }
    ]);
    setCurrentQuestionIndex(0);
    setInterviewFinished(false);
    setScoreFeedback(null);
    setUserInput('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Save user response
    const newUserLog = [
      ...chatLog,
      { sender: 'user', text: userInput }
    ];
    setChatLog(newUserLog);
    const savedInput = userInput;
    setUserInput('');

    // Advance question or finish
    const nextIdx = currentQuestionIndex + 1;
    const questionsList = interviewQuestions[role];

    setTimeout(() => {
      if (nextIdx < questionsList.length) {
        setChatLog(prev => [
          ...prev,
          { sender: 'bot', text: questionsList[nextIdx] }
        ]);
        setCurrentQuestionIndex(nextIdx);
      } else {
        // Complete interview
        setChatLog(prev => [
          ...prev,
          { sender: 'bot', text: 'Thank you for your responses. I will compile the grading matrices. Click "Compile Assessment" to see your score!' }
        ]);
        setInterviewFinished(true);
      }
    }, 1000);
  };

  const evaluateInterview = async () => {
    // Generate evaluations based on user answers
    const userAnswers = chatLog.filter(log => log.sender === 'user').map(log => log.text);
    
    // Quick heuristic calculations for rating score (word count, action words etc.)
    let score = 65;
    let comments = [];

    const totalWords = userAnswers.join(' ').split(' ').length;
    if (totalWords > 80) {
      score += 15;
      comments.push('Strong communication depth: provided detailed, contextual explanations.');
    } else {
      score += 5;
      comments.push('Technical answers are slightly concise; consider elaborating on specific edge conditions.');
    }

    const answersText = userAnswers.join(' ').toLowerCase();
    const actionWords = ['optimize', 'index', 'scale', 'cache', 'queue', 'design', 'test', 'profile', 'react'];
    const matchingWords = actionWords.filter(w => answersText.includes(w));
    
    if (matchingWords.length > 3) {
      score += 15;
      comments.push(`Strong vocabulary match: utilized industry standard verbs (${matchingWords.slice(0, 3).join(', ')}).`);
    } else {
      comments.push('Consider incorporating stronger action verbs (e.g. optimize, scale, decouple) to convey impact.');
    }

    score = Math.min(98, score);

    setScoreFeedback({
      score,
      comments,
      rating: score >= 85 ? 'Highly Recommended' : score >= 70 ? 'Recommended with feedback' : 'Needs practice'
    });

    // Log Activity to Backend and Award XP
    try {
      await logActivity('quiz', 1);
    } catch (e) {
      console.log('Activity logging failed:', e.message);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header HUD */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
          AI RECRUITER MOCK INTERVIEW
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          SIMULATED VOICE-TEXT CHAT RECRUITER SCENARIO & REAL-TIME RESPONSE EVALUATION
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Setup Panel / Results */}
        <div>
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-violet relative overflow-hidden h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Terminal size={18} className="text-violet-400" />
                INTERVIEW SANDBOX
              </h3>

              <AnimatePresence mode="wait">
                {!isSessionActive && !scoreFeedback ? (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Initialize a simulated tech screening session. The AI agent will ask 4 role-relevant questions. Answer clearly; your responses are audited against communication criteria to grade your proficiency.
                    </p>

                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Target Discipline</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-3 text-xs text-gray-300 focus:outline-none focus:border-violet-500/50 font-mono"
                      >
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="AI Engineer">AI Engineer</option>
                      </select>
                    </div>

                    <button
                      onClick={startInterview}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg box-glow-violet active:scale-[0.98] transition-all"
                    >
                      <Play size={14} /> Start Mock Interview
                    </button>
                  </motion.div>
                ) : scoreFeedback ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                      <Award size={32} />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">EVALUATION METRIC</h4>
                      <p className="text-xs text-cyan-400 font-mono uppercase tracking-widest mt-0.5">{scoreFeedback.rating}</p>
                    </div>

                    <div className="py-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <span className="text-5xl font-extrabold text-glow-cyan text-emerald-400 font-mono">{scoreFeedback.score}%</span>
                    </div>

                    <div className="text-left space-y-2 max-h-48 overflow-y-auto p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <h5 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Feedback Logs</h5>
                      {scoreFeedback.comments.map((c, i) => (
                        <p key={i} className="text-xs text-gray-300 leading-relaxed font-sans flex gap-2">
                          <span className="text-cyan-400 font-bold">&bull;</span>
                          {c}
                        </p>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setScoreFeedback(null);
                        setIsSessionActive(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-gray-300 font-bold text-xs rounded-xl transition-all"
                    >
                      <RefreshCw size={12} /> New Screening Session
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-2xl flex gap-3 text-xs text-violet-300 leading-relaxed">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 animate-pulse" />
                      <span>Interview is active. Answer questions sequentially. Submit draft to unlock the evaluation logs.</span>
                    </div>

                    {interviewFinished ? (
                      <button
                        onClick={evaluateInterview}
                        className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm rounded-xl cursor-pointer shadow-md shadow-cyan-500/10 active:scale-[0.98] transition-all"
                      >
                        Compile Assessment & XP
                      </button>
                    ) : (
                      <div className="py-2.5 text-center bg-white/[0.01] border border-white/5 rounded-xl text-xs text-gray-500 font-mono">
                        QUESTION {currentQuestionIndex + 1} OF 4
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-[9px] text-gray-500 text-center font-mono mt-6">ALIGNED WITH SENIOR SCREENING CRITERIA</p>
          </div>
        </div>

        {/* Right Side: Chat Window Interface */}
        <div className="lg:col-span-2">
          <div className="glassmorphism rounded-3xl border-white/10 box-glow-cyan flex flex-col h-[520px] overflow-hidden relative">
            
            {/* Chat Header Status */}
            <div className="h-16 border-b border-white/5 px-6 flex items-center gap-3 bg-white/[0.01]">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-white font-bold tracking-wider font-mono">RECRUITER FEED CHAT</span>
            </div>

            {/* Message feed log */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatLog.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono uppercase tracking-widest animate-pulse">
                  System awaiting activation command...
                </div>
              ) : (
                chatLog.map((log, index) => {
                  const isBot = log.sender === 'bot';
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      {isBot && (
                        <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                          <Bot size={14} className="text-violet-400" />
                        </div>
                      )}
                      
                      <div className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed ${
                        isBot 
                          ? 'bg-white/[0.02] border border-white/5 text-gray-200' 
                          : 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 border border-violet-500/25 text-white'
                      }`}>
                        {log.text}
                      </div>

                      {!isBot && (
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
                          <User size={14} className="text-cyan-400" />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input action footer */}
            <form onSubmit={handleSendMessage} className="h-20 border-t border-white/5 px-6 flex items-center gap-3 bg-white/[0.005]">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={!isSessionActive || interviewFinished}
                placeholder={
                  !isSessionActive 
                    ? 'Activate interview session first...' 
                    : interviewFinished 
                    ? 'Screening complete. Compile score.' 
                    : 'Type your technical answer here...'
                }
                className="flex-1 bg-white/[0.02] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isSessionActive || interviewFinished || !userInput.trim()}
                className="p-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/5 text-black disabled:text-gray-500 rounded-xl transition-all cursor-pointer flex items-center justify-center active:scale-[0.98]"
              >
                <Send size={14} />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
