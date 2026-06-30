import React from 'react';
import { BookOpen, Code, Layers, FileCode, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PROJECTS_DATA = [
  {
    id: 1,
    title: "Real-Time WebSocket Chat Application",
    desc: "Build a chat server using Node.js and Socket.io with rooms, message history, and user activity streaks.",
    difficulty: "Medium",
    skills: ["WebSockets", "Node.js", "State Management"],
    milestones: ["Initialize HTTP & WebSocket servers", "Create room channels", "Implement message schema storage"]
  },
  {
    id: 2,
    title: "Dockerized Compiler Runner",
    desc: "Design an isolated system that spins up Docker nodes to compile and execute program scripts safely.",
    difficulty: "Hard",
    skills: ["Docker", "Linux Kernels", "Process Isolation"],
    milestones: ["Set up container pool configs", "Establish secure shell commands execution", "Capture stdout/stderr streams"]
  }
];

export default function ProjectList() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Layers className="text-orange-600 w-8 h-8" />
            PROJECT-BASED LEARNING
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Build full-stack portfolios by completing step-by-step corporate project blueprints
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
          <Award size={14} />
          <span>Active Projects: 2</span>
        </div>
      </div>

      {/* Grid of projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROJECTS_DATA.map((proj) => (
          <div 
            key={proj.id}
            className="bg-white border border-zinc-200 hover:border-orange-250 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all text-left"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-[9px] font-bold text-orange-600 font-mono rounded-full">
                  {proj.difficulty}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Milestones: {proj.milestones.length}</span>
              </div>

              <h3 className="text-base font-extrabold text-zinc-950 tracking-tight leading-tight">{proj.title}</h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{proj.desc}</p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {proj.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 font-mono text-[9px] rounded">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Milestones list */}
              <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">Key Milestones</span>
                {proj.milestones.map((m, i) => (
                  <div key={i} className="flex gap-2 items-center text-[11px] text-zinc-650 font-mono">
                    <CheckCircle2 size={12} className="text-orange-500 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/projects/reviewer')}
              className="w-full mt-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Start Project Work
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
