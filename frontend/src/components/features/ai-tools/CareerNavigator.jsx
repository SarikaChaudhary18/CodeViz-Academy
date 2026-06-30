import React, { useState } from 'react';
import { Compass, Briefcase, Building, Target, CheckCircle2, Award } from 'lucide-react';
import { api } from '../../../lib/api';

export default function CareerNavigator() {
  const [role, setRole] = useState('Frontend Developer');
  const [company, setCompany] = useState('Google');
  const [loading, setLoading] = useState(false);
  const [pathway, setPathway] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPathway(null);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'career-navigator',
        payload: `Target Role: ${role}, Target Entity: ${company}`
      });

      if (res.status === 'success' || res.data) {
        const result = res.data;
        setPathway({
          difficultyScore: result.estimatedWeeks ? `Estimated Preparation: ${result.estimatedWeeks} Weeks` : "Medium/Hard Tier",
          readinessPct: 75,
          coreSkills: (result.sprintPath || []).map((step, idx) => ({
            name: step,
            level: `Phase Step ${idx + 1}`
          })),
          hiringStages: result.tips || ["Review core domain structures."]
        });
      }
    } catch (err) {
      console.error('Failed to run Career Navigator:', err.message);
      setPathway({
        difficultyScore: "N/A",
        readinessPct: 0,
        coreSkills: [{ name: "Failed to map skills", level: "API key error" }],
        hiringStages: ["Verify your environment keys."]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Compass className="text-orange-600 w-8 h-8 animate-pulse" />
          AI CAREER NAVIGATOR
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Compute target role guidelines and structural interview stages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleGenerate} className="space-y-4">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">
              Target Blueprint
            </h2>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                Target Role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Briefcase size={14} />
                </span>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-955"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                Target Corporate Entity
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Building size={14} />
                </span>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-955"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Mapping stages...' : 'Compute Prep Roadmap'}
            </button>
          </form>
        </div>

        {/* Right: Path details */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider">
              Career Path Assessment
            </h2>

            {loading && (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs space-y-3 animate-pulse">
                <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
                <p>Computing stages and skill requirements...</p>
              </div>
            )}

            {!pathway && !loading && (
              <div className="py-16 text-center text-zinc-400 font-mono text-xs">
                Submit target company and role parameters to parse preparation guidelines.
              </div>
            )}

            {pathway && !loading && (
              <div className="space-y-5 text-left">
                {/* Stats */}
                <div className="flex justify-between items-center p-3.5 bg-orange-50/50 border border-orange-100 rounded-xl">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Interview Difficulty</span>
                    <span className="text-xs font-bold text-orange-600 font-mono">{pathway.difficultyScore}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-zinc-500 block">Your Match Index</span>
                    <span className="text-sm font-black text-orange-600 font-mono">{pathway.readinessPct}%</span>
                  </div>
                </div>

                {/* Core skills */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold flex items-center gap-1.5">
                    <Target size={12} className="text-orange-600" /> Key Skill Dimensions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pathway.coreSkills.map((skill, index) => (
                      <div key={index} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl">
                        <span className="text-[11px] font-bold text-zinc-900 block">{skill.name}</span>
                        <span className="text-[9px] font-mono text-zinc-500 mt-0.5 block">{skill.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* stages */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-555 uppercase font-bold flex items-center gap-1.5">
                    <Award size={12} className="text-orange-600" /> Target Prep Suggestions
                  </span>
                  <div className="space-y-1.5">
                    {pathway.hiringStages.map((stage, index) => (
                      <div key={index} className="flex gap-2 items-center text-xs text-zinc-700 font-mono">
                        <CheckCircle2 size={13} className="text-orange-600 shrink-0" />
                        <span>{stage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
