import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, BookOpen, Clock, Code, ShieldAlert, Loader2, ArrowRight, Briefcase, Award } from 'lucide-react';
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

  // Helper to split long text into clean bullet points or paragraphs
  const formatSections = (text) => {
    if (!text) return [];
    return text.split('\n').map(line => line.trim().replace(/^-\s*/, '')).filter(Boolean);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5 space-y-6 flex flex-col flex-1 relative overflow-hidden group/ai">
      {/* Aurora light effects */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="border-b border-white/5 pb-4 z-10">
        <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400 fill-amber-400/20" />
          AI Career Roadmap Engine
        </h4>
        <p className="text-xs text-slate-400 mt-0.5 font-sans">
          Construct an automated, time-boxed study planner and job placement strategy based on your target role.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start z-10 flex-1">
        
        {/* Left Side: Form Panel */}
        <form onSubmit={handleGenerate} className="bg-slate-950/70 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">Target Job Role</label>
            <input
              type="text"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              placeholder="e.g. AI Research Engineer"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">Current Skillset</label>
            <textarea
              value={form.currentSkills}
              onChange={(e) => setForm({ ...form, currentSkills: e.target.value })}
              placeholder="React, C++ syntax, databases..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none h-20 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">Hours / Day</label>
              <input
                type="number"
                value={form.dailyHours}
                onChange={(e) => setForm({ ...form, dailyHours: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">Timeline (M)</label>
              <input
                type="number"
                value={form.timelineMonths}
                onChange={(e) => setForm({ ...form, timelineMonths: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-rose-400 text-xs flex items-center gap-1 font-sans">
              <ShieldAlert size={14} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !form.targetRole.trim()}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/10 cursor-pointer text-xs"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Analyzing Target...
              </>
            ) : (
              <>
                Generate Plan <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Right Side: Visual Animated Timeline */}
        <div className="lg:col-span-2 min-h-[340px] flex flex-col relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-950/40 border border-white/5 rounded-2xl py-16"
              >
                <Loader2 size={36} className="animate-spin text-amber-500" />
                <div className="text-center space-y-1.5">
                  <p className="text-xs font-mono text-slate-300 uppercase tracking-widest animate-pulse font-black">Assembling Career Blueprint</p>
                  <p className="text-[10px] text-slate-500 leading-none">PARSING SYLLABUS NODES & SEEDING PROJECTS...</p>
                </div>
              </motion.div>
            ) : plan ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin relative pl-6"
              >
                {/* Visual connecting timeline line */}
                <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-500 via-cyan-500 to-violet-500 opacity-30" />

                {/* Week 1-2 Block */}
                <div className="relative group/timeline">
                  {/* Glowing Node Point */}
                  <div className="absolute left-[-22px] top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-4 border-slate-950 group-hover/timeline:scale-125 transition-transform" />
                  <div className="bg-slate-950/60 border border-white/5 hover:border-amber-500/30 p-4 rounded-2xl space-y-2 transition-all">
                    <span className="font-mono text-amber-400 text-[10px] uppercase tracking-wider block font-black flex items-center gap-1.5">
                      <Clock size={12} className="text-amber-500" /> Week 1-3: foundations and setup
                    </span>
                    <div className="text-slate-300 text-xs space-y-1 pl-1 font-sans leading-relaxed">
                      {formatSections(plan.weeklyPlan).map((pt, i) => (
                        <p key={i}>• {pt}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Month 1-2 Block */}
                <div className="relative group/timeline">
                  <div className="absolute left-[-22px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-500 border-4 border-slate-950 group-hover/timeline:scale-125 transition-transform" />
                  <div className="bg-slate-950/60 border border-white/5 hover:border-cyan-500/30 p-4 rounded-2xl space-y-2 transition-all">
                    <span className="font-mono text-cyan-400 text-[10px] uppercase tracking-wider block font-black flex items-center gap-1.5">
                      <Calendar size={12} className="text-cyan-500" /> Month 2: advanced topics & frameworks
                    </span>
                    <div className="text-slate-300 text-xs space-y-1 pl-1 font-sans leading-relaxed">
                      {formatSections(plan.monthlyPlan).map((pt, i) => (
                        <p key={i}>• {pt}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Project Recs Block */}
                <div className="relative group/timeline">
                  <div className="absolute left-[-22px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-slate-950 group-hover/timeline:scale-125 transition-transform" />
                  <div className="bg-slate-950/60 border border-white/5 hover:border-emerald-500/30 p-4 rounded-2xl space-y-2 transition-all">
                    <span className="font-mono text-emerald-400 text-[10px] uppercase tracking-wider block font-black flex items-center gap-1.5">
                      <Code size={12} className="text-emerald-500" /> Capstone Portfolio Recommendations
                    </span>
                    <div className="text-slate-300 text-xs space-y-1 pl-1 font-sans leading-relaxed">
                      {formatSections(plan.projectRecommendations).map((pt, i) => (
                        <p key={i}>• {pt}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily Rituals */}
                <div className="relative group/timeline">
                  <div className="absolute left-[-22px] top-1.5 w-3.5 h-3.5 rounded-full bg-violet-500 border-4 border-slate-950 group-hover/timeline:scale-125 transition-transform" />
                  <div className="bg-slate-950/60 border border-white/5 hover:border-violet-500/30 p-4 rounded-2xl space-y-2 transition-all">
                    <span className="font-mono text-violet-400 text-[10px] uppercase tracking-wider block font-black flex items-center gap-1.5">
                      <Award size={12} className="text-violet-500" /> Daily Action Checklist
                    </span>
                    <p className="text-slate-300 text-xs font-sans leading-relaxed pl-1">{plan.dailyPlan}</p>
                  </div>
                </div>

                {/* Placement Timeline */}
                <div className="relative group/timeline">
                  <div className="absolute left-[-22px] top-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-4 border-slate-950 group-hover/timeline:scale-125 transition-transform" />
                  <div className="bg-slate-950/60 border border-white/5 hover:border-rose-500/30 p-4 rounded-2xl space-y-3 transition-all">
                    <span className="font-mono text-rose-400 text-[10px] uppercase tracking-wider block font-black flex items-center gap-1.5">
                      <Briefcase size={12} className="text-rose-500" /> Job Placement & Interview Prep Strategy
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                        <span className="text-slate-500 text-[9px] uppercase tracking-widest font-black block">Technical Interview Benchmarks</span>
                        <p className="text-slate-300 mt-1 leading-relaxed">{plan.interviewTimeline}</p>
                      </div>
                      <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                        <span className="text-slate-500 text-[9px] uppercase tracking-widest font-black block">ATS Portfolio & Resume Strategy</span>
                        <p className="text-slate-300 mt-1 leading-relaxed">{plan.resumeTimeline}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/10 border border-dashed border-white/5 rounded-2xl py-16 text-slate-500"
              >
                <Calendar size={32} className="text-slate-700 animate-pulse" />
                <div className="max-w-xs space-y-1">
                  <p className="font-semibold text-slate-400 text-xs">Generate Custom Study Blueprint</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Fill in your target career title, current skillset, and daily study budget to assemble customized timelines, milestones, and portfolio project specifications.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
