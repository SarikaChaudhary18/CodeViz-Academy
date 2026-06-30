import React, { useState } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Terminal, Server } from 'lucide-react';
import { motion } from 'framer-motion';

const DEBUG_STEPS = [
  { line: 2, desc: "Initialize loop variables: i = 0", state: { arr: [3, 1, 2], i: 0, j: null, temp: null } },
  { line: 3, desc: "Inner loop starts: j = 0. Compare arr[0] (3) and arr[1] (1)", state: { arr: [3, 1, 2], i: 0, j: 0, temp: null } },
  { line: 4, desc: "Condition met (3 > 1). Perform swap operations", state: { arr: [3, 1, 2], i: 0, j: 0, temp: 3 } },
  { line: 5, desc: "Swap complete: arr = [1, 3, 2]", state: { arr: [1, 3, 2], i: 0, j: 0, temp: null } },
  { line: 3, desc: "Inner loop increments: j = 1. Compare arr[1] (3) and arr[2] (2)", state: { arr: [1, 3, 2], i: 0, j: 1, temp: null } },
  { line: 4, desc: "Condition met (3 > 2). Perform swap operations", state: { arr: [1, 3, 2], i: 0, j: 1, temp: 3 } },
  { line: 5, desc: "Swap complete: arr = [1, 2, 3]", state: { arr: [1, 2, 3], i: 0, j: 1, temp: null } },
  { line: 7, desc: "Sorting algorithm finished. Returns [1, 2, 3]", state: { arr: [1, 2, 3], i: 1, j: null, temp: null } }
];

const CODE_LINES = [
  "function bubbleSort(arr) {",
  "  for (let i = 0; i < arr.length; i++) {",
  "    for (let j = 0; j < arr.length - 1; j++) {",
  "      if (arr[j] > arr[j + 1]) {",
  "        swap(arr, j, j + 1);",
  "      }",
  "    }",
  "  }",
  "}"
];

export default function StepDebugger() {
  const [stepIndex, setStepIndex] = useState(0);

  const handleNext = () => {
    if (stepIndex < DEBUG_STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
  };

  const activeStep = DEBUG_STEPS[stepIndex];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Server className="text-orange-600 w-8 h-8" />
          STEP-BY-STEP DEBUGGER
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Execute code forward and backward to inspect register memory values
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Editor panel with highlighted active line (Left) */}
        <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-xs font-mono font-bold text-zinc-950 flex items-center gap-1.5">
                <Terminal size={14} className="text-orange-600" /> SOURCE PROGRAM
              </span>
              <span className="text-[10px] font-mono text-zinc-400">bubble_sort.js</span>
            </div>

            <div className="font-mono text-xs text-zinc-800 space-y-0.5 text-left bg-zinc-50 p-4 border border-zinc-150 rounded-xl">
              {CODE_LINES.map((lineText, index) => {
                const lineNumber = index + 1;
                const isCurrentLine = lineNumber === activeStep.line;
                return (
                  <div 
                    key={index} 
                    className={`flex items-center py-0.5 pl-2 rounded transition-colors ${
                      isCurrentLine ? 'bg-orange-100/60 border-l-4 border-orange-600 font-bold' : ''
                    }`}
                  >
                    <span className="w-6 text-[10px] text-zinc-400 select-none">{lineNumber}</span>
                    <span>{lineText}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-4">
            <button
              onClick={handleReset}
              className="p-2 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-950 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={stepIndex === 0}
                className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-800 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={stepIndex === DEBUG_STEPS.length - 1}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
              >
                Forward <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* State and Variable Inspector (Right) */}
        <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider">
              Registers & Memory Inspector
            </h2>

            {/* Step Description */}
            <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-xs text-zinc-800 text-left font-mono">
              <strong>Step {stepIndex + 1}:</strong> {activeStep.desc}
            </div>

            {/* Variable Table */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden text-left font-mono text-xs">
              <div className="grid grid-cols-2 bg-zinc-55 border-b border-zinc-200 font-bold p-3">
                <span>Register Variable</span>
                <span>Runtime Value</span>
              </div>

              <div className="divide-y divide-zinc-200 bg-zinc-50/30">
                <div className="grid grid-cols-2 p-3">
                  <span className="text-zinc-500 font-bold">arr</span>
                  <span className="text-orange-600 font-bold">[{activeStep.state.arr.join(', ')}]</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-zinc-500 font-bold">i</span>
                  <span className="text-zinc-800">{activeStep.state.i}</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-zinc-500 font-bold">j</span>
                  <span className="text-zinc-800">{activeStep.state.j === null ? 'null' : activeStep.state.j}</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-zinc-500 font-bold">temp</span>
                  <span className="text-zinc-850 font-bold">{activeStep.state.temp === null ? 'null' : activeStep.state.temp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
