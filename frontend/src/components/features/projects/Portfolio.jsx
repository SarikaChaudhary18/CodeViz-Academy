import React from 'react';
import { User, FileText, Code, Globe, Link as LinkIcon, Award, Briefcase } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

export default function Portfolio() {
  const { user } = useStore();

  const mockPortfolio = {
    bio: "Passionate software engineering student specializing in scalable systems, algorithmic problem solving, and modern UI engineering frameworks.",
    completedTracks: ["Frontend Track - 90%", "DSA Masterclass - 75%"],
    verifiedProjects: [
      { name: "Real-Time Chat Web Application", tech: "WebSockets, Node.js, Socket.io" },
      { name: "Dockerized Safe Code Runner Container", tech: "Docker, Process isolation, Linux Kernels" }
    ],
    github: "https://github.com/SarikaChaudhary18",
    xp: user?.xp || 2340,
    level: user?.level || 3
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Globe className="text-orange-600 w-8 h-8" />
          AUTO-GENERATED PORTFOLIO
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Verify and distribute your synced studyquest performance indices to recruiters
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm text-left grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Profile Card Summary (Left) */}
        <div className="md:col-span-4 space-y-6 border-b md:border-b-0 md:border-r border-zinc-150 pb-6 md:pb-0 md:pr-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-orange-600 font-black text-white text-xl flex items-center justify-center mx-auto shadow-md">
              LVL {mockPortfolio.level}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-950 leading-tight">{user?.username || 'OperatorStudy'}</h3>
              <span className="text-[10px] font-mono text-orange-600 font-bold uppercase">{user?.targetRole || 'Fullstack Engineer'}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-100 pt-4 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">CodeViz Level</span>
              <span className="text-zinc-800 font-bold">{mockPortfolio.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Cumulative XP</span>
              <span className="text-orange-600 font-bold">{mockPortfolio.xp} XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Target Company</span>
              <span className="text-zinc-800 font-bold">{user?.targetCompany || 'Google'}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Details (Right) */}
        <div className="md:col-span-8 space-y-6">
          {/* Bio */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-1.5"><FileText size={12} className="text-orange-600" /> Executive Bio</span>
            <p className="text-xs text-zinc-700 leading-relaxed font-semibold">
              {mockPortfolio.bio}
            </p>
          </div>

          {/* Projects */}
          <div className="space-y-3 border-t border-zinc-100 pt-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-1.5"><Code size={12} className="text-orange-600" /> Verified Capstones</span>
            <div className="space-y-3">
              {mockPortfolio.verifiedProjects.map((p, i) => (
                <div key={i} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl">
                  <h4 className="text-xs font-bold text-zinc-900 leading-tight">{p.name}</h4>
                  <span className="text-[9px] font-mono text-zinc-500 mt-1 block">{p.tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Index */}
          <div className="space-y-3 border-t border-zinc-100 pt-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-1.5"><Award size={12} className="text-orange-600" /> Verified Curriculum Completion</span>
            <div className="flex flex-wrap gap-2">
              {mockPortfolio.completedTracks.map((track, i) => (
                <span key={i} className="px-3 py-1 bg-orange-50 border border-orange-100 text-[10px] font-mono font-bold text-orange-700 rounded-lg">
                  ✓ {track}
                </span>
              ))}
            </div>
          </div>

          {/* Share links */}
          <div className="pt-4 border-t border-zinc-100 flex gap-4">
            <a 
              href={mockPortfolio.github} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <LinkIcon size={12} /> Github Profile
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
