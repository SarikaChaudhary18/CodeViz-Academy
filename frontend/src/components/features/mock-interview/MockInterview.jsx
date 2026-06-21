import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../hooks/useStore';
import { Terminal, Send, Play, RefreshCw, Award, User, Bot, AlertCircle } from 'lucide-react';
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from '../../../lib/utils';

// ==================== Popover Components ====================

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef(function PopoverContent(
  { className, align = "center", sideOffset = 4, ...props },
  ref
) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border border-white/10 bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const keywordMatrix = {
  'Frontend Developer': [
    ['memo', 'usememo', 'usecallback', 'virtual', 'window', 're-render', 'colocating state', 'debounce'],
    ['clamp', 'fluid', 'rem', 'em', 'media query', 'calc', 'tailwind', 'font-size'],
    ['useeffect', 'ref', 'websocket', 'backoff', 'reconnect', 'settimeout', 'cleanup', 'ws'],
    ['align', 'compromise', 'discuss', 'meeting', 'consensus', 'agreement', 'standard']
  ],
  'Backend Developer': [
    ['poolsize', 'connection pooling', 'indexing', 'compound index', 'explain', 'readpreference', 'replica set'],
    ['sticky session', 'load balancer', 'websocket', 'handshake', 'redis', 'pub/sub', 'ip hash', 'socket.io'],
    ['token bucket', 'sliding window', 'leaky bucket', 'redis', 'rate limit', 'middleware', 'timestamp'],
    ['profile', 'heap dump', 'index', 'explain', 'log', 'bottleneck', 'query optimization']
  ],
  'Full Stack Developer': [
    ['server component', 'client component', 'rsc', 'ssr', 'dynamic', 'static', 'boundary', 'use client'],
    ['broadcast channel', 'localstorage', 'websocket', 'transaction', 'isolation level', 'optimistic locking', 'synchronization'],
    ['cache', 'redis', 'index', 'query', 'preload', 'lazy', 'ttfb', 'cdn', 'server-side rendering'],
    ['csrf', 'xss', 'helmet', 'cors', 'cookie', 'httponly', 'samesite', 'sanitize', 'jwt']
  ],
  'DevOps Engineer': [
    ['sysctl', 'nofile', 'ulimit', 'tcp_tw_reuse', 'tcp_fin_timeout', 'socket', 'descriptor'],
    ['secret', 'vault', 'env', 'rotation', 'kms', 'gitguardian', 'variables', 'github secrets'],
    ['multi-stage', 'alpine', 'distroless', 'size', 'layer', 'cache', 'scan', 'security'],
    ['volume', 'backup', 'restore', 'recovery', 'state', 'persistence', 'replica']
  ],
  'AI Engineer': [
    ['embedding', 'chunk', 'cosine', 'distance', 'similarity', 'vector', 'dot product', 'overlap'],
    ['injection', 'json', 'schema', 'system prompt', 'parser', 'validation', 'pydantic', 'guardrails'],
    ['rag', 'fine-tune', 'context', 'knowledge', 'parameter', 'hallucination', 'cost', 'retrieval'],
    ['learning rate', 'batch size', 'gpu', 'deepspeed', 'lora', 'quantization', 'optimization']
  ],
  'ML Engineer': [
    ['transformer', 'rnn', 'parallel', 'attention', 'attention mechanism', 'sequence', 'recurrent', 'long-range'],
    ['gradient clipping', 'resnet', 'residual', 'batch normalization', 'weight initialization', 'relu'],
    ['drift', 'concept drift', 'data drift', 'ks test', 'psi', 'monitor', 'retrain', 'baseline'],
    ['quantization', 'pruning', 'weight', 'float16', 'int8', 'edge', 'latency', 'size']
  ],
  'AI/ML Engineer': [
    ['redis', 'feature store', 'latency', 'feast', 'online', 'offline', 'cache', 'pipeline'],
    ['concept drift', 'monitor', 'retrain', 'pipeline', 'scheduler', 'drift detection', 'airflow'],
    ['bias', 'fairness', 'evaluation', 'toxicity', 'prompting', 'benchmark', 'red teaming'],
    ['debug', 'degradation', 'performance', 'drift', 'pipeline', 'monitoring', 'metrics']
  ],
  'Cybersecurity': [
    ['stride', 'threat modeling', 'microservices', 'cloud', 'attack surface', 'trust boundary', 'iam'],
    ['symmetric', 'asymmetric', 'public key', 'private key', 'tls', 'handshake', 'session key', 'certificate'],
    ['sql injection', 'idor', 'parameterized', 'prepared statement', 'authorization', 'uuid', 'owasp'],
    ['incident response', 'contain', 'mitigate', 'log', 'isolation', 'forensics', 'backup']
  ],
  'Cybersecurcity': [
    ['stride', 'threat modeling', 'microservices', 'cloud', 'attack surface', 'trust boundary', 'iam'],
    ['symmetric', 'asymmetric', 'public key', 'private key', 'tls', 'handshake', 'session key', 'certificate'],
    ['sql injection', 'idor', 'parameterized', 'prepared statement', 'authorization', 'uuid', 'owasp'],
    ['incident response', 'contain', 'mitigate', 'log', 'isolation', 'forensics', 'backup']
  ]
};

export default function MockInterview() {
  const { user, logActivity } = useStore();
  
  const [role, setRole] = useState('Frontend Developer');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
    'Full Stack Developer': [
      'Welcome! Let us start with system architecture. How do you structure a high-performance web app using Next.js, and where do you draw the boundary between client and server components?',
      'Excellent. How do you manage global state synchronization between multiple client tabs and database transactions?',
      'Let us talk about performance. What techniques do you use to optimize database queries and decrease Time to First Byte (TTFB) for complex layouts?',
      'Finally, describe how you secure your API endpoints against CSRF and cross-site scripting vulnerabilities.'
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
    ],
    'ML Engineer': [
      'Welcome! Let us start by discussing model architectures. When do you prefer transformer-based architectures over traditional recurrent models?',
      'Understood. How do you handle vanishing or exploding gradients during training of deep neural networks?',
      'Let us talk about datasets. How do you detect and address dataset drift in production ML pipelines?',
      'Finally, describe your approach to model quantization and pruning for edge device deployment.'
    ],
    'AI/ML Engineer': [
      'Welcome! How do you design feature store pipelines to serve features with sub-millisecond latency to online ML models?',
      'Makes sense. How do you monitor production ML models for concept drift and perform automated retraining?',
      'Let us talk about evaluation. How do you evaluate the bias and fairness of a generative language model?',
      'Finally, tell me about a time you had to debug an model performance degradation in production.'
    ],
    'Cybersecurity': [
      'Welcome to the cybersecurity screening. How do you conduct threat modeling for a cloud-native microservices architecture?',
      'Excellent. Explain the difference between symmetric and asymmetric encryption, and how TLS uses both to establish a secure connection.',
      'Let us review web security. How do you protect API endpoints against SQL injection and insecure direct object references (IDOR)?',
      'Finally, describe how you would respond to and mitigate an active security incident in your production environment.'
    ],
    'Cybersecurcity': [
      'Welcome to the cybersecurity screening. How do you conduct threat modeling for a cloud-native microservices architecture?',
      'Excellent. Explain the difference between symmetric and asymmetric encryption, and how TLS uses both to establish a secure connection.',
      'Let us review web security. How do you protect API endpoints against SQL injection and insecure direct object references (IDOR)?',
      'Finally, describe how you would respond to and mitigate an active security incident in your production environment.'
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

    // Compute contextual acknowledgement based on keyword matching
    const currentKeywords = (keywordMatrix[role] && keywordMatrix[role][currentQuestionIndex]) || [];
    const lowerAnswer = savedInput.toLowerCase();
    const matchedCount = currentKeywords.filter(word => lowerAnswer.includes(word)).length;

    let acknowledgement = "Got it. ";
    if (matchedCount >= 2) {
      acknowledgement = "Excellent explanation. ";
    } else if (matchedCount === 1) {
      acknowledgement = "Understood, good point. ";
    } else if (savedInput.split(/\s+/).length < 5) {
      acknowledgement = "Acknowledged. ";
    }

    setTimeout(() => {
      if (nextIdx < questionsList.length) {
        setChatLog(prev => [
          ...prev,
          { sender: 'bot', text: `${acknowledgement}${questionsList[nextIdx]}` }
        ]);
        setCurrentQuestionIndex(nextIdx);
      } else {
        // Complete interview
        setChatLog(prev => [
          ...prev,
          { sender: 'bot', text: `${acknowledgement}Thank you for your responses. I have compiled the grading matrices. Click "Compile Assessment & XP" to see your score!` }
        ]);
        setInterviewFinished(true);
      }
    }, 1000);
  };

  const evaluateInterview = async () => {
    // Generate evaluations based on user answers
    const userAnswers = chatLog.filter(log => log.sender === 'user').map(log => log.text);
    
    let totalScore = 0;
    let comments = [];
    const categoryKeywords = keywordMatrix[role] || [];

    for (let i = 0; i < 4; i++) {
      const answer = userAnswers[i] || '';
      const keywords = categoryKeywords[i] || [];
      const lowerAnswer = answer.toLowerCase();

      // Check how many keywords were matched
      const matched = keywords.filter(word => lowerAnswer.includes(word));
      
      // Basic scoring for this answer
      let answerScore = 0;
      if (answer.trim().length > 0) {
        // Base score for writing something
        answerScore = 45;
        // Word count bonus
        const words = answer.trim().split(/\s+/).length;
        answerScore += Math.min(20, Math.floor(words / 2)); // up to +20 points for word count

        // Keyword matches bonus
        if (matched.length > 0) {
          answerScore += Math.min(35, matched.length * 12); // +12 per keyword, cap at +35
        }
      }

      answerScore = Math.min(100, answerScore);
      totalScore += answerScore;

      // Question specific feedback
      const questionNum = i + 1;
      if (matched.length > 0) {
        comments.push(`Q${questionNum} Feedback: Strong answer alignment. Successfully covered key concepts: ${matched.slice(0, 3).join(', ')}.`);
      } else if (answer.trim().length > 10) {
        comments.push(`Q${questionNum} Feedback: Answer was received but missed critical technical references such as: ${keywords.slice(0, 2).join(', ')}.`);
      } else {
        comments.push(`Q${questionNum} Feedback: Answer was missing or too brief to grade.`);
      }
    }

    const averageScore = Math.round(totalScore / 4);

    setScoreFeedback({
      score: averageScore,
      comments,
      rating: averageScore >= 85 ? 'Highly Recommended' : averageScore >= 70 ? 'Recommended with feedback' : 'Needs practice'
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
                      <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Target Discipline</label>
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-300 focus:outline-none focus:border-violet-500/50 font-mono hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                          >
                            <span>{role}</span>
                            <span className="text-[10px] text-gray-500">&bull;&bull;&bull;</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-full min-w-[200px]">
                          <div className="space-y-1">
                            <p className="text-[9px] text-cyan-400 font-mono uppercase tracking-widest pb-1 border-b border-white/5 mb-1.5">Select Skills Path</p>
                            {[
                              'AI Engineer',
                              'ML Engineer',
                              'AI/ML Engineer',
                              'Full Stack Developer',
                              'Frontend Developer',
                              'Backend Developer',
                              'Cybersecurcity',
                              'DevOps Engineer'
                            ].map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => {
                                  setRole(skill);
                                  setIsPopoverOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all hover:bg-violet-600/30 hover:text-white cursor-pointer",
                                  role === skill 
                                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/20" 
                                    : "text-gray-400"
                                )}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
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
                  const senderName = isBot ? 'Aria (Google Recruiter)' : (user?.username || 'You');
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} mb-2`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-mono text-gray-500">
                        <span className="font-semibold text-gray-400">{senderName}</span>
                        {isBot ? (
                          <span className="px-1.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded">AI AGENT</span>
                        ) : (
                          <span className="px-1.5 bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 rounded">CANDIDATE</span>
                        )}
                      </div>
                      
                      <div className={`flex gap-3.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
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
                      </div>
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
