import React, { useState } from 'react';
import { Target, HelpCircle, CheckCircle, RefreshCw, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { api } from '../../../lib/api';

const TOPICS = ['Loops & Iteration', 'Array Methods', 'Logical Scope', 'Object References', 'Async & Promises'];

export default function BugHunt() {
  const [topic, setTopic] = useState('Loops & Iteration');
  const [loading, setLoading] = useState(false);
  const [activeQuest, setActiveQuest] = useState(null); // { title, codeLines, buggyLineNumber, explanation }
  
  const [selectedLine, setSelectedLine] = useState(null);
  const [outcome, setOutcome] = useState(null);

  const startHunt = async () => {
    setLoading(true);
    setSelectedLine(null);
    setOutcome(null);
    setActiveQuest(null);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'game-bug-hunt',
        payload: { topic }
      });

      if (res.status === 'success' || res.data) {
        setActiveQuest(res.data);
      }
    } catch (err) {
      console.error('Failed to spawn bug hunt challenge:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!activeQuest) return;

    if (selectedLine === activeQuest.buggyLineNumber) {
      setOutcome({ correct: true, msg: `Accusation Correct! ${activeQuest.explanation} (+100 XP)` });
    } else {
      setOutcome({ correct: false, msg: "Incorrect line selected. Scan parameter bounds, comparison operators, and references closely!" });
    }
  };

  const resetGame = () => {
    setSelectedLine(null);
    setOutcome(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Target className="text-orange-600 w-8 h-8 animate-pulse" />
            BUG HUNT ARENA
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Locate and target semantic compiler faults inside algorithms
          </p>
        </div>

        {activeQuest && (
          <button
            onClick={() => setActiveQuest(null)}
            className="px-3.5 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-xs font-mono font-bold text-zinc-700 rounded-xl transition-all cursor-pointer"
          >
            Reset Topic
          </button>
        )}
      </div>

      {/* 1. Setup Mode */}
      {!activeQuest && !loading && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm max-w-lg mx-auto text-left space-y-5">
          <div className="text-center pb-3 border-b border-zinc-100">
            <Target size={36} className="text-orange-600 mx-auto animate-bounce mb-2" />
            <h2 className="text-base font-extrabold text-zinc-950">Select Code Domain</h2>
            <p className="text-xs text-zinc-550 mt-1">AI will inject a subtle logic error into code belonging to the chosen domain</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">Domain Topic</label>
            <div className="grid grid-cols-1 gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`py-3 px-4 text-xs font-mono font-bold border rounded-xl transition-all cursor-pointer flex justify-between items-center ${
                    topic === t ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-zinc-200 text-zinc-650 hover:bg-zinc-50'
                  }`}
                >
                  <span>{t}</span>
                  <ArrowRight size={14} className={topic === t ? 'text-orange-600' : 'text-zinc-300'} />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startHunt}
            className="w-full h-11 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            GENERATE CODE PUZZLE &rarr;
          </button>
        </div>
      )}

      {/* Loading Challenge */}
      {loading && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-mono animate-pulse">Injecting a subtle semantic bug into "{topic}"...</p>
        </div>
      )}

      {/* 2. Game Mode */}
      {activeQuest && !loading && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-555 border-b border-zinc-100 pb-3">
              <span className="font-extrabold uppercase text-orange-600 flex items-center gap-1">
                <Activity size={12} /> PUZZLE: {activeQuest.title}
              </span>
              <button 
                onClick={resetGame} 
                className="flex items-center gap-1 text-zinc-500 hover:text-orange-600 font-bold uppercase transition-colors"
              >
                <RefreshCw size={10} /> Clear Selection
              </button>
            </div>

            {/* Code selection list */}
            <div className="font-mono text-xs text-zinc-800 space-y-0.5 text-left bg-zinc-50 p-4 border border-zinc-150 rounded-xl overflow-x-auto">
              {(activeQuest.codeLines || []).map((lineText, index) => {
                const lineNum = index + 1;
                const isSelected = selectedLine === lineNum;
                return (
                  <button
                    key={index}
                    disabled={outcome?.correct}
                    onClick={() => { setSelectedLine(lineNum); setOutcome(null); }}
                    className={`w-full flex items-center py-1 pl-2 rounded transition-colors text-left cursor-pointer disabled:cursor-not-allowed ${
                      isSelected ? 'bg-orange-100/60 border-l-4 border-orange-600 font-bold' : 'hover:bg-zinc-100'
                    }`}
                  >
                    <span className="w-6 text-[10px] text-zinc-400 select-none">{lineNum}</span>
                    <span className="whitespace-pre">{lineText}</span>
                  </button>
                );
              })}
            </div>

            {/* Submission and outcome feedback */}
            {outcome ? (
              <div className={`p-4 rounded-xl border text-xs text-left leading-normal flex gap-2.5 items-start ${
                outcome.correct 
                  ? 'bg-green-50 border-green-150 text-green-700 font-mono' 
                  : 'bg-red-50 border-red-150 text-red-700 font-mono'
              }`}>
                {outcome.correct ? (
                  <CheckCircle size={16} className="shrink-0 mt-0.5 text-green-600" />
                ) : (
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-650" />
                )}
                <div className="space-y-2">
                  <p>{outcome.msg}</p>
                  {outcome.correct && (
                    <button
                      onClick={startHunt}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold transition-all shadow-sm block cursor-pointer"
                    >
                      Next Bug Hunt Puzzle &rarr;
                    </button>
                  )}
                </div>
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
      )}
    </div>
  );
}
