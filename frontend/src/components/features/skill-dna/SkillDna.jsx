import React from 'react';
import { Award, Star, Zap, BarChart2, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const DNA_DATA = [
  { subject: 'Data Structures', A: 85, B: 110, fullMark: 100 },
  { subject: 'Algorithms', A: 70, B: 130, fullMark: 100 },
  { subject: 'System Design', A: 45, B: 130, fullMark: 100 },
  { subject: 'Frontend', A: 90, B: 100, fullMark: 100 },
  { subject: 'Backend', A: 60, B: 120, fullMark: 100 },
  { subject: 'Coding Speed', A: 75, B: 140, fullMark: 100 },
];

export default function SkillDna() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <BarChart2 className="text-orange-600 w-8 h-8" />
          LEARNING DNA PROFILE
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Visual profile assessment index for full-stack engineering metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Radar Chart visualization */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-orange-600" /> Skill Dimensions Radar
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono">
              Dynamic strength mapping from sandbox and quiz logs.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center my-4 pr-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={DNA_DATA}>
                <PolarGrid stroke="#e4e4e7" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#18181b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar 
                  name="Learner" 
                  dataKey="A" 
                  stroke="#ea580c" 
                  fill="#f97316" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl text-[9px] font-mono text-zinc-500 leading-relaxed text-center">
            Scale values updated every 24 hours.
          </div>
        </div>

        {/* Middle & Right: Profile metrics and recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Global Percentile</span>
              <div className="text-2xl font-black text-orange-600 mt-1 font-mono">Top 8.4%</div>
              <span className="text-[9px] font-mono text-green-600 block mt-1">↑ Improved 1.2% this week</span>
            </div>

            <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Solve Density</span>
              <div className="text-2xl font-black text-orange-600 mt-1 font-mono">4.8 / day</div>
              <span className="text-[9px] font-mono text-zinc-500 block mt-1">Average target: 5.0</span>
            </div>

            <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Target Readiness</span>
              <div className="text-2xl font-black text-orange-600 mt-1 font-mono">74%</div>
              <span className="text-[9px] font-mono text-zinc-550 block mt-1">Matched against FAANG criteria</span>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-orange-600" /> Actionable Recommendations
            </h2>

            <div className="space-y-3">
              {/* Strength */}
              <div className="flex gap-3 items-start p-3 bg-green-50/40 border border-green-100 rounded-xl">
                <CheckCircle2 className="text-green-600 w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-green-950">Primary Strength: Frontend Interfaces</h4>
                  <p className="text-[11px] text-zinc-650 mt-0.5 leading-relaxed">
                    Excellent layout structure scores (90%). Your component splitting and micro-interaction setup are fully optimized.
                  </p>
                </div>
              </div>

              {/* Weakness */}
              <div className="flex gap-3 items-start p-3 bg-amber-50/40 border border-amber-100 rounded-xl">
                <AlertCircle className="text-amber-600 w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-amber-950">System Design Lacuna Detected</h4>
                  <p className="text-[11px] text-zinc-650 mt-0.5 leading-relaxed">
                    System Design dimension scores are currently low (45%). We recommend tracing system caching topologies and database replication scripts in your active sprint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
