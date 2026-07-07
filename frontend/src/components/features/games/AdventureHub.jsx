import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Swords, Target, Sparkles, Key, ChevronRight, Award } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';

const GAME_CARDS = [
  {
    title: "Multiverse Code Battle",
    desc: "Speed-compile algorithms against an active AI opponent typing in real-time.",
    icon: Swords,
    path: "/games/code-battle"
  },
  {
    title: "Bug Hunt Arena",
    desc: "Scan dynamically AI-generated code segments to locate and target syntax bugs.",
    icon: Target,
    path: "/games/bug-hunt"
  },
  {
    title: "Algorithm Speed Race",
    desc: "Race against the clock to answer rapid-fire algorithmic complexity questions.",
    icon: Sparkles,
    path: "/games/algo-race"
  },
  {
    title: "Algorithmic Escape Room",
    desc: "Solve programming riddles and unlock virtual ports with concept key passcodes.",
    icon: Key,
    path: "/games/escape-room"
  }
];

export default function AdventureHub() {
  const user = useStore(state => state.user);
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Gamepad2 className="text-orange-600 w-8 h-8 animate-pulse" />
            ADVENTURE GAMING HUB
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Validate computer science principles through dynamic, single-player AI-driven coding games
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
          <Award size={14} />
          <span>Profile Level: {user?.level || 1}</span>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-6 bg-orange-50/40 border border-orange-100 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-zinc-950 tracking-tight">AI Game Master Lobby</h2>
          <p className="text-xs text-zinc-650 leading-relaxed">
            Practice, play, and compete against our dynamic AI Game Engine. Build speed, spot bugs, and solve coding riddles to earn XP and level up your profile!
          </p>
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
                className="mt-6 flex items-center gap-1.5 text-xs font-mono font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer w-fit"
              >
                Launch Game &rarr;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
