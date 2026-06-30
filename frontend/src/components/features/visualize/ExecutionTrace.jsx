import React, { useState } from 'react';
import { Eye, ArrowRight, RotateCcw, Box, Network, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../lib/api';
import InteractiveGraph from './InteractiveGraph';

export default function ExecutionTrace() {
  const [code, setCode] = useState(`function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
factorial(3);`);

  const [loading, setLoading] = useState(false);
  const [traceData, setTraceData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleGenerate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setTraceData(null);
    setCurrentStep(0);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'execution-trace',
        payload: code
      });

      if (res.status === 'success' || res.data) {
        setTraceData(res.data);
      }
    } catch (err) {
      console.error('Failed to generate execution trace:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (traceData?.steps && currentStep < traceData.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const activeStepData = traceData?.steps?.[currentStep];

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Eye className="text-orange-600 w-8 h-8 animate-pulse" />
          EXECUTION TRACE VISUALIZER
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Trace stack recursion trees and memory scopes dynamically using AI and Mermaid.js diagrams
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Code Scope (Left) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-xs font-mono font-bold text-zinc-950 flex items-center gap-1.5">
                <Box size={14} className="text-orange-600" /> SOURCE PROGRAM
              </span>
              <span className="text-[10px] font-mono text-zinc-400">JavaScript / Python</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 font-mono text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-900 leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
            <button
              onClick={() => {
                setTraceData(null);
                setCurrentStep(0);
              }}
              className="p-2 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-650 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Analyzing AST...' : 'Trace Execution'} <Sparkles size={12} />
            </button>
          </div>
        </div>

        {/* Visualizer output Column (Right) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[420px]">
          {loading && (
            <div className="py-24 text-center text-zinc-500 font-mono text-xs space-y-3 animate-pulse my-auto">
              <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
              <p>Tracing recursive calls stack frames...</p>
            </div>
          )}

          {!traceData && !loading && (
            <div className="py-24 text-center text-zinc-400 font-mono text-xs my-auto">
              Enter recursion code and trigger Trace to visualize variables stack logs.
            </div>
          )}

          {traceData && !loading && (
            <div className="space-y-6">
              <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
                <Network size={14} className="text-orange-600" /> Trace Visualizer Graph
              </h2>

              {/* Interactive Flow Graph */}
              {traceData.graph && (
                <div className="w-full">
                  <InteractiveGraph
                    graphData={traceData.graph}
                    activeNodeId={activeStepData?.nodeId}
                    title="Execution Flow"
                  />
                </div>
              )}

              {/* Stepper Controls */}
              {traceData.steps && traceData.steps.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400">Step {currentStep + 1} of {traceData.steps.length}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="px-3 py-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-800 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft size={10} /> Prev
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={currentStep === traceData.steps.length - 1}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        Next <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>

                  {activeStepData && (
                    <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl space-y-2 text-xs">
                      <div className="font-bold text-orange-950 font-mono text-[10px] uppercase">Execution Log</div>
                      <p className="text-zinc-850 font-mono leading-relaxed">{activeStepData.description}</p>
                      {activeStepData.variables && (
                        <div className="pt-2 border-t border-orange-100 font-mono text-[10px] text-zinc-600">
                          Variables Context: <span className="text-orange-600 font-bold">{activeStepData.variables}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
