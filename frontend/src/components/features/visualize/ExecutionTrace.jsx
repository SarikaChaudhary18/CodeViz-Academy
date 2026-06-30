import React, { useState } from 'react';
import { Eye, ArrowRight, Play, RotateCcw, Box, Network } from 'lucide-react';
import { motion } from 'framer-motion';

const TRACE_STEPS = [
  { step: 1, desc: "Call factorial(3)", stack: ["factorial(3)"], env: { n: 3 }, output: "Pending" },
  { step: 2, desc: "n = 3, calls 3 * factorial(2)", stack: ["factorial(3)", "factorial(2)"], env: { n: 2 }, output: "Pending" },
  { step: 3, desc: "n = 2, calls 2 * factorial(1)", stack: ["factorial(3)", "factorial(2)", "factorial(1)"], env: { n: 1 }, output: "Pending" },
  { step: 4, desc: "n = 1, base case reached, returns 1", stack: ["factorial(3)", "factorial(2)"], env: { n: 1 }, output: "Returns 1" },
  { step: 5, desc: "factorial(2) evaluates 2 * 1 = 2, returns 2", stack: ["factorial(3)"], env: { n: 2 }, output: "Returns 2" },
  { step: 6, desc: "factorial(3) evaluates 3 * 2 = 6, returns 6", stack: [], env: { n: 3 }, output: "Final Result: 6" },
];

export default function ExecutionTrace() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TRACE_STEPS.length - 1) {
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

  const activeStepData = TRACE_STEPS[currentStep];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Eye className="text-orange-600 w-8 h-8" />
          EXECUTION TRACE VISUALIZER
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Trace stack frames and heap parameter modifications in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Code Scope (Left) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="text-xs font-mono font-bold text-zinc-950 flex items-center gap-1.5">
              <Box size={14} className="text-orange-600" /> SOURCE PROGRAM
            </span>
            <span className="text-[10px] font-mono text-zinc-400">JavaScript</span>
          </div>

          <pre className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl font-mono text-xs text-zinc-800 leading-relaxed text-left">
{`function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

factorial(3);`}
          </pre>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <button
              onClick={handleReset}
              className="p-2 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-950 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-800 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              >
                &larr; Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === TRACE_STEPS.length - 1}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Stack Frame & Environment Visualizer (Right) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
              <Network size={14} className="text-orange-600" /> Virtual Memory Stack
            </h2>

            {/* Description */}
            <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-xs text-zinc-800 text-left font-mono">
              <strong>Step {activeStepData.step}:</strong> {activeStepData.desc}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              
              {/* Stack visualizer */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Execution Stack Frame</span>
                <div className="border border-zinc-200 rounded-xl p-3 bg-zinc-50 min-h-[140px] flex flex-col-reverse justify-end gap-1.5">
                  {activeStepData.stack.map((frame, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-2 bg-orange-600 border border-orange-500 text-white text-[10px] font-mono font-bold rounded-lg text-center shadow-sm"
                    >
                      {frame}
                    </motion.div>
                  ))}
                  {activeStepData.stack.length === 0 && (
                    <span className="text-[10px] text-zinc-400 font-mono italic text-center my-auto">Stack Empty</span>
                  )}
                </div>
              </div>

              {/* Environment / variables visualizer */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Lexical Environment</span>
                <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 min-h-[140px] space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[9px]">Variables:</span>
                    <div className="mt-1 text-zinc-800">
                      n = <span className="text-orange-600 font-bold">{activeStepData.env.n}</span>
                    </div>
                  </div>
                  <div className="border-t border-zinc-150 pt-3">
                    <span className="text-zinc-400 block text-[9px]">Step Output:</span>
                    <span className="text-zinc-800 font-bold block mt-1 text-[11px]">{activeStepData.output}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
