import React, { useState } from 'react';
import { HelpCircle, CheckCircle, RefreshCw, Key, ShieldAlert, Sparkles, HelpCircle as HelpIcon, ArrowRight } from 'lucide-react';
import { api } from '../../../lib/api';

const TOPICS = ['JavaScript Closures', 'Prototypes & Inheritance', 'Event Loop & Queue', 'Asynchronous Promises', 'Variable Hoisting'];

export default function CodeEscapeRoom() {
  const [setupMode, setSetupMode] = useState(true);
  const [topic, setTopic] = useState('JavaScript Closures');
  const [loading, setLoading] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null); // { riddle, passcode, hint }
  
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const startEscape = async () => {
    setLoading(true);
    setSetupMode(false);
    setActiveRoom(null);
    setPasscode('');
    setErrorMsg('');
    setSolved(false);
    setShowHint(false);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'game-escape-room',
        payload: { topic }
      });

      if (res.status === 'success' || res.data) {
        setActiveRoom(res.data);
      }
    } catch (err) {
      console.error('Failed to spawn escape room:', err.message);
      setSetupMode(true);
    } finally {
      setLoading(false);
    }
  };

  const checkEscape = (e) => {
    e.preventDefault();
    if (!activeRoom) return;

    const userPass = passcode.trim().toLowerCase();
    const correctPass = activeRoom.passcode.trim().toLowerCase();

    if (userPass === correctPass) {
      setSolved(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Access Denied. Passcode incorrect. Trace parameter scopes and logic rules again.');
    }
  };

  const resetRoom = () => {
    setSetupMode(true);
    setActiveRoom(null);
    setSolved(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Key className="text-orange-600 w-8 h-8 animate-pulse" />
            ALGORITHMIC ESCAPE ROOM
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Solve programmatic riddles to unlock the virtual kernel doors
          </p>
        </div>

        {!setupMode && (
          <button
            onClick={resetRoom}
            className="px-3.5 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-xs font-mono font-bold text-zinc-700 rounded-xl transition-all cursor-pointer"
          >
            Reset Room
          </button>
        )}
      </div>

      {/* 1. Setup Mode */}
      {setupMode && !loading && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm max-w-lg mx-auto text-left space-y-5">
          <div className="text-center pb-3 border-b border-zinc-100">
            <Key size={36} className="text-orange-600 mx-auto animate-bounce mb-2" />
            <h2 className="text-base font-extrabold text-zinc-950">Lock Domain Configuration</h2>
            <p className="text-xs text-zinc-550 mt-1">AI will formulate a cryptographic riddle based on the select JS standard concepts.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">Lock Concept</label>
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
            onClick={startEscape}
            className="w-full h-11 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            LOCK PORT & ENTER &rarr;
          </button>
        </div>
      )}

      {/* Loading Challenge */}
      {loading && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-mono animate-pulse">Formulating concept puzzle for: "{topic}"...</p>
        </div>
      )}

      {/* 2. Room Riddle Mode */}
      {!setupMode && !loading && !solved && activeRoom && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm text-center">
          <div className="space-y-6 text-left">
            
            {/* Clue card */}
            <div className="p-5 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-orange-600 uppercase font-bold flex items-center gap-1.5">
                <ShieldAlert size={14} /> ACTIVE ROOM RIDDLE ({topic})
              </span>
              <p className="text-xs text-zinc-800 font-extrabold leading-relaxed font-mono whitespace-pre-wrap">
                {activeRoom.riddle}
              </p>
            </div>

            <form onSubmit={checkEscape} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">Enter Concept Passcode</label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => { setPasscode(e.target.value); setErrorMsg(''); }}
                  placeholder="Type single-word passcode in lowercase..."
                  required
                  className="w-full h-11 px-4 rounded-xl border border-zinc-250 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-950 font-mono"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-[10px] font-mono rounded-xl leading-normal text-left">
                  {errorMsg}
                </div>
              )}

              {/* Show Hint Option */}
              {showHint ? (
                <div className="p-4 bg-orange-50/50 border border-orange-100 text-orange-700 text-xs font-mono rounded-2xl leading-relaxed text-left flex gap-1.5 items-start">
                  <Sparkles size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[10px] uppercase tracking-wide">AI Co-pilot Hint:</span>
                    <span className="mt-1 block">{activeRoom.hint}</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="text-xs font-mono font-bold text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1.5"
                >
                  <HelpIcon size={14} /> Request Hint
                </button>
              )}

              <div className="flex justify-end pt-2 border-t border-zinc-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                >
                  Unlock Escape Port &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Escaped Mode */}
      {solved && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm text-center max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-orange-600">
            <CheckCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-zinc-950">Escape Port Unlocked!</h3>
            <p className="text-xs text-zinc-550 leading-relaxed font-mono bg-zinc-50 border border-zinc-150 p-4 rounded-2xl">
              Fantastic! You correctly entered the passcode and escaped the lock room successfully! (+100 XP)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={resetRoom}
              className="py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer animate-pulse"
            >
              TRY ANOTHER ROOM
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
