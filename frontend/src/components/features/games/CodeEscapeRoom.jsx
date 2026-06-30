import React, { useState } from 'react';
import { HelpCircle, CheckCircle, RefreshCw, Key, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CodeEscapeRoom() {
  const [solved, setSolved] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const checkEscape = (e) => {
    e.preventDefault();
    if (passcode.trim().toLowerCase() === 'closure') {
      setSolved(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Access Denied. Passcode incorrect. Trace parameter scopes again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Key className="text-orange-600 w-8 h-8" />
          ALGORITHMIC ESCAPE ROOM
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Solve programmatic riddles to unlock the virtual kernel doors
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm text-center">
        {!solved ? (
          <div className="space-y-6 text-left">
            
            {/* Clue card */}
            <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-orange-600 uppercase font-bold flex items-center gap-1.5"><ShieldAlert size={14} /> ACTIVE ROOM RIDDLE</span>
              <p className="text-xs text-zinc-800 font-extrabold leading-relaxed">
                "I am a function that retains access to my outer variables scope, even after the outer scope has returned. What am I?"
              </p>
            </div>

            <form onSubmit={checkEscape} className="space-y-4">
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Type answer here..."
                required
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-950 font-mono"
              />

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-[10px] font-mono rounded-xl leading-normal text-left">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                >
                  Unlock Port &rarr;
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
              <h3 className="text-lg font-bold text-zinc-950">Room Escaped!</h3>
              <p className="text-xs text-zinc-550 max-w-sm mx-auto leading-relaxed">
                Excellent! You correctly identified the Closure passcode and unlocked the exit port (+100 XP).
              </p>
            </div>
            <button
              onClick={() => {
                setSolved(false);
                setPasscode('');
              }}
              className="px-6 py-2.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            >
              TRY ANOTHER ROOM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
