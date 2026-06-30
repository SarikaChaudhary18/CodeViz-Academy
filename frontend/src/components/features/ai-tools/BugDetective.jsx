import React, { useState } from 'react';
import { ShieldAlert, Terminal, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../lib/api';

export default function BugDetective() {
  const [code, setCode] = useState(`function findUser(users, id) {
  for (var i = 0; i <= users.length; i++) {
    if (users[i].id == id) {
      return users[i];
    }
  }
  return null;
}`);

  const [detecting, setDetecting] = useState(false);
  const [report, setReport] = useState(null);

  const handleScan = async () => {
    if (!code.trim()) return;
    setDetecting(true);
    setReport(null);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'bug-detective',
        payload: code
      });

      if (res.status === 'success' || res.data) {
        const result = res.data;
        setReport({
          bugsFound: result.bugs?.length || 0,
          diagnoses: result.bugs || [],
          remediation: result.explanation || 'Code logic analysis completed.'
        });
      }
    } catch (err) {
      console.error('Failed to run Bug Detective:', err.message);
      setReport({
        bugsFound: 0,
        diagnoses: [
          {
            line: 0,
            type: "System Check Error",
            details: "Could not contact Bug Detective service. Verify environment AI api keys."
          }
        ],
        remediation: "Verify the backend configuration."
      });
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <ShieldAlert className="text-orange-600 w-8 h-8 animate-pulse" />
          BUG DETECTIVE
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Scan code snippets for leaks, indexes bounds, and stack faults
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Code Input (Left) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="text-xs font-mono font-bold text-zinc-950 flex items-center gap-1.5">
              <Terminal size={14} className="text-orange-600" /> SOURCE SANDBOX
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
              onClick={handleScan}
              disabled={detecting || !code.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {detecting ? 'Scanning kernel...' : 'Scan Solution'} <Play size={12} className="fill-white" />
            </button>
          </div>
        </div>

        {/* Scan Report Output (Right) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider">
              Diagnostic Logs
            </h2>

            {detecting && (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs space-y-3 animate-pulse">
                <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
                <p>Analyzing AST scopes and syntax parameters...</p>
              </div>
            )}

            {!report && !detecting && (
              <div className="py-16 text-center text-zinc-400 font-mono text-xs">
                Paste your code snippet and click Scan to trace runtime warnings.
              </div>
            )}

            {report && !detecting && (
              <div className="space-y-5 text-left">
                {/* Score */}
                <div className={`flex justify-between items-center border rounded-xl p-4 ${
                  report.bugsFound > 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span className="text-xs font-mono font-bold">
                      {report.bugsFound > 0 ? 'BUGS DETECTED' : 'NO BUGS DETECTED'}
                    </span>
                  </div>
                  <span className="text-lg font-black font-mono">{report.bugsFound}</span>
                </div>

                {/* Bug Details List */}
                {report.bugsFound > 0 && (
                  <div className="space-y-3">
                    {report.diagnoses.map((diag, index) => (
                      <div key={index} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl space-y-1">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-zinc-500">
                          <span className="text-red-500 uppercase">{diag.type || 'Bug Alert'}</span>
                          {diag.line > 0 && <span>LINE {diag.line}</span>}
                        </div>
                        <p className="text-[11px] text-zinc-650 leading-relaxed">
                          {diag.description}
                        </p>
                        {diag.fix && (
                          <pre className="p-1 bg-zinc-100 rounded text-[9px] text-zinc-600 font-mono overflow-x-auto mt-1">
                            {diag.fix}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Remediation code preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold block">Summary & Remediation</span>
                  <p className="text-[11px] text-zinc-600 leading-relaxed bg-zinc-50 p-4 border border-zinc-150 rounded-2xl whitespace-pre-line font-mono">
                    {report.remediation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
