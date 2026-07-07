import React, { useState } from 'react';
import { Play, Sparkles, HelpCircle, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../../../lib/api';

const TOPICS = ['Big O Complexity', 'Sorting Algorithms', 'Data Structure Mechanics', 'Graph Traversals'];

export default function AlgorithmRace() {
  const [setupMode, setSetupMode] = useState(true);
  const [topic, setTopic] = useState('Big O Complexity');
  const [loading, setLoading] = useState(false);
  const [tasksList, setTasksList] = useState([]);
  
  const [taskIdx, setTaskIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [raceFinished, setRaceFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const startRace = async () => {
    setLoading(true);
    setSetupMode(false);
    setTasksList([]);
    setTaskIdx(0);
    setInputVal('');
    setRaceFinished(false);
    setScore(0);
    setErrorMsg('');

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'game-algo-race',
        payload: { topic }
      });

      if (res.status === 'success' || res.data) {
        setTasksList(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load algorithm race:', err.message);
      setSetupMode(true);
    } finally {
      setLoading(false);
    }
  };

  const activeTask = tasksList[taskIdx];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeTask) return;

    const userAns = inputVal.trim().toLowerCase();
    const correctAns = activeTask.answer.trim().toLowerCase();

    // Check if user answer matches correct answer
    if (userAns === correctAns) {
      setScore(prev => prev + 1);
      setErrorMsg('');
      
      // Move to next question or complete race
      if (taskIdx + 1 < tasksList.length) {
        setTaskIdx(prev => prev + 1);
        setInputVal('');
      } else {
        setRaceFinished(true);
      }
    } else {
      setErrorMsg(`Incorrect answer! Tips: Verify notations (like O(N), Stack, etc.) and check spelling.`);
    }
  };

  const resetRace = () => {
    setSetupMode(true);
    setTasksList([]);
    setRaceFinished(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Sparkles className="text-orange-600 w-8 h-8 animate-pulse" />
            ALGORITHM SPEED RACE
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Race against the timer to parse core complex outputs
          </p>
        </div>

        {!setupMode && (
          <button
            onClick={resetRace}
            className="px-3.5 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-xs font-mono font-bold text-zinc-700 rounded-xl transition-all cursor-pointer"
          >
            Reset Track
          </button>
        )}
      </div>

      {/* 1. Setup Mode */}
      {setupMode && !loading && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm max-w-lg mx-auto text-left space-y-5">
          <div className="text-center pb-3 border-b border-zinc-100">
            <Sparkles size={36} className="text-orange-600 mx-auto animate-bounce mb-2" />
            <h2 className="text-base font-extrabold text-zinc-950">Race Track Categories</h2>
            <p className="text-xs text-zinc-550 mt-1">Select a category below. AI will generate 3 algorithmic speed obstacles.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">Track Topic</label>
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
            onClick={startRace}
            className="w-full h-11 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            ENTER THE RACE &rarr;
          </button>
        </div>
      )}

      {/* Loading Challenge */}
      {loading && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-mono animate-pulse">Generating racetrack questions for category: "{topic}"...</p>
        </div>
      )}

      {/* 2. Race Mode */}
      {!setupMode && !loading && !raceFinished && activeTask && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm text-center">
          <div className="space-y-6 text-left">
            {/* Race track progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase font-bold">
                <span>Racetrack Position (Obstacle {taskIdx + 1} of {tasksList.length})</span>
                <span>{Math.round((taskIdx / tasksList.length) * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden border border-zinc-200 p-0.5">
                <div 
                  className="bg-orange-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(taskIdx / tasksList.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="p-5 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-1">
              <span className="text-[9px] font-mono text-orange-600 uppercase font-bold block">Current Obstacle</span>
              <p className="text-xs text-zinc-800 font-extrabold leading-relaxed font-mono">{activeTask.question}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => { setInputVal(e.target.value); setErrorMsg(''); }}
                placeholder="Type your answer (e.g. O(N), Stack, Merge Sort)..."
                required
                className="w-full h-11 px-4 rounded-xl border border-zinc-250 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-950 font-mono"
              />

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[10px] font-mono rounded-xl">
                  {errorMsg}
                </div>
              )}

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
        </div>
      )}

      {/* 3. Completed Mode */}
      {raceFinished && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm text-center max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-orange-600">
            <CheckCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-zinc-950">Race Completed!</h3>
            <p className="text-xs text-zinc-550 leading-relaxed font-mono bg-zinc-50 border border-zinc-150 p-4 rounded-2xl">
              You cleared all {score} obstacles successfully and crossed the finish line! (+120 XP)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={resetRace}
              className="py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer animate-pulse"
            >
              RACE AGAIN
            </button>
            <button
              onClick={() => window.history.back()}
              className="py-2.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            >
              EXIT ARENA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
