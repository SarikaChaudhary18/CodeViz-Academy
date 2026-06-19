import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Target, BookOpen, Terminal, Users } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Hero() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);

  const runCode = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setCount((prev) => prev + 1);
      setIsCompiling(false);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white font-sans relative overflow-hidden">
      {/* Dark Radial Glow Background from original prompt */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 200px, #3e3e3e, transparent)`,
        }}
      />

      {/* Clean Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-8 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-bold rounded">
            SQ
          </div>
          <span className="text-lg font-black tracking-wider text-white">
            STUDYQUEST OS
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/login')}
            className="text-xs font-mono font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="text-xs font-mono font-bold px-4 py-2 bg-white hover:bg-zinc-200 text-black transition-colors cursor-pointer"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left column: Minimalist info */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-block border border-white/20 px-3 py-1 text-xs font-mono text-zinc-400">
            SYSTEM COMPONENT: LANDING
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-none text-white">
            Gamified Career & Interview Sandbox.
          </h1>

          <p className="text-zinc-400 leading-relaxed text-sm sm:text-base max-w-lg">
            A minimalist workspace for tracking data structures, auditing resume formats, practicing mock interviews, and syncing levels. Complete daily quests, earn XP, and level up your software engineering credentials.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold px-6 py-3.5 border border-white transition-colors cursor-pointer text-sm"
            >
              Get Started <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-transparent hover:bg-white/5 text-white font-semibold px-6 py-3.5 border border-white/20 transition-colors cursor-pointer text-sm"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Right column: Interactive code compiler card (Minimalist, strictly dark layout) */}
        <div className="lg:col-span-6">
          <div className="border border-white/10 bg-[#070b19]/80 rounded-lg overflow-hidden backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="bg-white/5 text-white px-4 py-2 flex items-center justify-between border-b border-white/10">
              <span className="font-mono text-xs font-bold">interactive_terminal.js</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-zinc-300">
                ACTIVE
              </span>
            </div>

            {/* Terminal Body */}
            <div className="p-6 space-y-4 font-mono text-xs text-zinc-300">
              <div className="space-y-1 text-zinc-500">
                <p>// Run compile to increment code execution state</p>
                <p>const studyQuest = require("studyquest-core");</p>
                <p>const sandbox = studyQuest.createSandbox();</p>
              </div>

              {/* Status Output */}
              <div className="border border-white/10 p-4 bg-white/[0.02]">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Execution Feed</p>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Successful executions:</span>
                  <span className="font-bold text-black bg-white px-2 py-0.5 text-xs">
                    {count}
                  </span>
                </div>
              </div>

              {/* Action trigger */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">
                  {isCompiling ? "Compiling source..." : "Status: Ready"}
                </span>

                <button
                  onClick={runCode}
                  disabled={isCompiling}
                  className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs px-4 py-2 border border-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Play size={12} fill="black" className="text-black" /> RUN COMPILE
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Clean Grid features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-16 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Module 1 */}
          <div className="border border-white/10 p-6 bg-[#070b19]/25 space-y-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded">
              <Target size={16} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wide text-white">Company Prep</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Tailored arrays filtered by big tech pipeline standards.</p>
          </div>

          {/* Module 2 */}
          <div className="border border-white/10 p-6 bg-[#070b19]/25 space-y-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded">
              <BookOpen size={16} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wide text-white">DSA Sheets</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Track data structure progress with clean local states.</p>
          </div>

          {/* Module 3 */}
          <div className="border border-white/10 p-6 bg-[#070b19]/25 space-y-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded">
              <Terminal size={16} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wide text-white">AI Resume Auditor</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Audit formatting metrics and LaTeX structures instantly.</p>
          </div>

          {/* Module 4 */}
          <div className="border border-white/10 p-6 bg-[#070b19]/25 space-y-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded">
              <Users size={16} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wide text-white">Squad Chat</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Sync levels, activity streams, and live rooms via WebSockets.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-8 py-8 border-t border-white/10 text-center text-xs text-zinc-500 font-mono">
        © 2026 StudyQuest OS. Minimalist Dark Edition.
      </footer>
    </div>
  );
}
