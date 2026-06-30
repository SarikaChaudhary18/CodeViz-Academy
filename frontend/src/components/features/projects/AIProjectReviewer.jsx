import React, { useState } from 'react';
import { Sparkles, Terminal, FileCode, CheckCircle, Flame, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIProjectReviewer() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/SarikaChaudhary18/CodeViz-Academy');
  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  const handleReview = (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setReviewing(true);
    setReviewResult(null);

    setTimeout(() => {
      setReviewResult({
        score: 84,
        modularDesignScore: 90,
        dependencyHealthScore: 78,
        issues: [
          { type: "Critical", desc: "Found API secret keys hardcoded in system environment files. Relocate keys to local secrets manager variables." },
          { type: "Warning", desc: "Missing error handling on WebSocket connection terminations. Add listener for process errors." }
        ],
        remediation: "Ensure the .env variables are ignored inside .gitignore files. Wrap WebSocket connections in connection retry handlers."
      });
      setReviewing(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Sparkles className="text-orange-600 w-8 h-8" />
          AI PROJECT REVIEWER
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Scan repository directories to trace configuration health, security keys, and code abstractions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Form (Left) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleReview} className="space-y-4 text-left">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">
              Review Blueprint
            </h2>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                Repository URL / Project Path
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <FileCode size={14} />
                </span>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-950"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={reviewing}
              className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {reviewing ? 'Scanning repository...' : 'Scan Repository'}
            </button>
          </form>
        </div>

        {/* Output Diagnostics (Right) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider text-left">
              Audit Logs
            </h2>

            {reviewing && (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs space-y-3 animate-pulse">
                <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
                <p>Auditing file structures and dependencies...</p>
              </div>
            )}

            {!reviewResult && !reviewing && (
              <div className="py-16 text-center text-zinc-400 font-mono text-xs">
                Provide a repository link and scan project metrics.
              </div>
            )}

            {reviewResult && !reviewing && (
              <div className="space-y-5 text-left">
                {/* Stats */}
                <div className="flex justify-between items-center p-3.5 bg-orange-50/50 border border-orange-100 rounded-xl">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Modular Quality</span>
                    <span className="text-xs font-bold text-orange-600 font-mono">{reviewResult.modularDesignScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-zinc-500 block">Overall Score</span>
                    <span className="text-sm font-black text-orange-600 font-mono">{reviewResult.score}% passed</span>
                  </div>
                </div>

                {/* Issues */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold flex items-center gap-1.5"><AlertCircle size={12} className="text-orange-600" /> Detected Quality Warnings</span>
                  <div className="space-y-2">
                    {reviewResult.issues.map((issue, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl space-y-1 text-xs">
                        <span className={`text-[9px] font-mono font-bold uppercase ${
                          issue.type === 'Critical' ? 'text-red-500' : 'text-amber-500'
                        }`}>{issue.type} Warning</span>
                        <p className="text-zinc-650 leading-relaxed mt-0.5">{issue.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remediation */}
                <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-[10px] text-zinc-650 font-mono leading-normal">
                  <strong>AI Remedial Action:</strong> {reviewResult.remediation}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
