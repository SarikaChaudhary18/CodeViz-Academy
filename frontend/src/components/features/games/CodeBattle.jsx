import React, { useState } from 'react';
import { Swords, Code, Play, CheckCircle2, User, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CodeBattle() {
  const [battleActive, setBattleActive] = useState(false);
  const [answerCode, setAnswerCode] = useState('');
  const [outcome, setOutcome] = useState(null);
  const [opponentProgress, setOpponentProgress] = useState(0);

  const startBattle = () => {
    setBattleActive(true);
    setAnswerCode('function reverseString(str) {\n  // Type code here...\n}');
    setOutcome(null);
    setOpponentProgress(0);

    // Simulate opponent progress incrementally
    const interval = setInterval(() => {
      setOpponentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 1000);
  };

  const submitBattle = () => {
    if (opponentProgress >= 90) {
      setOutcome({ won: false, msg: "Opponent compiled first! You placed 2nd." });
    } else {
      setOutcome({ won: true, msg: "Excellent compilation speed! You won the duel (+150 XP)!" });
    }
    setBattleActive(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Swords className="text-orange-600 w-8 h-8 animate-bounce" />
          MULTIVERSE CODE BATTLE
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Compete in real-time speed coding duels with peers or bots
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm text-center">
        {!battleActive && !outcome && (
          <div className="py-10 space-y-6">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
              <Swords size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-950 font-sans">Ready for Combat</h3>
              <p className="text-xs text-zinc-550 max-w-sm mx-auto leading-relaxed">
                Matched against rank-comparable opponents. Resolve the coding problem as fast as possible.
              </p>
            </div>
            <button
              onClick={startBattle}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
            >
              FIND MATCH
            </button>
          </div>
        )}

        {battleActive && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 pb-4">
              {/* User progress bar */}
              <div>
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Your Status</span>
                <span className="text-xs font-bold text-zinc-800">Writing code...</span>
              </div>
              
              {/* Opponent progress bar */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>Opponent Status</span>
                  <span className="text-orange-600 font-bold">{opponentProgress}%</span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${opponentProgress}%` }} />
                </div>
              </div>
            </div>

            {/* Problem definition */}
            <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-orange-600 uppercase font-bold block">Active Objective</span>
              <p className="text-xs text-zinc-800 leading-relaxed font-semibold">
                Write a function `reverseString(str)` that reverses the characters of the input string and returns it.
              </p>
            </div>

            {/* Coding input */}
            <textarea
              value={answerCode}
              onChange={(e) => setAnswerCode(e.target.value)}
              className="w-full h-44 p-4 font-mono text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-900 leading-relaxed"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={submitBattle}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
              >
                COMPILE & SUBMIT
              </button>
            </div>
          </div>
        )}

        {outcome && (
          <div className="py-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-orange-600">
              <Trophy size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-950">Battle Concluded</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">{outcome.msg}</p>
            </div>

            <button
              onClick={() => setOutcome(null)}
              className="px-6 py-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            >
              BACK TO ARENA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
