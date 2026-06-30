import React, { useState } from 'react';
import { Target, HelpCircle, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const BUG_QUESTIONS = [
  {
    id: 1,
    title: "Array Loop Termination",
    code: [
      "function printElements(arr) {",
      "  for (let i = 0; i <= arr.length; i++) { // Bug here?",
      "    console.log(arr[i]);",
      "  }",
      "}"
    ],
    buggyLine: 2,
    explanation: "Line 2 loops up to i <= arr.length, accessing undefined at index arr.length. It should be i < arr.length."
  }
];

export default function BugHunt() {
  const [activeQuest, setActiveQuest] = useState(BUG_QUESTIONS[0]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [outcome, setOutcome] = useState(null);

  const checkAnswer = () => {
    if (selectedLine === activeQuest.buggyLine) {
      setOutcome({ correct: true, msg: `Correct! ${activeQuest.explanation}` });
    } else {
      setOutcome({ correct: false, msg: "Incorrect line selected. Look closely at bounds terminations." });
    }
  };

  const resetGame = () => {
    setSelectedLine(null);
    setOutcome(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Target className="text-orange-600 w-8 h-8" />
          BUG HUNT ARENA
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Locate and target semantic compiler faults inside algorithms
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-555 border-b border-zinc-100 pb-3">
            <span>OBJECTIVE: SCAN & LOCATE BUGGY LINE</span>
            <button onClick={resetGame} className="flex items-center gap-1 text-orange-600 font-bold uppercase"><RefreshCw size={10} /> Reset</button>
          </div>

          {/* Code selection list */}
          <div className="font-mono text-xs text-zinc-800 space-y-0.5 text-left bg-zinc-50 p-4 border border-zinc-150 rounded-xl">
            {activeQuest.code.map((lineText, index) => {
              const lineNum = index + 1;
              const isSelected = selectedLine === lineNum;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedLine(lineNum)}
                  className={`w-full flex items-center py-1 pl-2 rounded transition-colors text-left cursor-pointer ${
                    isSelected ? 'bg-orange-100/60 border-l-4 border-orange-600 font-bold' : 'hover:bg-zinc-100'
                  }`}
                >
                  <span className="w-6 text-[10px] text-zinc-400 select-none">{lineNum}</span>
                  <span>{lineText}</span>
                </button>
              );
            })}
          </div>

          {/* Submission and outcome feedback */}
          {outcome ? (
            <div className={`p-4 rounded-xl border text-xs text-left leading-normal flex gap-2.5 items-start ${
              outcome.correct 
                ? 'bg-green-50 border-green-150 text-green-700' 
                : 'bg-red-50 border-red-150 text-red-700'
            }`}>
              {outcome.correct ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
              <p>{outcome.msg}</p>
            </div>
          ) : (
            <div className="flex justify-end pt-3">
              <button
                disabled={selectedLine === null}
                onClick={checkAnswer}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
              >
                Submit Accusation
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
