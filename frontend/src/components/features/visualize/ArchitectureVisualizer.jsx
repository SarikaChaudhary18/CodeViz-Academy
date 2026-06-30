import React, { useState } from 'react';
import { Network, Server, Database, Globe, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ARCHITECTURES = {
  threetier: {
    name: "Three-Tier Client Server",
    nodes: [
      { id: "client", label: "Web Client / CDN", type: "ingress", desc: "Serves static HTML/JS assets to consumers. Routes dynamic endpoints." },
      { id: "gateway", label: "Reverse Proxy (Nginx)", type: "proxy", desc: "Terminates SSL, filters network rates, forwards sockets streams." },
      { id: "app", label: "Express App Cluster", type: "server", desc: "Runs computational endpoints, checks auth tokens, queries database." },
      { id: "db", label: "PostgreSQL Database", type: "db", desc: "Stores tabular application user progress indexes." }
    ]
  },
  microservices: {
    name: "Distributed Microservices",
    nodes: [
      { id: "client", label: "Web Client / CDN", type: "ingress", desc: "Serves static HTML/JS assets to consumers. Routes dynamic endpoints." },
      { id: "api", label: "Kong API Gateway", type: "proxy", desc: "Decrypts JWT tokens, logs performance payloads, proxies requests." },
      { id: "auth", label: "Auth Microservice", type: "server", desc: "Validates credentials, issues tokens, manages sessions." },
      { id: "dsa", label: "DSA Sandbox Runner", type: "server", desc: "Executes sandbox code in isolated Docker environments." },
      { id: "chat", label: "Websocket Chat Server", type: "server", desc: "Maintains live WS connections, distributes message payloads." }
    ]
  }
};

export default function ArchitectureVisualizer() {
  const [activeArchKey, setActiveArchKey] = useState('threetier');
  const [hoveredNode, setHoveredNode] = useState(null);

  const activeArch = ARCHITECTURES[activeArchKey];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Network className="text-orange-600 w-8 h-8" />
          ARCHITECTURE VISUALIZER
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Explore distributed software topologies, database replication, and gateways pipelines
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Topology Selector & Descriptions (Left) */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4 text-left">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">
              Blueprints
            </h2>

            <div className="flex flex-col gap-2">
              {Object.keys(ARCHITECTURES).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveArchKey(key);
                    setHoveredNode(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-xs font-mono font-bold text-left transition-all ${
                    activeArchKey === key
                      ? 'border-orange-500 bg-orange-50/40 text-orange-950'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-850'
                  }`}
                >
                  {ARCHITECTURES[key].name}
                </button>
              ))}
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl min-h-[140px] space-y-2 mt-4">
              <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">Node Metadata</span>
              {hoveredNode ? (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900">{hoveredNode.label}</h4>
                  <p className="text-[11px] text-zinc-650 leading-relaxed">{hoveredNode.desc}</p>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400 font-mono italic my-auto">
                  Hover cursor over node blocks to inspect role details.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Blueprint Flow Chart (Right) */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider text-left">
              Pipeline Graph Topology
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-12 bg-zinc-50 border border-zinc-150 rounded-2xl relative overflow-hidden min-h-[300px]">
              
              {activeArch.nodes.map((node, index) => {
                return (
                  <React.Fragment key={node.id}>
                    <motion.div
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      whileHover={{ scale: 1.05 }}
                      className={`w-36 p-4 rounded-2xl border bg-white shadow-sm flex flex-col items-center text-center cursor-pointer transition-all hover:border-orange-500`}
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mb-2">
                        {node.type === 'ingress' ? <Globe size={18} /> :
                         node.type === 'proxy' ? <ShieldAlert size={18} /> :
                         node.type === 'server' ? <Server size={18} /> :
                         <Database size={18} />}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-800 tracking-tight leading-tight">{node.label}</span>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">{node.type}</span>
                    </motion.div>

                    {index + 1 < activeArch.nodes.length && (
                      <ArrowRight size={16} className="text-orange-500/80 rotate-90 md:rotate-0" />
                    )}
                  </React.Fragment>
                );
              })}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
