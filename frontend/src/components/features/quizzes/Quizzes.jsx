import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, CheckCircle2, Award, ArrowRight, RotateCcw, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quizzes');
      if (res.status === 'success' || Array.isArray(res.data)) {
        setQuizzes(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch quizzes list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizSummary) => {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/${quizSummary.id}/questions`);
      if (res.status === 'success' || res.data) {
        setActiveQuiz(quizSummary);
        setQuestions(res.data.questions || []);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setQuizFinished(false);
        setXpEarned(0);
      }
    } catch (err) {
      console.error('Failed to load quiz questions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = async () => {
    let currentScore = score;
    if (selectedOption === questions[currentQuestionIndex].answer) {
      currentScore += 1;
      setScore(currentScore);
    }
    
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Quiz finished, submit to backend
      setSubmitLoading(true);
      try {
        const submitRes = await api.post(`/quizzes/${activeQuiz.id}/submit`, {
          score: currentScore,
          totalQuestions: questions.length
        });
        if (submitRes.status === 'success' || submitRes.xpGained !== undefined) {
          setXpEarned(submitRes.xpGained || 0);
        }
      } catch (err) {
        console.error('Failed to submit quiz score:', err.message);
      } finally {
        setSubmitLoading(false);
        setQuizFinished(true);
        fetchQuizzes();
      }
    }
  };

  const quitQuiz = () => {
    setActiveQuiz(null);
    setQuestions([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <HelpCircle className="text-orange-600 w-8 h-8" />
          CONCEPT QUIZZES
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Validate core understanding of DSA structures, system design, and AI models
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!activeQuiz ? (
          /* Quiz List View */
          loading ? (
            <div className="py-20 text-center text-zinc-550 font-mono text-xs animate-pulse">
              <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto mb-3" />
              Fetching dynamic quiz categories...
            </div>
          ) : (
            <motion.div 
              key="list" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {quizzes.map((quiz) => (
                <div 
                  key={quiz.id}
                  className="bg-white rounded-2xl border border-zinc-200 hover:border-orange-250 p-6 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2.5 py-0.5 bg-orange-55 border border-orange-100 text-[9px] font-bold text-orange-600 font-mono rounded-full uppercase">
                        {quiz.topic}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase">{quiz.difficulty}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-zinc-950 tracking-tight mb-2">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                      Evaluate your parameters, algorithms complexity boundary locks, and theoretical knowledge.
                    </p>

                    {quiz.bestScore !== null && (
                      <div className="p-2 bg-green-50 border border-green-200 text-[10px] text-green-700 font-mono font-bold rounded-lg mb-2">
                        Best Score: {quiz.bestScore} / 10 correct
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-zinc-100 mt-4">
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1"><HelpCircle size={12} /> 10 MCQs pool</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> 10 mins</span>
                    </div>
                    <button 
                      onClick={() => startQuiz(quiz)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Start Quiz <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )
        ) : (
          /* Active Quiz Interactive View */
          <motion.div 
            key="active" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }}
            className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-lg"
          >
            {loading ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                Generating quiz question list...
              </div>
            ) : !quizFinished ? (
              /* Question block */
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-orange-600 font-bold uppercase">{activeQuiz.topic}</span>
                    <h2 className="text-base font-bold text-zinc-950 leading-tight mt-0.5">{activeQuiz.title}</h2>
                  </div>
                  <button 
                    onClick={quitQuiz}
                    className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-650"
                  >
                    Cancel
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="flex-1 bg-zinc-100 h-1.5 rounded-full overflow-hidden ml-4">
                    <div 
                      className="bg-orange-600 h-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="text-sm font-extrabold text-zinc-900 leading-snug">
                  {questions[currentQuestionIndex]?.q}
                </div>

                {/* Options list */}
                <div className="grid grid-cols-1 gap-3">
                  {questions[currentQuestionIndex]?.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`p-4 rounded-2xl border text-xs font-semibold text-left transition-all ${
                        selectedOption === idx
                          ? 'border-orange-500 bg-orange-50/20 text-orange-600 font-bold'
                          : 'border-zinc-200 hover:border-zinc-300 text-zinc-800'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Bottom Bar */}
                <div className="flex justify-end pt-4 border-t border-zinc-100">
                  <button
                    onClick={handleNext}
                    disabled={selectedOption === null}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-150 disabled:text-zinc-400 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {currentQuestionIndex + 1 === questions.length ? 'Submit Quiz' : 'Next Question'} <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ) : (
              /* Quiz Finished Summary Block */
              <div className="text-center py-8 space-y-6 max-w-md mx-auto">
                <div className="w-16 h-16 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center mx-auto text-orange-600">
                  <Award size={32} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-black text-zinc-950">Quiz Completed!</h2>
                  <p className="text-xs text-zinc-550 font-mono">
                    Evaluation finalized by Canonical system checks.
                  </p>
                </div>

                {/* Metrics */}
                <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl grid grid-cols-2 gap-4">
                  <div className="text-left border-r border-zinc-150 pr-4">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block">Correct Responses</span>
                    <span className="text-xl font-mono font-black text-orange-600">{score} <span className="text-xs text-zinc-400 font-normal">/ {questions.length}</span></span>
                  </div>
                  <div className="text-left pl-4">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block">XP Rewarded</span>
                    <span className="text-xl font-mono font-black text-green-600">+{xpEarned} XP</span>
                  </div>
                </div>

                {/* Info spaced repetition */}
                <div className="text-[10px] text-zinc-500 font-mono bg-orange-50 border border-orange-100 p-3 rounded-xl leading-normal text-left">
                  💡 This topic has been queued in your **Spaced Repetition Decay Checklist**. Its decay curve has reset to 100% strength.
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center pt-2">
                  <button 
                    onClick={() => startQuiz(activeQuiz)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-mono font-bold text-zinc-700 transition-all cursor-pointer"
                  >
                    <RotateCcw size={12} /> Retake
                  </button>
                  <button 
                    onClick={quitQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Catalog Home
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
