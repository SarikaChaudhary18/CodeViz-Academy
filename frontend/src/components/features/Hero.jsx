import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Shield, Sparkles, Code, Play, ArrowRight, Zap, Target, Users, BookOpen } from 'lucide-react';
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
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white relative overflow-hidden font-sans">
      {/* Pink Radial Glow Background from demo.tsx */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle 600px at 50% 120px, rgba(236, 72, 153, 0.15), transparent)`,
        }}
      />

      {/* Cyber Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-lg text-glow-violet">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              STUDYQUEST
            </span>
            <span className="text-[9px] block text-pink-400 font-mono tracking-widest leading-none">
              OS v1.0.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-xs font-mono font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
          >
            Access Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="text-xs font-mono font-bold px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            Seed Profile
          </button>
        </div>
      </header>

      {/* Hero Section Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Brand & Call To Action */}
        <div className="lg:col-span-6 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GAMIFIED CAREER & INTERVIEW SANDBOX</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-100 to-gray-500">
            Hack Your Coding Career. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
              Level Up Your Skills.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed">
            StudyQuest OS transforms dry DSA sheets, resume reviews, and interview prep into a real-time multiplayer quest. Defeat structural algorithm challenges, earn XP, and secure top-tier tech roles.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-xl shadow-pink-600/15 active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              Initialize Profile <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-3.5 rounded-xl active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              Enterprise Login
            </button>
          </div>

          {/* Micro stats banner */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
            <div>
              <p className="text-xl font-bold text-pink-500">100k+</p>
              <p className="text-xxs font-mono uppercase text-gray-500">Active Handshakes</p>
            </div>
            <div>
              <p className="text-xl font-bold text-violet-400">150+</p>
              <p className="text-xxs font-mono uppercase text-gray-500">DSA Quest Nodes</p>
            </div>
            <div>
              <p className="text-xl font-bold text-cyan-400">99.8%</p>
              <p className="text-xxs font-mono uppercase text-gray-500">Sandbox Success</p>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive HUD / Interactive Terminal widget */}
        <div className="lg:col-span-6">
          <div className="relative w-full max-w-lg mx-auto">
            {/* Ambient glowing rings */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-pink-500 to-violet-600 rounded-2xl blur opacity-25" />
            
            {/* Simulated UI Window */}
            <div className="relative bg-[#07080a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Header Tab Bar */}
              <div className="bg-[#0b0c10] px-4 py-3 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="text-[10px] text-gray-500 font-mono ml-2">sandbox_runner.js</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-pink-400 font-mono">
                  <Zap className="w-3 h-3 text-pink-500" />
                  <span>Interactive Live</span>
                </div>
              </div>

              {/* Terminal Code Area */}
              <div className="p-5 font-mono text-xs text-gray-400 space-y-4">
                <div className="space-y-1">
                  <p className="text-gray-600">// Click Run to execute sandbox code and increment counter</p>
                  <p className="text-pink-400">
                    <span className="text-violet-400">const </span> 
                    questModule = require(<span className="text-green-400">"studyquest-core"</span>);
                  </p>
                  <p className="text-pink-400">
                    <span className="text-violet-400">const </span> 
                    sandbox = questModule.createSandbox();
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-cyan-400">
                  <p className="text-xxs text-gray-500 uppercase tracking-widest mb-1">Execution Status</p>
                  <div className="flex items-center justify-between">
                    <span>Successful compilations:</span>
                    <span className="text-white font-bold text-sm bg-pink-500/20 px-2 py-0.5 rounded border border-pink-500/30 text-glow-pink">
                      {count}
                    </span>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="text-[10px] text-gray-500">
                    {isCompiling ? (
                      <span className="text-yellow-500 flex items-center gap-1">
                        <span className="w-2 h-2 border border-t-yellow-500 rounded-full animate-spin" /> Compiling...
                      </span>
                    ) : (
                      <span className="text-green-500 flex items-center gap-1">
                        ● READY FOR DEPLOYMENT
                      </span>
                    )}
                  </div>

                  <button
                    onClick={runCode}
                    disabled={isCompiling}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-bold text-xxs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-pink-500/10 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-white" />
                    RUN CODE
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>

      {/* Feature Showcase Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-white">Full-Stack Core Modules</h2>
          <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-widest">SYSTEM CAPABILITIES OVERVIEW</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white/[0.01] border border-white/5 hover:border-pink-500/30 p-6 rounded-2xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4 group-hover:bg-pink-500 group-hover:text-white transition-all">
              <Target size={20} />
            </div>
            <h3 className="font-semibold mb-2">Company Prep Arena</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Tailored interview question arrays filtered by big tech pipelines.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/[0.01] border border-white/5 hover:border-violet-500/30 p-6 rounded-2xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 group-hover:bg-violet-500 group-hover:text-white transition-all">
              <BookOpen size={20} />
            </div>
            <h3 className="font-semibold mb-2">Interactive DSA Sheets</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Track complex data structure progression with live stats updates.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/[0.01] border border-white/5 hover:border-cyan-500/30 p-6 rounded-2xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all">
              <Terminal size={20} />
            </div>
            <h3 className="font-semibold mb-2">Resume AI Auditor</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Real-time LaTeX parsing checks for scale metrics and format flaws.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white/[0.01] border border-white/5 hover:border-pink-500/30 p-6 rounded-2xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4 group-hover:bg-pink-500 group-hover:text-white transition-all">
              <Users size={20} />
            </div>
            <h3 className="font-semibold mb-2">Squad Chat & WebSockets</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Live chat, level tracking, and workspace messaging syncs.</p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 border-t border-white/5 text-center text-xs text-gray-600 font-mono">
        © 2026 StudyQuest OS. All rights reserved. Secure terminal connection.
      </footer>
    </div>
  );
}
