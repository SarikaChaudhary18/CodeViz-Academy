import React from 'react';
import { Gamepad2, Swords, Target, Sparkles, Key, ChevronRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const GAME_CARDS = [
  {
    title: "Multiverse Code Battle",
    desc: "Speed-compile algorithms against online peers or bots.",
    icon: Swords,
    path: "/games/code-battle"
  },
  {
    title: "Bug Hunt Arena",
    desc: "Scan code segments to target semantic compiler faults.",
    icon: Target,
    path: "/games/bug-hunt"
  },
  {
    title: "Algorithm Speed Race",
    desc: "Race against a ticking timer to parse complexity logs.",
    icon: Sparkles,
    path: "/games/algo-race"
  },
  {
    title: "Algorithmic Escape Room",
    desc: "Solve programming riddles to unlock the kernel exit doors.",
    icon: Key,
    path: "/games/escape-room"
  }
];

export default function AdventureHub() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Gamepad2 className="text-orange-600 w-8 h-8 animate-pulse" />
            ADVENTURE GAMING HUB
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Validate computer science principles through gamified compiler challenges
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
          <Award size={14} />
          <span>Game Level: 14 Elite</span>
        </div>
      </div>

      {/* Grid of games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAME_CARDS.map((game, index) => {
          const Icon = game.icon;
          return (
            <div 
              key={index}
              className="bg-white border border-zinc-200 hover:border-orange-250 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all text-left"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-extrabold text-zinc-950 tracking-tight">{game.title}</h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{game.desc}</p>
              </div>

              <button
                onClick={() => navigate(game.path)}
                className="mt-6 flex items-center gap-1.5 text-xs font-mono font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                Enter Arena <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
