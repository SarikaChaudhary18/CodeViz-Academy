import React from 'react';
import { Award, Star, CheckCircle, RefreshCw, Key, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGES_LIST = [
  { id: 1, title: "Algorithmic Master", desc: "Successfully resolved 10 Hard DSA problems in the sandbox.", unlocked: true },
  { id: 2, title: "Full-Stack Architect", desc: "Completed the Next.js developer track syllabus.", unlocked: true },
  { id: 3, title: "System Optimizer", desc: "Achieved > 85% readability feedback in AI code reviews.", unlocked: false }
];

export default function Badges() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Award className="text-orange-600 w-8 h-8" />
          CERTIFICATION BADGES
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Verify and display your verified achievements on your developer footprint
        </p>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BADGES_LIST.map((badge) => (
          <div 
            key={badge.id}
            className={`bg-white border p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all text-left ${
              badge.unlocked ? 'border-orange-250 hover:border-orange-500' : 'border-zinc-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  badge.unlocked 
                    ? 'bg-orange-50 border-orange-200 text-orange-600' 
                    : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                }`}>
                  <Award size={20} />
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase ${
                  badge.unlocked ? 'text-orange-600' : 'text-zinc-400'
                }`}>{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
              </div>

              <h3 className="text-base font-extrabold text-zinc-950 tracking-tight leading-tight">{badge.title}</h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{badge.desc}</p>
            </div>

            {badge.unlocked && (
              <div className="mt-6 flex items-center gap-1.5 text-[9px] font-mono font-bold text-green-600 uppercase">
                <CheckCircle size={12} /> Sync complete
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
