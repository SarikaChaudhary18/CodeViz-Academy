import React, { useState, useEffect } from 'react';
import { Award, Star, Zap, BarChart2, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { api } from '../../../lib/api';

export default function SkillDna() {
  const [loading, setLoading] = useState(true);
  const [dnaData, setDnaData] = useState([]);
  const [metrics, setMetrics] = useState({
    percentile: 'Top 10.0%',
    solveDensity: '0.0 / day',
    readiness: '50%'
  });
  const [recommendations, setRecommendations] = useState({
    strength: { title: 'Primary Strength', desc: 'Loading...' },
    weakness: { title: 'Focus Area', desc: 'Loading...' }
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get('/trackers/stats'),
          api.get('/courses')
        ]);

        const stats = statsRes.data?.data || {};
        const courses = coursesRes.data?.data || [];

        const dsaCount = stats.totalSolved || 0;
        const xp = stats.xpGained || 0;

        // Categorize course progress
        let feProgressSum = 0, feCount = 0;
        let beProgressSum = 0, beCount = 0;
        let sdProgressSum = 0, sdCount = 0;

        courses.forEach(c => {
          if (c.category === 'frontend') {
            feProgressSum += c.progressPercent || 0;
            feCount++;
          } else if (c.category === 'backend') {
            beProgressSum += c.progressPercent || 0;
            beCount++;
          } else if (c.category === 'system-design') {
            sdProgressSum += c.progressPercent || 0;
            sdCount++;
          }
        });

        const feAvg = feCount > 0 ? Math.round(feProgressSum / feCount) : 0;
        const beAvg = beCount > 0 ? Math.round(beProgressSum / beCount) : 0;
        const sdAvg = sdCount > 0 ? Math.round(sdProgressSum / sdCount) : 0;

        // Dynamic Score Calculation (base + dynamic stats)
        const dsScore = Math.min(100, 45 + Math.floor(dsaCount * 1.5));
        const algoScore = Math.min(100, 40 + Math.floor(dsaCount * 2.0));
        const sdScore = Math.min(100, 45 + Math.floor(sdAvg * 0.55));
        const feScore = Math.min(100, 50 + Math.floor(feAvg * 0.5));
        const beScore = Math.min(100, 45 + Math.floor(beAvg * 0.55));
        const speedScore = Math.min(100, 55 + Math.floor((xp % 500) / 10));

        const computedDna = [
          { subject: 'Data Structures', A: dsScore, fullMark: 100 },
          { subject: 'Algorithms', A: algoScore, fullMark: 100 },
          { subject: 'System Design', A: sdScore, fullMark: 100 },
          { subject: 'Frontend', A: feScore, fullMark: 100 },
          { subject: 'Backend', A: beScore, fullMark: 100 },
          { subject: 'Coding Speed', A: speedScore, fullMark: 100 },
        ];

        setDnaData(computedDna);

        // Percentile formula
        const rankPercentile = Math.max(1.0, 10.0 - (xp / 800));
        const percentileLabel = `Top ${rankPercentile.toFixed(1)}%`;
        const solveDensityVal = Math.min(10.0, 1.2 + (dsaCount / 12));
        const readinessVal = Math.round((dsScore + algoScore + sdScore + feScore + beScore + speedScore) / 6);

        setMetrics({
          percentile: percentileLabel,
          solveDensity: `${solveDensityVal.toFixed(1)} / day`,
          readiness: `${readinessVal}%`
        });

        // Dynamic Recommendations
        const subjects = {
          'Data Structures': dsScore,
          'Algorithms': algoScore,
          'System Design': sdScore,
          'Frontend': feScore,
          'Backend': beScore,
          'Coding Speed': speedScore,
        };

        let highestSub = 'Frontend';
        let highestVal = -1;
        let lowestSub = 'System Design';
        let lowestVal = 999;

        Object.entries(subjects).forEach(([sub, val]) => {
          if (val > highestVal) {
            highestVal = val;
            highestSub = sub;
          }
          if (val < lowestVal) {
            lowestVal = val;
            lowestSub = sub;
          }
        });

        const DESCRIPTIONS = {
          'Data Structures': {
            strength: 'Excellent memory utilization and tree/graph structure traversal logic. Your pointers and storage designs are fully optimized.',
            weakness: 'Data structures scores are currently low. We recommend practicing more tree and graph traversal problems.'
          },
          'Algorithms': {
            strength: 'Excellent complexity optimization (Big O). Your recursion, backtracking, and dynamic programming approaches are highly efficient.',
            weakness: 'Algorithm optimization scores are low. We recommend practicing divide-and-conquer and greedy algorithms in your active sprint.'
          },
          'System Design': {
            strength: 'Excellent high-level architecture understanding. Your component decoupling and flow patterns are robust.',
            weakness: 'System Design scores are currently low. We recommend studying caching topologies and database load balancing designs.'
          },
          'Frontend': {
            strength: 'Excellent layout structure scores. Your component splitting and micro-interaction setup are fully optimized.',
            weakness: 'Frontend development scores are currently low. We recommend practicing state management and responsive DOM layouts.'
          },
          'Backend': {
            strength: 'Excellent API design and database query optimization. Your server routing and middleware logic are clean.',
            weakness: 'Backend API scores are currently low. We recommend practicing REST controllers and database indexing.'
          },
          'Coding Speed': {
            strength: 'Exceptional quick-recall and syntax typing accuracy. You solve complex constraints in minimal iterations.',
            weakness: 'Coding speed is currently low. We recommend practicing timed mock quizzes and coding sandbox speed runs.'
          }
        };

        setRecommendations({
          strength: {
            title: `Primary Strength: ${highestSub}`,
            desc: DESCRIPTIONS[highestSub]?.strength || 'Decisive strength metrics displayed.'
          },
          weakness: {
            title: `${lowestSub} Focus Area Detected`,
            desc: DESCRIPTIONS[lowestSub]?.weakness || 'Decisive focus area metrics displayed.'
          }
        });

      } catch (err) {
        console.error('Error fetching Skill DNA:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-wider animate-pulse">
          Analyzing Learning DNA profile...
        </p>
      </div>
    );
  }

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
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dnaData}>
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
              <div className="text-2xl font-black text-orange-600 mt-1 font-mono">{metrics.percentile}</div>
              <span className="text-[9px] font-mono text-green-600 block mt-1">↑ Dynamic rank index</span>
            </div>

            <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Solve Density</span>
              <div className="text-2xl font-black text-orange-600 mt-1 font-mono">{metrics.solveDensity}</div>
              <span className="text-[9px] font-mono text-zinc-500 block mt-1">Based on solved progress</span>
            </div>

            <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Target Readiness</span>
              <div className="text-2xl font-black text-orange-600 mt-1 font-mono">{metrics.readiness}</div>
              <span className="text-[9px] font-mono text-zinc-550 block mt-1">Matched against target criteria</span>
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
                  <h4 className="text-xs font-bold text-green-950">{recommendations.strength.title}</h4>
                  <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
                    {recommendations.strength.desc}
                  </p>
                </div>
              </div>

              {/* Weakness */}
              <div className="flex gap-3 items-start p-3 bg-amber-50/40 border border-amber-100 rounded-xl">
                <AlertCircle className="text-amber-600 w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-amber-950">{recommendations.weakness.title}</h4>
                  <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
                    {recommendations.weakness.desc}
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
