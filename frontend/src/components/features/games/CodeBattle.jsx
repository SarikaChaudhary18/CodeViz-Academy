import React, { useState, useEffect, useRef } from 'react';
import { Swords, Code, Play, CheckCircle2, User, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';

const TOPICS = ['Arrays', 'Strings', 'Sorting', 'Recursion', 'Dynamic Programming', 'Stacks & Queues'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function CodeBattle() {
  const [setupMode, setSetupMode] = useState(true);
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('Medium');
  
  const [loadingGame, setLoadingGame] = useState(false);
  const [battleActive, setBattleActive] = useState(false);
  const [question, setQuestion] = useState('');
  const [userCode, setUserCode] = useState('');
  const [peerCode, setPeerCode] = useState('');
  const [testCase, setTestCase] = useState(null);
  
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [outcome, setOutcome] = useState(null); // { won: boolean, msg: string }
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // References for typing simulation
  const aiCodeRef = useRef('');
  const intervalRef = useRef(null);

  const startBattle = async () => {
    setLoadingGame(true);
    setValidationError(null);
    setOutcome(null);
    setPeerCode('');

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'game-code-battle',
        payload: { topic, difficulty }
      });

      if (res.status === 'success' || res.data) {
        const data = res.data;
        setQuestion(data.question);
        setUserCode(data.starterCode);
        setTestCase(data.testCase);
        aiCodeRef.current = data.aiOpponentSolution || '// AI solution completed.';
        
        setSetupMode(false);
        setBattleActive(true);
        setOpponentProgress(0);

        // Start typing simulation for the AI opponent
        simulateAIOpponent(data.aiOpponentSolution);
      }
    } catch (err) {
      console.error('Failed to load code battle:', err.message);
      setValidationError("Failed to generate challenge. Please try again.");
    } finally {
      setLoadingGame(false);
    }
  };

  const simulateAIOpponent = (fullSolution) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const codeLength = fullSolution.length;
    let charsTyped = 0;
    
    // AI takes around 45 seconds to type (approx 150 increments)
    const totalSteps = 150;
    const charsPerStep = Math.ceil(codeLength / totalSteps);
    let stepCount = 0;

    intervalRef.current = setInterval(() => {
      stepCount++;
      const currentProgress = Math.min(Math.round((stepCount / totalSteps) * 100), 100);
      setOpponentProgress(currentProgress);

      charsTyped = Math.min(charsTyped + charsPerStep, codeLength);
      setPeerCode(fullSolution.substring(0, charsTyped) + (charsTyped < codeLength ? '_' : ''));

      if (stepCount >= totalSteps) {
        clearInterval(intervalRef.current);
      }
    }, 300); // 300ms intervals * 150 steps = 45 seconds
  };

  const submitSolution = async () => {
    if (validating) return;
    setValidating(true);
    setValidationError(null);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'game-code-validate',
        payload: {
          question,
          userCode,
          testCase
        }
      });

      if (res.status === 'success' || res.data) {
        const { isCorrect, error } = res.data;
        if (isCorrect) {
          // Check who submitted first
          if (opponentProgress >= 100) {
            setOutcome({ won: false, msg: "Your solution is correct, but the AI Opponent compiled and submitted first! (+50 XP)" });
          } else {
            setOutcome({ won: true, msg: "Excellent! You solved the challenge and beat the AI opponent! (+150 XP)" });
          }
          if (intervalRef.current) clearInterval(intervalRef.current);
          setBattleActive(false);
        } else {
          setValidationError(error || "Test case verification failed. Check return values.");
        }
      }
    } catch (err) {
      console.error('Validation error:', err.message);
      setValidationError("API validation error. Make sure your syntax is correct.");
    } finally {
      setValidating(false);
    }
  };

  const handleGiveUp = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setOutcome({ won: false, msg: "You gave up. The AI opponent wins this match." });
    setBattleActive(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Swords className="text-orange-600 w-8 h-8 animate-pulse" />
            AI CODE DUEL ARENA
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Race against the AI coder typing in real-time
          </p>
        </div>

        {!setupMode && (
          <button
            onClick={() => { setSetupMode(true); setBattleActive(false); setOutcome(null); }}
            className="px-3.5 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-xs font-mono font-bold text-zinc-700 rounded-xl transition-all cursor-pointer"
          >
            Reset Arena
          </button>
        )}
      </div>

      {/* 1. Setup Mode */}
      {setupMode && !loadingGame && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm max-w-xl mx-auto text-left space-y-5">
          <div className="text-center pb-3 border-b border-zinc-100">
            <Swords size={36} className="text-orange-600 mx-auto animate-bounce mb-2" />
            <h2 className="text-base font-extrabold text-zinc-950">Configure AI Coding Duel</h2>
            <p className="text-xs text-zinc-550 mt-1">Select your parameter preferences to spawn a dynamic code challenge</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">Select Topic</label>
            <div className="grid grid-cols-2 gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`py-2 text-xs font-mono font-bold border rounded-xl transition-all cursor-pointer ${
                    topic === t ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-xs font-mono font-bold border rounded-xl transition-all cursor-pointer ${
                    difficulty === d ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {validationError && (
            <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs font-mono rounded-xl">
              {validationError}
            </div>
          )}

          <button
            onClick={startBattle}
            className="w-full h-11 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            SPAWN CHALLENGE & START &rarr;
          </button>
        </div>
      )}

      {/* Loading Challenge */}
      {loadingGame && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-mono animate-pulse">AI is generating a unique coding challenge for topic: "{topic}"...</p>
        </div>
      )}

      {/* 2. Battle Mode */}
      {battleActive && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Question / Status Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Status Panel */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-mono font-bold text-zinc-950 uppercase tracking-wider pb-2 border-b border-zinc-150">
                Match Progress
              </h3>

              <div className="space-y-3">
                {/* AI progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">AI Opponent Status:</span>
                    <span className="text-orange-600 font-bold">{opponentProgress >= 100 ? 'Submitted' : `Typing (${opponentProgress}%)`}</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200 p-0.5">
                    <div 
                      className="bg-orange-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${opponentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Match constraints */}
                <div className="flex justify-between items-center text-[10px] font-mono pt-1 bg-zinc-50 p-2 rounded-xl border border-zinc-150">
                  <span className="text-zinc-500">Topic:</span>
                  <span className="font-semibold text-zinc-800">{topic}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono bg-zinc-50 p-2 rounded-xl border border-zinc-150">
                  <span className="text-zinc-500">Difficulty:</span>
                  <span className="font-semibold text-orange-600">{difficulty}</span>
                </div>
              </div>
            </div>

            {/* Question description */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-mono font-bold text-zinc-950 uppercase tracking-wider pb-2 border-b border-zinc-150 flex items-center gap-1">
                <Code size={14} className="text-orange-600" /> Coding Objective
              </h3>
              <div className="text-xs text-zinc-755 leading-relaxed font-mono whitespace-pre-wrap max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {question}
              </div>
            </div>

            <button
              onClick={handleGiveUp}
              className="w-full py-2 border border-red-200 hover:bg-red-50 text-red-650 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
            >
              Give Up Match
            </button>
          </div>

          {/* Editors workspace */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
            
            {/* User Workspace */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <span className="text-[10px] font-mono font-bold text-zinc-950 uppercase">YOUR WORKSPACE</span>
                <span className="text-[9px] font-mono text-zinc-400">Player 1</span>
              </div>
              
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-72 p-3 font-mono text-xs border border-zinc-250 rounded-xl focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-900 leading-relaxed scrollbar-thin"
              />

              {validationError && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-[10px] font-mono rounded-xl leading-normal flex gap-1.5 items-start">
                  <AlertCircle size={12} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{validationError}</span>
                </div>
              )}

              <button
                onClick={submitSolution}
                disabled={validating}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {validating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compiling...
                  </>
                ) : 'Compile & Submit Solution'}
              </button>
            </div>

            {/* AI Opponent Workspace */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <span className="text-[10px] font-mono font-bold text-zinc-950 uppercase">AI OPPONENT WORKSPACE</span>
                <span className="text-[9px] font-mono text-orange-600 font-bold uppercase">Bot Coder</span>
              </div>
              
              <textarea
                value={peerCode}
                disabled
                className="w-full h-80 p-3 font-mono text-xs border border-zinc-200 rounded-xl bg-zinc-100 text-zinc-500 leading-relaxed cursor-not-allowed scrollbar-thin"
              />
            </div>

          </div>

        </div>
      )}

      {/* 3. Outcome / Conclusion Mode */}
      {outcome && !battleActive && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-md mx-auto text-center shadow-sm space-y-5">
          <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
            <Trophy size={28} className="animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-extrabold text-zinc-950">Battle Concluded</h2>
            <p className="text-xs text-zinc-550 leading-relaxed font-mono bg-zinc-50 p-4 border border-zinc-150 rounded-2xl">
              {outcome.msg}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => { setSetupMode(true); setOutcome(null); }}
              className="py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
            >
              DUEL AGAIN
            </button>
            <button
              onClick={() => window.history.back()}
              className="py-2.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            >
              EXIT LOBBY
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
