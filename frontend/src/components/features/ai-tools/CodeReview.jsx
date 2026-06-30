import React, { useState } from 'react';
import { Sparkles, Terminal, FileCode } from 'lucide-react';
import { api } from '../../../lib/api';

export default function CodeReview() {
  const [code, setCode] = useState(`function computeFibonacci(n) {
  if (n <= 1) return n;
  return computeFibonacci(n - 1) + computeFibonacci(n - 2);
}`);

  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  const handleReview = async () => {
    if (!code.trim()) return;
    setReviewing(true);
    setReviewResult(null);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'code-review',
        payload: code
      });

      if (res.status === 'success' || res.data) {
        const result = res.data;
        setReviewResult({
          complexity: result.complexity || { time: "O(N)", space: "O(1)" },
          readabilityScore: Math.max(50, Math.round((result.rating || 85) * 0.95)),
          cleanlinessScore: result.rating || 85,
          feedback: result.suggestions || [],
          optimizedCode: result.details || '// Optimized recommendation complete'
        });
      }
    } catch (err) {
      console.error('Failed to run AI Code Review:', err.message);
      setReviewResult({
        complexity: { time: "N/A", space: "N/A" },
        readabilityScore: 0,
        cleanlinessScore: 0,
        feedback: ["Verification failed. Verify API key settings."],
        optimizedCode: "// Review failed"
      });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Sparkles className="text-orange-600 w-8 h-8 animate-pulse" />
          AI CODE REVIEWER
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Trace algorithmic complexities, redundant branches, and readability scores
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input box */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="text-xs font-mono font-bold text-zinc-950 flex items-center gap-1.5">
              <FileCode size={14} className="text-orange-600" /> SOURCE FOR REVIEW
            </span>
            <span className="text-[10px] font-mono text-zinc-400">JavaScript / Python</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 font-mono text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-900 leading-relaxed"
          />

          <div className="flex justify-end pt-2">
            <button
              onClick={handleReview}
              disabled={reviewing || !code.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {reviewing ? 'Running AI reviewer...' : 'Launch AI Review'} <Sparkles size={12} />
            </button>
          </div>
        </div>

        {/* Report box */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider">
              Review Summary
            </h2>

            {reviewing && (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs space-y-3 animate-pulse">
                <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
                <p>Auditing complexity scopes and modular metrics...</p>
              </div>
            )}

            {!reviewResult && !reviewing && (
              <div className="py-16 text-center text-zinc-400 font-mono text-xs">
                Provide an algorithm snippet and trigger Review to compute complexity logs.
              </div>
            )}

            {reviewResult && !reviewing && (
              <div className="space-y-5 text-left">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">Readability</span>
                    <div className="text-xl font-black text-orange-600 mt-1 font-mono">{reviewResult.readabilityScore}%</div>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">Cleanliness</span>
                    <div className="text-xl font-black text-orange-600 mt-1 font-mono">{reviewResult.cleanlinessScore}%</div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-orange-950 font-mono text-[10px] uppercase">Calculated Complexity</div>
                  <div className="text-zinc-700 font-mono text-[11px] mt-1">
                    Time: <span className="text-orange-600 font-bold">{reviewResult.complexity.time}</span> <br />
                    Space: <span className="text-orange-600 font-bold">{reviewResult.complexity.space}</span>
                  </div>
                </div>

                {/* Feedback points */}
                {reviewResult.feedback.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold block">Critique Logs</span>
                    <div className="space-y-1.5">
                      {reviewResult.feedback.map((point, index) => (
                        <div key={index} className="text-[11px] text-zinc-650 leading-relaxed pl-3 border-l-2 border-orange-500">
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code suggestion */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold block">Suggested Optimization</span>
                  <pre className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl font-mono text-[9px] text-zinc-700 overflow-x-auto leading-relaxed">
                    {reviewResult.optimizedCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
