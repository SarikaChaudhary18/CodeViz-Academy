import React, { useState } from 'react';
import { Play, Sparkles, HelpCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const RACE_TASKS = [
  { id: 1, question: "Identify the time complexity of searching an element in a Hash Map.", answer: "O(1)" },
  { id: 2, question: "Which sorting algorithm has a worst-case time complexity of O(N log N)?", answer: "Merge Sort" },
  { id: 3, question: "What memory structure does Depth-First Search use implicitly?", answer: "Stack" }
];

export default function AlgorithmRace() {
  const [taskIdx, setTaskIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [raceFinished, setRaceFinished] = useState(false);
  const [score, setScore] = useState(0);

  const activeTask = RACE_TASKS[taskIdx];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim().toLowerCase() === activeTask.answer.toLowerCase()) {
      setScore(prev => prev + 1);
    }
    
    if (taskIdx + 1 < RACE_TASKS.length) {
      setTaskIdx(prev => prev + 1);
      setInputVal('');
    } else {
      setRaceFinished(true);
    }
  };

  const resetRace = () => {
    setTaskIdx(0);
    setInputVal('');
    setRaceFinished(false);
    setScore(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Sparkles className="text-orange-600 w-8 h-8" />
          ALGORITHM SPEED RACE
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Racer against the timer to parse core complex outputs
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm text-center">
        {!raceFinished ? (
          <div className="space-y-6 text-left">
            {/* Race track progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase font-bold">
                <span>Racetrack Position</span>
                <span>{Math.round((taskIdx / RACE_TASKS.length) * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden border border-zinc-200 p-0.5">
                <div 
                  className="bg-orange-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(taskIdx / RACE_TASKS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-orange-600 uppercase font-bold block">Current Hurdle</span>
              <p className="text-xs text-zinc-800 font-extrabold leading-relaxed">{activeTask.question}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type answer here..."
                required
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-950 font-mono"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                >
                  Clear Obstacle &rarr;
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-orange-600">
              <CheckCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-950">Race Completed</h3>
              <p className="text-xs text-zinc-550 max-w-sm mx-auto leading-relaxed">
                You passed {score} out of {RACE_TASKS.length} obstacles on the racetrack!
              </p>
            </div>
            <button
              onClick={resetRace}
              className="px-6 py-2.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            >
              RACE AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
