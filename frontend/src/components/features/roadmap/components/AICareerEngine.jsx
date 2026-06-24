import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, BookOpen, Clock, Code, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../../../lib/api';

export default function AICareerEngine() {
  const [form, setForm] = useState({
    targetRole: 'Full Stack Engineer',
    currentSkills: 'React, HTML, CSS, JavaScript basics',
    dailyHours: '3',
    timelineMonths: '3'
  });
  
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.targetRole.trim()) return;
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      const res = await api.post('/roadmaps/generate-career-plan', {
        targetRole: form.targetRole,
        currentSkills: form.currentSkills,
        dailyHours: parseInt(form.dailyHours, 10),
        timelineMonths: parseInt(form.timelineMonths, 10)
      });
      if (res.status === 'success') {
        setPlan(res.data);
      } else {
        setError('Failed to generate career plan. Please verify parameters.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred during AI generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glassmorphism rounded-3xl p-6 border-white/5 space-y-6 flex flex-col flex-1">
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={16} className="text-amber-400" />
          AI Career Roadmap Engine
        </h4>
        <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-widest">
          Personalized sprint blueprints based on commitment constraints
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form panel */}
        <form onSubmit={handleGenerate} className="bg-zinc-950/40 border border-white/5 rounded-2xl p-5 space-y-4 text-[10px] font-mono">
          <div className="space-y-1">
            <label className="text-zinc-500 uppercase tracking-wider">Target Job Role</label>
            <input
              type="text"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              placeholder="e.g. AI Research Engineer"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-500 uppercase tracking-wider">Current Skills</label>
            <textarea
              value={form.currentSkills}
              onChange={(e) => setForm({ ...form, currentSkills: e.target.value })}
              placeholder="React, C++ syntax, databases..."
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 resize-none h-16"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-500 uppercase tracking-wider">Hours / Day</label>
              <input
                type="number"
                value={form.dailyHours}
                onChange={(e) => setForm({ ...form, dailyHours: e.target.value })}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-500 uppercase tracking-wider">Timeline (Months)</label>
              <input
                type="number"
                value={form.timelineMonths}
                onChange={(e) => setForm({ ...form, timelineMonths: e.target.value })}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 flex items-center gap-1 font-sans">
              <ShieldAlert size={12} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !form.targetRole.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 disabled:opacity-50 text-zinc-950 font-bold uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Synthesizing...
              </>
            ) : (
              <>
                Generate Career Schedule <ArrowRight size={11} />
              </>
            )}
          </button>
        </form>

        {/* Results display */}
        <div className="lg:col-span-2 min-h-[300px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-zinc-950/20 border border-white/5 rounded-2xl py-12">
              <Loader2 size={32} className="animate-spin text-amber-500" />
              <div className="text-center">
                <p className="text-xs font-mono text-zinc-300 uppercase tracking-widest animate-pulse font-bold">Assembling Custom Sprints</p>
                <p className="text-[9px] font-mono text-zinc-600 mt-1 uppercase">Parsing matrix targets & project schema models...</p>
              </div>
            </div>
          ) : plan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] leading-relaxed max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              
              <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-4 space-y-1.5">
                <span className="font-mono text-amber-400 uppercase tracking-widest block font-bold flex items-center gap-1">
                  <Clock size={11} /> Daily Action Rituals
                </span>
                <p className="text-zinc-400 text-[9px]">{plan.dailyPlan}</p>
              </div>

              <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-4 space-y-1.5">
                <span className="font-mono text-amber-400 uppercase tracking-widest block font-bold flex items-center gap-1">
                  <Calendar size={11} /> Weekly Milestone Sprints
                </span>
                <p className="text-zinc-400 text-[9px]">{plan.weeklyPlan}</p>
              </div>

              <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-4 space-y-1.5">
                <span className="font-mono text-cyan-400 uppercase tracking-widest block font-bold flex items-center gap-1">
                  <BookOpen size={11} /> Monthly Roadmap Chapters
                </span>
                <p className="text-zinc-400 text-[9px]">{plan.monthlyPlan}</p>
              </div>

              <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-4 space-y-1.5">
                <span className="font-mono text-emerald-400 uppercase tracking-widest block font-bold flex items-center gap-1">
                  <Code size={11} /> Portfolio Projects Setup
                </span>
                <p className="text-zinc-400 text-[9px]">{plan.projectRecommendations}</p>
              </div>

              <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-4 space-y-1.5 md:col-span-2">
                <span className="font-mono text-purple-400 uppercase tracking-widest block font-bold">
                  💼 FAANG Interview Prep & Resume Timeline
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-zinc-500 uppercase tracking-widest block text-[8px] font-bold">Interview Benchmarks</span>
                    <p className="text-zinc-400 text-[9px] mt-1">{plan.interviewTimeline}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase tracking-widest block text-[8px] font-bold">ATS Portfolio Audit</span>
                    <p className="text-zinc-400 text-[9px] mt-1">{plan.resumeTimeline}</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 bg-zinc-950/10 border border-dashed border-white/5 rounded-2xl py-12 text-zinc-500">
              <Calendar size={28} className="text-zinc-700 animate-pulse" />
              <div className="max-w-[280px]">
                <p className="font-mono uppercase tracking-wider text-[9px] font-bold text-zinc-400">Generate Custom Study Sprints</p>
                <p className="font-sans text-zinc-600 text-[9px] mt-1">
                  Fill in your target career title and study limits to generate automated timelines, weekly reviews, and capstones.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
