import React, { useState } from 'react';
import { Network, Star, Database, Sparkles, Box, ListCollapse } from 'lucide-react';
import { api } from '../../../lib/api';
import InteractiveGraph from './InteractiveGraph';

export default function ArchitectureVisualizer() {
  const [spec, setSpec] = useState(`Express App server with CORS, Rate limiting, authentication middleware, user model, auth routes, and MongoDB database cluster connection.`);
  const [loading, setLoading] = useState(false);
  const [archData, setArchData] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const handleGenerate = async () => {
    if (!spec.trim()) return;
    setLoading(true);
    setArchData(null);
    setSelectedComponent(null);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'architecture',
        payload: spec
      });

      if (res.status === 'success' || res.data) {
        setArchData(res.data);
      }
    } catch (err) {
      console.error('Failed to generate architecture topology:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Network className="text-orange-600 w-8 h-8 animate-pulse" />
          ARCHITECTURE VISUALIZER
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Explore distributed software topologies, microservices nodes, and database connections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Specs Input & Node Metadata (Left) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
          <div className="space-y-4 text-left">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3 flex items-center gap-1">
              <Box size={14} className="text-orange-600" /> System Blueprint
            </h2>

            <textarea
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="Describe your architecture requirements or paste class structure..."
              className="w-full h-44 p-4 font-mono text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-900 leading-relaxed"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !spec.trim()}
              className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Analyzing topology...' : 'Compute Architecture Graph'} <Sparkles size={12} />
            </button>

            {/* Component inspector panel */}
            <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl min-h-[120px] space-y-2 mt-4">
              <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">Module Details</span>
              {selectedComponent ? (
                <div className="space-y-1 text-xs">
                  <h4 className="text-xs font-extrabold text-zinc-900">{selectedComponent.name}</h4>
                  <p className="text-[9px] font-mono uppercase text-orange-600 font-bold">{selectedComponent.type}</p>
                  <p className="text-[11px] text-zinc-650 leading-relaxed mt-1 font-mono">{selectedComponent.purpose}</p>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400 font-mono italic my-auto">
                  Click on list items to inspect modular boundaries.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Blueprint Flow Chart (Right) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
          {loading && (
            <div className="py-24 text-center text-zinc-555 font-mono text-xs space-y-3 animate-pulse my-auto">
              <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
              <p>Tracing components pipelines and load balancing topologies...</p>
            </div>
          )}

          {!archData && !loading && (
            <div className="py-24 text-center text-zinc-400 font-mono text-xs my-auto">
              Describe your software structure or paste code elements to visualize.
            </div>
          )}

          {archData && !loading && (
            <div className="space-y-6">
              <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider text-left border-b border-zinc-100 pb-3">
                Pipeline Graph Topology
              </h2>

              {archData.graph && (
                <div className="w-full">
                  <InteractiveGraph
                    graphData={archData.graph}
                    title="Architecture Graph"
                  />
                </div>
              )}

              {/* Component boundaries list */}
              {archData.components && archData.components.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block flex items-center gap-1.5"><ListCollapse size={12} /> Detected Modules</span>
                  <div className="flex flex-wrap gap-2">
                    {archData.components.map((comp, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedComponent(comp)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono transition-all font-bold ${
                          selectedComponent?.name === comp.name
                            ? 'border-orange-500 bg-orange-50/20 text-orange-600'
                            : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {comp.name}
                      </button>
                    ))}
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
