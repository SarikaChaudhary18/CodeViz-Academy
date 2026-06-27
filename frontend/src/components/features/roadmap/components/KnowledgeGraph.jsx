import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, ArrowRight, Zap, Info, ShieldCheck, PlayCircle } from 'lucide-react';

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
  'devops': [
    { source: 'Linux & Bash', target: 'Docker', desc: 'Containerization container bounds' },
    { source: 'Docker', target: 'Docker Compose', desc: 'Multi-container application setups' },
    { source: 'Docker Compose', target: 'Kubernetes', desc: 'Enterprise container orchestration clusters' },
    { source: 'Kubernetes', target: 'Helm Charts', desc: 'Kubernetes package configuration manager' },
    { source: 'Linux & Bash', target: 'Nginx', desc: 'Reverse proxying & load balancing load' },
    { source: 'Nginx', target: 'CI/CD Pipelines', desc: 'Automated code integration & deployment' },
    { source: 'CI/CD Pipelines', target: 'Terraform', desc: 'Declarative infrastructure as code' }
  ],
  'mobile': [
    { source: 'Kotlin', target: 'Jetpack Compose', desc: 'Declarative Android UI compiler' },
    { source: 'Kotlin', target: 'Retrofit', desc: 'Interface-based HTTP parsing' },
    { source: 'Jetpack Compose', target: 'MVVM/MVI', desc: 'State-driven app architecture' },
    { source: 'MVVM/MVI', target: 'Clean Architecture', desc: 'Layered domain encapsulation' },
    { source: 'Clean Architecture', target: 'Dagger Hilt', desc: 'Module dependency injection' },
    { source: 'Dagger Hilt', target: 'Room DB', desc: 'Local SQL database storage' }
  ]
};

export default function KnowledgeGraph({ roadmapId = 'web-dev' }) {
  // Map internal track names to match relationships keys
  const getMappedTrackId = (id) => {
    if (id === 'web-dev') return 'web-dev';
    if (id === 'ai-ml') return 'ai-ml';
    if (id === 'devops') return 'devops';
    if (id === 'mobile') return 'mobile';
    return 'web-dev';
  };

  const links = RELATIONSHIPS[getMappedTrackId(roadmapId)] || RELATIONSHIPS['web-dev'];
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  
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
    const r = 110 + (idx % 2 === 0 ? 30 : -25); // alternate radius to avoid congestion
    nodePositions[name] = {
      x: 200 + r * Math.cos(angle - Math.PI / 2),
      y: 160 + r * Math.sin(angle - Math.PI / 2)
    };
  });

  const handleNodeClick = (nodeName) => {
    const dependencies = links.filter(l => l.source === nodeName).map(l => l.target);
    const prerequisites = links.filter(l => l.target === nodeName).map(l => l.source);
    setSelectedNode(prev => prev?.name === nodeName ? null : {
      name: nodeName,
      dependencies,
      prerequisites
    });
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5 space-y-6 flex flex-col flex-1 relative overflow-hidden group/graph">
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash-fast {
          animation: dash 0.8s linear infinite;
        }
        .animate-dash-slow {
          animation: dash 2.5s linear infinite;
        }
        .node-glow {
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
        }
        .node-glow-cyan {
          filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
        }
        .node-glow-green {
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
        }
      `}</style>

      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header and Details */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4 z-10">
        <div>
          <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Network size={18} className="text-violet-400" />
            Interactive Knowledge Topology
          </h4>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Visualize path dependencies, logical branches, and node connections.
          </p>
        </div>
        
        {selectedNode && (
          <button 
            onClick={() => setSelectedNode(null)} 
            className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider self-start sm:self-center"
          >
            Reset Graph Selection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch z-10">
        
        {/* SVG Viewport */}
        <div className="lg:col-span-2 relative bg-slate-950/80 border border-white/5 rounded-2xl overflow-hidden min-h-[340px] flex items-center justify-center shadow-inner">
          <svg className="w-full h-full min-h-[340px] max-w-[500px]" viewBox="0 0 400 320">
            {/* Definitions for Gradients */}
            <defs>
              <linearGradient id="selectedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="inactiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>

            {/* Draw Relationship Lines */}
            {links.map((link, idx) => {
              const start = nodePositions[link.source];
              const end = nodePositions[link.target];
              if (!start || !end) return null;

              const isSelectedSource = selectedNode && selectedNode.name === link.source;
              const isSelectedTarget = selectedNode && selectedNode.name === link.target;
              const isHighlighted = isSelectedSource || isSelectedTarget;
              const isActiveFlow = isSelectedSource; // flow originates from selected node

              return (
                <g key={idx}>
                  {/* Underlay glow path */}
                  {isHighlighted && (
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={isActiveFlow ? '#10b981' : '#f59e0b'}
                      strokeWidth="3.5"
                      strokeOpacity="0.3"
                      className="blur-[2px] transition-all duration-300"
                    />
                  )}

                  {/* Core connection line */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={
                      isHighlighted 
                        ? (isActiveFlow ? '#10b981' : '#f59e0b') 
                        : 'rgba(255,255,255,0.06)'
                    }
                    strokeWidth={isHighlighted ? '1.5' : '1'}
                    strokeDasharray={isHighlighted ? (isActiveFlow ? '6,3' : '4,4') : undefined}
                    className={`transition-all duration-300 ${isHighlighted ? (isActiveFlow ? 'animate-dash-fast' : 'animate-dash-slow') : ''}`}
                  />
                  
                  {/* Directional Dot */}
                  <circle
                    cx={(start.x + end.x) / 2}
                    cy={(start.y + end.y) / 2}
                    r={isHighlighted ? '2.5' : '1.5'}
                    fill={isHighlighted ? (isActiveFlow ? '#34d399' : '#fbbf24') : 'rgba(255,255,255,0.15)'}
                    className="transition-all duration-300"
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
              const isHovered = hoveredNode === name;

              let strokeColor = 'rgba(255,255,255,0.08)';
              let nodeColor = 'url(#inactiveGrad)';
              let textColor = '#94a3b8';
              let glowClass = '';

              if (isSelected) {
                strokeColor = '#a855f7';
                nodeColor = 'url(#selectedGrad)';
                textColor = '#ffffff';
                glowClass = 'node-glow';
              } else if (isPrereq) {
                strokeColor = '#f59e0b';
                nodeColor = 'rgba(245, 158, 11, 0.1)';
                textColor = '#f59e0b';
                glowClass = 'node-glow';
              } else if (isDep) {
                strokeColor = '#10b981';
                nodeColor = 'rgba(16, 185, 129, 0.1)';
                textColor = '#10b981';
                glowClass = 'node-glow-green';
              } else if (isHovered) {
                strokeColor = 'rgba(255,255,255,0.25)';
                textColor = '#ffffff';
              }

              return (
                <g 
                  key={idx} 
                  className="cursor-pointer group/node" 
                  onClick={() => handleNodeClick(name)}
                  onMouseEnter={() => setHoveredNode(name)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Outer animated halo for hovered/selected nodes */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      className="fill-none stroke-[0.5px] stroke-violet-500/30 animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                  )}

                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="16"
                    fill={nodeColor === 'url(#selectedGrad)' || nodeColor === 'url(#inactiveGrad)' ? nodeColor : '#020617'}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? '2' : (isHovered ? '1.5' : '1')}
                    className={`transition-all duration-300 ${glowClass}`}
                    style={
                      nodeColor !== 'url(#selectedGrad)' && nodeColor !== 'url(#inactiveGrad)'
                        ? { fill: '#020617', stroke: strokeColor }
                        : {}
                    }
                  />
                  
                  {/* Label Container */}
                  <foreignObject
                    x={pos.x - 40}
                    y={pos.y - 10}
                    width="80"
                    height="20"
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span 
                        className="text-[8px] font-sans font-bold tracking-tight text-center block leading-none truncate px-1 rounded transition-colors duration-300"
                        style={{ color: textColor }}
                      >
                        {name}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* Micro Tooltip */}
          <AnimatePresence>
            {hoveredNode && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-white/10 rounded-xl px-4 py-2 text-xs flex items-center gap-2 backdrop-blur-md"
              >
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="font-semibold text-white">{hoveredNode}</span>
                <span className="text-slate-400 text-[11px] truncate">
                  {links.find(l => l.source === hoveredNode || l.target === hoveredNode)?.desc || 'Topology node component'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Node Detail Explainer Panel */}
        <div className="lg:col-span-1 bg-slate-950/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between min-h-[220px] backdrop-blur-md">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Selected Concept Node</span>
                <h5 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <Zap size={15} className="text-amber-400 fill-amber-400/20" />
                  {selectedNode.name}
                </h5>
              </div>

              {selectedNode.prerequisites.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Prerequisites (Required)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.prerequisites.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-sans rounded-md text-[10px] font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.dependencies.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Unlocks (Next Topics)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.dependencies.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans rounded-md text-[10px] font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-white/5 pt-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Connection Vectors</span>
                <div className="max-h-[100px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {links.filter(l => l.source === selectedNode.name || l.target === selectedNode.name).map((l, idx) => (
                    <div key={idx} className="flex gap-1.5 items-start text-slate-300 text-xs">
                      <span className="text-violet-400 font-semibold flex-shrink-0">{l.source === selectedNode.name ? 'Unlocks' : 'Needs'}</span>
                      <ArrowRight size={10} className="mt-1.5 text-slate-600 flex-shrink-0" />
                      <span className="text-slate-400 font-sans">
                        <strong className="text-white font-medium">{l.source === selectedNode.name ? l.target : l.source}</strong>: {l.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 space-y-3 py-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Info size={20} className="text-violet-400" />
              </div>
              <div className="max-w-[200px]">
                <p className="font-semibold text-white text-xs mb-1">Explore Connections</p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Click any technology node on the graph network to display prerequisites, dependencies, and vector unlocks.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
