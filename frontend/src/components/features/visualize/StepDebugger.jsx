import React, { useState } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Terminal, Server, Sparkles } from 'lucide-react';
import { api } from '../../../lib/api';
import InteractiveGraph from './InteractiveGraph';

export default function StepDebugger() {
  const [code, setCode] = useState(`function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}`);

  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  const handleGenerate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setDebugData(null);
    setStepIndex(0);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'step-debugger',
        payload: code
      });

      if (res.status === 'success' || res.data) {
        setDebugData(res.data);
      }
    } catch (err) {
      console.error('Failed to generate debugger steps:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (debugData?.debugSteps && stepIndex < debugData.debugSteps.length - 1) {
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

  const codeLines = code.split('\n');
  const activeStep = debugData?.debugSteps?.[stepIndex];

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Server className="text-orange-600 w-8 h-8 animate-pulse" />
          STEP-BY-STEP DEBUGGER
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Execute code forward and backward to inspect register memory values dynamically
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Editor panel with highlighted active line (Left) */}
        <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-xs font-mono font-bold text-zinc-950 flex items-center gap-1.5">
                <Terminal size={14} className="text-orange-600" /> SOURCE PROGRAM
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Debugger Console</span>
            </div>

            {!debugData && !loading ? (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-72 p-4 font-mono text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-900 leading-relaxed"
              />
            ) : (
              <div className="font-mono text-xs text-zinc-800 space-y-0.5 text-left bg-zinc-50 p-4 border border-zinc-150 rounded-xl overflow-y-auto max-h-[300px]">
                {codeLines.map((lineText, index) => {
                  const lineNumber = index + 1;
                  const isCurrentLine = activeStep && lineNumber === activeStep.line;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center py-0.5 pl-2 rounded transition-colors ${
                        isCurrentLine ? 'bg-orange-100/60 border-l-4 border-orange-600 font-bold' : ''
                      }`}
                    >
                      <span className="w-6 text-[10px] text-zinc-400 select-none">{lineNumber}</span>
                      <span className="whitespace-pre">{lineText}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-4">
            <button
              onClick={() => {
                setDebugData(null);
                setStepIndex(0);
              }}
              className="p-2 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-650 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>

            {!debugData ? (
              <button
                onClick={handleGenerate}
                disabled={loading || !code.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
              >
                {loading ? 'Initializing JVM...' : 'Launch Debugger'} <Sparkles size={12} />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={stepIndex === 0}
                  className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-800 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={stepIndex === debugData.debugSteps.length - 1}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                >
                  Forward &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* State and Variable Inspector (Right) */}
        <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
          {loading && (
            <div className="py-24 text-center text-zinc-555 font-mono text-xs space-y-3 animate-pulse my-auto">
              <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
              <p>Simulating debugger registers allocation states...</p>
            </div>
          )}

          {!debugData && !loading && (
            <div className="py-24 text-center text-zinc-400 font-mono text-xs my-auto">
              Initialize simulation and launch debugger to inspect registers state tables.
            </div>
          )}

          {debugData && !loading && (
            <div className="space-y-6">
              <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">
                Registers & Memory Inspector
              </h2>

              {/* Step Description */}
              {activeStep && (
                <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-xs text-zinc-800 text-left font-mono">
                  <strong>Step {stepIndex + 1}:</strong> {activeStep.action || 'Executing code line.'}
                </div>
              )}

              {/* Interactive Flow Graph */}
              {debugData.graph && (
                <div className="w-full">
                  <InteractiveGraph
                    graphData={debugData.graph}
                    activeNodeId={activeStep?.nodeId}
                    title="Control Flow"
                  />
                </div>
              )}

              {/* Variable Table */}
              {activeStep && activeStep.variablesState && (
                <div className="border border-zinc-200 rounded-xl overflow-hidden text-left font-mono text-xs">
                  <div className="grid grid-cols-2 bg-zinc-50 border-b border-zinc-200 font-bold p-3">
                    <span>Register Variable</span>
                    <span>Value State</span>
                  </div>
                  <div className="p-3 bg-zinc-50/20 text-orange-600 font-bold font-mono whitespace-pre-line">
                    {activeStep.variablesState}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
