import React, { useState } from 'react';
import { Search, Compass, Users, CheckCircle2, ChevronRight, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const CANDIDATES = [
  {
    id: 1,
    name: "Sarika Chaudhary",
    role: "Frontend Developer",
    skills: ["React", "JavaScript", "Tailwind"],
    replayTimeline: [
      { day: "Day 1", event: "Initialized Profile & completed HTML Basics" },
      { day: "Day 3", event: "Solved 12 LeetCode Medium questions on Arrays" },
      { day: "Day 7", event: "Completed CSS Grid Course & built Hero Landing Page mockup" }
    ]
  },
  {
    id: 2,
    name: "Mohit Mudgil",
    role: "Fullstack Developer",
    skills: ["Next.js", "Node.js", "Docker"],
    replayTimeline: [
      { day: "Day 1", event: "Configured local environment database models" },
      { day: "Day 4", event: "Deployed REST APIs & built Websockets chat engine" },
      { day: "Day 6", event: "Dockerized compiler runtime execution runner" }
    ]
  }
];

export default function RecruiterPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(CANDIDATES[0]);

  const filteredCandidates = CANDIDATES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Users className="text-orange-600 w-8 h-8" />
          RECRUITER ACCESS PORTAL
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Review candidates verified technical profiles and live playbacks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Candidate List (Left) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3 text-left">
            Candidate Pipeline
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name or role..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-900"
            />
          </div>

          <div className="space-y-2 pt-2 text-left">
            {filteredCandidates.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCandidate(c)}
                className={`w-full p-4 rounded-xl border text-xs font-mono font-bold text-left transition-all ${
                  selectedCandidate.id === c.id
                    ? 'border-orange-500 bg-orange-50/40 text-orange-950'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800'
                }`}
              >
                <div className="font-extrabold text-xs">{c.name}</div>
                <div className="text-[10px] text-zinc-550 mt-1 font-semibold">{c.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Learning Replay Timeline (Right) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
              <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider">
                Candidate Replay Timeline
              </h2>
              <span className="text-[10px] bg-orange-50 border border-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded font-mono">
                Verified logs
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-zinc-950 leading-tight">{selectedCandidate.name}</h3>
              <p className="text-[10px] text-zinc-500 font-mono uppercase">{selectedCandidate.role}</p>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l-2 border-orange-200 ml-3 space-y-6">
              {selectedCandidate.replayTimeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 bg-orange-600 rounded-full border-4 border-white flex items-center justify-center shadow" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-orange-600 block">{item.day}</span>
                    <p className="text-zinc-700 mt-1 leading-relaxed">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
