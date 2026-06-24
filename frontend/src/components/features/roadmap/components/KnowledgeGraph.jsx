import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, ArrowRight, Zap, Info } from 'lucide-react';

const RELATIONSHIPS = {
  'web-dev': [
    { source: 'JavaScript', target: 'React', desc: 'Core UI framework foundation' },
    { source: 'JavaScript', target: 'Vue', desc: 'Alternative reactive engine' },
    { source: 'JavaScript', target: 'Node.js', desc: 'Backend runtime environment' },
    { source: 'React', target: 'Next.js', desc: 'Server-side rendering meta-framework' },
    { source: 'React', target: 'Remix', desc: 'Data-driven router meta-framework' },
    { source: 'React', target: 'Astro', desc: 'Static site content delivery' },
    { source: 'Node.js', target: 'Express', desc: 'Minimalist routing server layer' },
    { source: 'Node.js', target: 'NestJS', desc: 'Structured OOP enterprise backend' },
    { source: 'Express', target: 'Socket.io', desc: 'Realtime WebSocket orchestration' },
    { source: 'Express', target: 'Redis', desc: 'High-speed local cache layer' },
    { source: 'Express', target: 'Prisma', desc: 'Type-safe SQL query mapping' }
  ],
  'ai-ml': [
    { source: 'Python', target: 'NumPy', desc: 'High-performance matrix compute' },
    { source: 'Python', target: 'Pandas', desc: 'Dataframe tables parsing' },
    { source: 'NumPy', target: 'Scikit-Learn', desc: 'Classical Machine Learning models' },
    { source: 'NumPy', target: 'PyTorch', desc: 'Deep learning neural array compiler' },
    { source: 'PyTorch', target: 'Transformers', desc: 'Attention-based transformer weights' },
    { source: 'Transformers', target: 'GPT & Llama', desc: 'Large language foundation weights' },
    { source: 'GPT & Llama', target: 'RAG Systems', desc: 'Vector database search context' },
    { source: 'GPT & Llama', target: 'AI Agents', desc: 'Tool calling loops & LLM reasoning' },
    { source: 'AI Agents', target: 'CrewAI', desc: 'Multi-agent sequential delegation' }
  ],
  'app-dev': [
    { source: 'Kotlin', target: 'Jetpack Compose', desc: 'Declarative Android UI compiler' },
    { source: 'Kotlin', target: 'Retrofit', desc: 'Interface-based HTTP parsing' },
    { source: 'Jetpack Compose', target: 'MVVM/MVI', desc: 'State-driven app architecture' },
    { source: 'MVVM/MVI', target: 'Clean Architecture', desc: 'Layered domain encapsulation' },
    { source: 'Clean Architecture', target: 'Dagger Hilt', desc: 'Module dependency injection' },
    { source: 'Dagger Hilt', target: 'Room DB', desc: 'Local SQL database storage' }
  ],
  'competitive-programming': [
    { source: 'C++', target: 'Arrays & Strings', desc: 'Baseline linear elements' },
    { source: 'Arrays & Strings', target: 'Linked Lists', desc: 'Dynamic pointer allocation' },
    { source: 'Linked Lists', target: 'Trees & Graphs', desc: 'Non-linear tree networks' },
    { source: 'Trees & Graphs', target: 'Dynamic Programming', desc: 'Sub-problem memoization structures' },
    { source: 'Trees & Graphs', target: 'Segment Trees', desc: 'Logarithmic range query trees' }
  ]
};

export default function KnowledgeGraph({ roadmapId = 'web-dev' }) {
  const links = RELATIONSHIPS[roadmapId] || RELATIONSHIPS['web-dev'];
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Extract unique nodes
  const nodesSet = new Set();
  links.forEach(l => {
    nodesSet.add(l.source);
    nodesSet.add(l.target);
  });
  const nodesList = Array.from(nodesSet);

  // Position nodes geometrically in circular grid or S-clusters
  const nodePositions = {};
  nodesList.forEach((name, idx) => {
    const angle = (idx / nodesList.length) * 2.0 * Math.PI;
    const r = 100 + (idx % 2 === 0 ? 30 : -20); // alternate radius to avoid congestion
    nodePositions[name] = {
      x: 200 + r * Math.cos(angle),
      y: 150 + r * Math.sin(angle)
    };
  });

  const handleNodeClick = (nodeName) => {
    const dependencies = links.filter(l => l.source === nodeName).map(l => l.target);
    const prerequisites = links.filter(l => l.target === nodeName).map(l => l.source);
    setSelectedNode({
      name: nodeName,
      dependencies,
      prerequisites
    });
  };

  return (
    <div className="glassmorphism rounded-3xl p-6 border-white/5 flex flex-col flex-1 min-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Network size={16} className="text-cyan-400" />
            Dependency Knowledge Graph
          </h4>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-widest">
            Visualizing package pipelines & prerequisite hierarchies
          </p>
        </div>
        
        {selectedNode && (
          <button 
            onClick={() => setSelectedNode(null)} 
            className="text-[9px] font-mono text-zinc-500 hover:text-white uppercase tracking-wider"
          >
            Clear Target
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
        
        {/* SVG Viewport */}
        <div className="lg:col-span-2 relative bg-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden min-h-[280px] flex items-center justify-center">
          <svg className="w-full h-full min-h-[300px] max-w-[500px]" viewBox="0 0 400 300">
            {/* Draw Relationship Lines */}
            {links.map((link, idx) => {
              const start = nodePositions[link.source];
              const end = nodePositions[link.target];
              if (!start || !end) return null;

              const isHighlighted = selectedNode && 
                (selectedNode.name === link.source || selectedNode.name === link.target);

              return (
                <g key={idx}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isHighlighted ? '#06b6d4' : 'rgba(255,255,255,0.06)'}
                    strokeWidth={isHighlighted ? '2' : '1'}
                    className="transition-all duration-300"
                  />
                  {/* Arrow Indicator */}
                  <circle
                    cx={(start.x + end.x) / 2}
                    cy={(start.y + end.y) / 2}
                    r="2.5"
                    fill={isHighlighted ? '#22d3ee' : 'rgba(255,255,255,0.1)'}
                  />
                </g>
              );
            })}

            {/* Draw Nodes */}
            {nodesList.map((name, idx) => {
              const pos = nodePositions[name];
              if (!pos) return null;

              const isSelected = selectedNode && selectedNode.name === name;
              const isPrereq = selectedNode && selectedNode.prerequisites.includes(name);
              const isDep = selectedNode && selectedNode.dependencies.includes(name);

              let nodeColor = 'bg-zinc-900 border-white/10 text-zinc-400';
              if (isSelected) nodeColor = 'bg-cyan-500 border-cyan-400 text-zinc-950 font-bold';
              else if (isPrereq) nodeColor = 'bg-amber-950/40 border-amber-500/30 text-amber-400';
              else if (isDep) nodeColor = 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400';

              return (
                <g key={idx} className="cursor-pointer" onClick={() => handleNodeClick(name)}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="16"
                    className={`fill-zinc-950 stroke-2 ${isSelected ? 'stroke-cyan-400' : 'stroke-white/10'} transition-all`}
                  />
                  <foreignObject
                    x={pos.x - 35}
                    y={pos.y - 10}
                    width="70"
                    height="20"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className={`text-[7px] font-mono font-bold uppercase text-center block leading-none truncate px-1 rounded ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`}>
                        {name}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Detail Explainer Panel */}
        <div className="lg:col-span-1 bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between min-h-[160px] text-[10px]">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">Selected Target Node</span>
                <h5 className="text-sm font-bold text-white font-mono uppercase tracking-wide mt-1 flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-400" />
                  {selectedNode.name}
                </h5>
              </div>

              {selectedNode.prerequisites.length > 0 && (
                <div>
                  <span className="text-[8px] font-mono text-amber-400 uppercase tracking-widest block font-bold mb-1">Prerequisites</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.prerequisites.map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono rounded text-[8px] uppercase">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.dependencies.length > 0 && (
                <div>
                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest block font-bold mb-1">Unlocks (Dependencies)</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.dependencies.map(d => (
                      <span key={d} className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono rounded text-[8px] uppercase">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-white/5 pt-3 leading-relaxed">
                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Vector Links Summary</span>
                {links.filter(l => l.source === selectedNode.name || l.target === selectedNode.name).map((l, idx) => (
                  <div key={idx} className="flex gap-1 items-start text-zinc-400 text-[9px]">
                    <span className="text-cyan-400 font-bold font-mono">{l.source}</span>
                    <ArrowRight size={8} className="mt-1" />
                    <span>{l.target}: {l.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-zinc-500 space-y-2">
              <Info size={20} className="text-zinc-600" />
              <p className="font-mono uppercase tracking-wider text-[9px]">
                Click any technology node in the network graph to inspect dependencies, prerequisites, and layout pathways.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
