import React, { useState } from 'react';
import { HelpCircle, Clock, CheckCircle2, Award, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUIZ_LIST = [
  {
    id: 1,
    title: 'JavaScript Closures & Scopes',
    topic: 'Language / JS',
    questionsCount: 5,
    duration: '10 mins',
    difficulty: 'Medium',
    questions: [
      {
        q: "What is a closure in JavaScript?",
        options: [
          "A function bundled together with references to its surrounding state (lexical environment).",
          "A method to close an active browser tab.",
          "A variable declaration that overrides global scope.",
          "A data structure used to release system thread locks."
        ],
        answer: 0
      },
      {
        q: "Which keyword does NOT create block scope?",
        options: ["let", "var", "const", "None of the above"],
        answer: 1
      },
      {
        q: "What does the lexical environment contain?",
        options: ["Local variables and reference to the parent environment.", "Just functions definitions.", "Only the variables declared with var.", "The system garbage collector pointers."],
        answer: 0
      },
      {
        q: "Can a closure access variables defined in outer functions after they return?",
        options: ["Yes, closures hold dynamic reference references.", "No, function stack frames are deleted.", "Only if declared as global.", "Only in Node.js environments."],
        answer: 0
      },
      {
        q: "What will `console.log(typeof closures)` print if closures is not defined?",
        options: ["undefined", "ReferenceError", "null", "TypeError"],
        answer: 1
      }
    ]
  },
  {
    id: 2,
    title: 'Binary Tree Traversals',
    topic: 'DSA / Algorithms',
    questionsCount: 3,
    duration: '6 mins',
    difficulty: 'Hard',
    questions: [
      {
        q: "What is the pre-order traversal sequence of a tree?",
        options: ["Root -> Left -> Right", "Left -> Root -> Right", "Left -> Right -> Root", "Right -> Root -> Left"],
        answer: 0
      },
      {
        q: "Which traversal explores siblings before children?",
        options: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "In-order traversal", "Post-order traversal"],
        answer: 0
      },
      {
        q: "What is the time complexity of searching a value in a balanced BST?",
        options: ["O(log N)", "O(N)", "O(1)", "O(N log N)"],
        answer: 0
      }
    ]
  }
];

export default function Quizzes() {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === activeQuiz.questions[currentQuestionIndex].answer) {
      setScore(prev => prev + 1);
    }
    
    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const quitQuiz = () => {
    setActiveQuiz(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <HelpCircle className="text-orange-600 w-8 h-8" />
          CONCEPT QUIZZES
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Validate core understanding of language runtimes and data structures
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!activeQuiz ? (
          /* Quiz List View */
          <motion.div 
            key="list" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {QUIZ_LIST.map((quiz) => (
              <div 
                key={quiz.id}
                className="bg-white rounded-2xl border border-zinc-200 hover:border-orange-250 p-6 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-[9px] font-bold text-orange-600 font-mono rounded-full">
                      {quiz.topic}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase">{quiz.difficulty}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-950 tracking-tight mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                    Check your algorithmic scopes, parameter reference mappings, and execution flow constraints.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-100 mt-4">
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1"><HelpCircle size={12} /> {quiz.questionsCount} MCQs</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {quiz.duration}</span>
                  </div>
                  <button 
                    onClick={() => startQuiz(quiz)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-mono font-bold transition-all shadow-sm"
                  >
                    Start Quiz <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          /* Active Quiz Interactive View */
          <motion.div 
            key="active" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }}
            className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-lg"
          >
            {!quizFinished ? (
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
                  <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
                  <div className="flex-1 bg-zinc-100 h-1.5 rounded-full overflow-hidden ml-4">
                    <div 
                      className="bg-orange-600 h-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="text-sm font-extrabold text-zinc-900 leading-normal bg-zinc-50/50 p-4 rounded-xl border border-zinc-150">
                  {activeQuiz.questions[currentQuestionIndex].q}
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {activeQuiz.questions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full p-4 text-left text-xs rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedOption === idx
                          ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-bold'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800'
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedOption === idx ? 'border-orange-600 bg-orange-600' : 'border-zinc-300'
                      }`}>
                        {selectedOption === idx && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Button */}
                <div className="flex justify-end pt-4">
                  <button
                    disabled={selectedOption === null}
                    onClick={handleNext}
                    className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-sm ${
                      selectedOption === null 
                        ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer'
                    }`}
                  >
                    {currentQuestionIndex + 1 === activeQuiz.questions.length ? 'Finish Quiz' : 'Next Question'} &rarr;
                  </button>
                </div>
              </div>
            ) : (
              /* Quiz Score Summary Screen */
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 rounded-full bg-orange-50 border-2 border-orange-100 flex items-center justify-center mx-auto text-orange-600">
                  <CheckCircle2 size={40} />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-zinc-950">QUIZ COMPLETION METRICS</h2>
                  <p className="text-xs text-zinc-500 font-mono">{activeQuiz.title}</p>
                </div>

                <div className="max-w-[280px] bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mx-auto">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Final Accuracy Score</div>
                  <div className="text-4xl font-black text-orange-600 mt-2 font-mono">
                    {score} / {activeQuiz.questions.length}
                  </div>
                  <div className="text-[10px] text-zinc-650 font-mono mt-3 font-semibold">
                    {score === activeQuiz.questions.length ? 'Perfect Score! Core synced!' : 
                     score >= activeQuiz.questions.length / 2 ? 'Passed. Some scope overrides required.' : 
                     'Underperforming. Re-auditing recommended.'}
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-6">
                  <button
                    onClick={() => startQuiz(activeQuiz)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-55 text-zinc-700 hover:text-zinc-950 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
                  >
                    <RotateCcw size={12} /> Retry Quiz
                  </button>
                  <button
                    onClick={quitQuiz}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
                  >
                    Done & Exit
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
