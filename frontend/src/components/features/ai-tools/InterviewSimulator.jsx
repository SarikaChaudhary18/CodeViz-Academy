import React, { useState } from 'react';
import { Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';

const INTERVIEW_QUESTIONS = [
  {
    id: 1,
    question: "Explain the differences between REST and GraphQL. When would you prefer one over the other?",
  },
  {
    id: 2,
    question: "What is horizontal sharding in database scalability, and how do you resolve partition key hot-spotting?",
  },
  {
    id: 3,
    question: "How does the 'this' keyword bind dynamically in JavaScript vs lexical bindings in arrow functions?",
  }
];

export default function InterviewSimulator() {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [aiNextQuestion, setAiNextQuestion] = useState('');

  const startSimulator = () => {
    setActiveQuestionIdx(0);
    const randomStartQuestion = INTERVIEW_QUESTIONS[Math.floor(Math.random() * INTERVIEW_QUESTIONS.length)].question;
    setCurrentQuestion(randomStartQuestion);
    setAnswerText('');
    setFeedback(null);
    setHistory([]);
    setAiNextQuestion('');
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    const question = currentQuestion;

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'interview-simulator',
        payload: {
          role: 'Fullstack Engineer',
          company: 'Google',
          history: history,
          lastAnswer: answerText
        }
      });

      if (res.status === 'success' || res.data) {
        const result = res.data;
        const evaluationScore = Math.min(100, Math.round((result.score || 8) * 10));

        setFeedback({
          score: evaluationScore,
          strengths: result.evaluation || 'Feedback processed successfully.',
          gaps: result.nextQuestion || 'Click Next Question to continue.',
          verdict: evaluationScore >= 70 ? 'Strong Answer.' : 'Needs Improvement.'
        });
        
        setAiNextQuestion(result.nextQuestion || 'Tell me about a challenging technical problem you solved.');

        // Save progress history state
        setHistory(prev => [...prev, { q: question, a: answerText, score: evaluationScore }]);
      }
    } catch (err) {
      console.error('Failed to run Interview Simulator:', err.message);
      setFeedback({
        score: 0,
        strengths: "Verification failed. Check environment configurations.",
        gaps: "Ensure the NVIDIA/Gemini API key is configured.",
        verdict: "Evaluation failed."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeQuestionIdx + 1 < 3) {
      setActiveQuestionIdx(prev => prev + 1);
      setCurrentQuestion(aiNextQuestion || INTERVIEW_QUESTIONS[Math.min(2, activeQuestionIdx + 1)].question);
      setAnswerText('');
      setFeedback(null);
    } else {
      setActiveQuestionIdx(null); // Finished
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Sparkles className="text-orange-600 w-8 h-8 animate-pulse" />
          AI INTERVIEW SIMULATOR
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Simulate full technical and conversational interviews with real-time feedback
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          {activeQuestionIdx === null ? (
            /* Intro State */
            <motion.div 
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
                <Volume2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-950">System Assessment Ready</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                  Start an interactive session. The simulator will present questions, audit your conceptual answers, and diagnose scoring metrics.
                </p>
              </div>
              <button
                onClick={startSimulator}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
              >
                INITIALIZE SIMULATION
              </button>
            </motion.div>
          ) : (
            /* Active Simulation State */
            <motion.div 
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              {/* Progress bar */}
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 border-b border-zinc-100 pb-3">
                <span>QUESTION {activeQuestionIdx + 1} OF {INTERVIEW_QUESTIONS.length}</span>
                <button onClick={() => setActiveQuestionIdx(null)} className="text-zinc-400 hover:text-zinc-650 font-bold uppercase">Exit</button>
              </div>

              {/* Question card */}
              <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-2xl flex gap-3 items-start">
                <Volume2 className="text-orange-600 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-zinc-900 font-extrabold leading-relaxed">
                  {currentQuestion}
                </p>
              </div>

              {/* User Answer form */}
              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your response here..."
                  disabled={submitting || feedback !== null}
                  className="w-full h-32 p-4 font-mono text-xs border border-zinc-200 rounded-2xl focus:outline-none focus:border-orange-500 bg-white text-zinc-955 leading-relaxed"
                />

                {!feedback && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !answerText.trim()}
                      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Evaluating response...' : 'Submit Answer'}
                    </button>
                  </div>
                )}
              </form>

              {/* Feedback results */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t border-zinc-100"
                >
                  <div className="flex justify-between items-center bg-orange-50/50 border border-orange-100 rounded-xl p-4">
                    <span className="text-xs font-mono font-bold text-orange-950 flex items-center gap-1.5"><ShieldAlert size={14} /> AI AUDIT LOG</span>
                    <span className="text-lg font-black font-mono text-orange-600">{feedback.score}% Accuracy</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-zinc-50 border border-zinc-155 rounded-xl">
                      <span className="text-[9px] font-mono text-green-600 font-bold block uppercase">AI Assessment</span>
                      <p className="text-[11px] text-zinc-700 leading-normal mt-1">{feedback.strengths}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-155 rounded-xl">
                      <span className="text-[9px] font-mono text-amber-600 font-bold block uppercase">Follow-up / Recommendation</span>
                      <p className="text-[11px] text-zinc-700 leading-normal mt-1">{feedback.gaps}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-mono text-zinc-500 italic">Verdict: {feedback.verdict}</span>
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1 px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {activeQuestionIdx + 1 === INTERVIEW_QUESTIONS.length ? 'Finish Session' : 'Next Question'} &rarr;
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
