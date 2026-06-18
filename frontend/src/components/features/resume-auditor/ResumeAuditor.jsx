import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';
import { FileText, Award, Terminal, Copy, ClipboardCheck, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';

export default function ResumeAuditor() {
  const [resumeText, setResumeText] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!resumeText || !targetJobTitle) {
      alert('Please fill in both resume text and target job title!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/resume/audit', {
        resumeText,
        targetJobTitle
      });
      if (response.status === 'success') {
        setResult(response.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to audit resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (result?.latexCode) {
      navigator.clipboard.writeText(result.latexCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header HUD */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
          AI RESUME LATEX AUDITOR
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          EVALUATE ATS GAP RATINGS AND DYNAMICALLY COMPILE PREMIUM HARSHIBAR OVERLEAF LATEX TEMPLATES
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="space-y-6">
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-violet relative overflow-hidden h-full">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <FileText size={18} className="text-violet-400" />
              Resume Source Text
            </h3>

            <form onSubmit={handleAudit} className="space-y-6">
              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Target Career Title</label>
                <input
                  type="text"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                  className="w-full bg-white/[0.02] border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Raw Resume content</label>
                <textarea
                  rows={12}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your existing resume content here. (Name, Contact, experience bullet points, skills checklist...)"
                  className="w-full bg-white/[0.02] border border-white/10 focus:border-violet-500/50 rounded-xl p-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-mono leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold py-4 rounded-xl shadow-lg box-glow-violet active:scale-[0.98] transition-all disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Auditing Credentials...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Audit & Compile LaTeX
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Realtime Score & LaTeX Output */}
        <div>
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-cyan relative overflow-hidden h-full min-h-[400px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center h-96 space-y-4"
                >
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-4 border-cyan-400/10 border-t-cyan-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">COMPILING MODEL MATRIX</h4>
                    <p className="text-[11px] text-gray-500 max-w-[200px] mt-1 leading-relaxed">
                      Re-writing bullet points using STAR method and mapping LaTeX tags.
                    </p>
                  </div>
                </motion.div>
              ) : !result ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center h-96 space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">ATS SCORECARD READY</h4>
                    <p className="text-[11px] text-gray-500 max-w-[200px] mt-1 leading-relaxed">
                      Submit your resume text to trigger ATS score evaluations and generate optimized structures.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  
                  {/* Score & Feedback HUD */}
                  <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.02)" strokeWidth="4" fill="transparent" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke={result.atsScore >= 90 ? '#10b981' : result.atsScore >= 70 ? '#f59e0b' : '#f43f5e'} 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={251.2} 
                          strokeDashoffset={251.2 - (251.2 * result.atsScore) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute font-mono font-bold text-2xl text-white">{result.atsScore}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">ATS SCORE RATING</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        An optimized level signifies high relevance score matching standard screen filter patterns.
                      </p>
                    </div>
                  </div>

                  {/* Feedback Bullets */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Auditor Feedback</h4>
                    <div className="space-y-1.5">
                      {result.feedback.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-xs text-gray-300 leading-relaxed flex gap-2">
                          <span className="text-cyan-400 font-bold font-mono">[{idx + 1}]</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LaTeX Editor block */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5">
                        <Terminal size={12} /> Generated LaTeX code
                      </h4>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
                      >
                        {copied ? <ClipboardCheck size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                    
                    <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-4 overflow-x-auto max-h-56 font-mono text-[10px] text-gray-300 leading-relaxed whitespace-pre scrollbar-thin">
                      {result.latexCode}
                    </div>
                  </div>

                  {/* Instructions banner */}
                  <div className="p-4 bg-violet-950/20 border border-violet-500/20 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-violet-400" />
                      LaTeX Template Rendering
                    </h5>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">{result.instructions}</p>
                    
                    <a
                      href="https://www.overleaf.com/latex/templates/harshibars-resume/sbcyynmtpnyd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase font-mono transition-all"
                    >
                      Open Overleaf Template <ExternalLink size={12} />
                    </a>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
