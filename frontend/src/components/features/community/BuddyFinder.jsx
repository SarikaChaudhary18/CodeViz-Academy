import React, { useState } from 'react';
import { Search, Users, MessageSquare, Compass, CheckCircle2, UserCheck, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const ONLINE_USERS = [
  { id: 1, name: "Sarika Chaudhary", targetRole: "Frontend Developer", targetCompany: "Google", streak: 28, online: true, connected: false },
  { id: 2, name: "Mohit Mudgil", targetRole: "Fullstack Developer", targetCompany: "Meta", streak: 15, online: true, connected: false },
  { id: 3, name: "Aman Gupta", targetRole: "DSA Specialist", targetCompany: "Adobe", streak: 8, online: true, connected: false },
  { id: 4, name: "Riya Sen", targetRole: "Backend Engineer", targetCompany: "Netflix", streak: 22, online: false, connected: false }
];

export default function BuddyFinder() {
  const [buddies, setBuddies] = useState(ONLINE_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleConnect = (id) => {
    setBuddies(prev => 
      prev.map(buddy => 
        buddy.id === id ? { ...buddy, connected: !buddy.connected } : buddy
      )
    );
  };

  const filteredBuddies = buddies.filter(buddy => 
    buddy.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    buddy.targetCompany.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Users className="text-orange-600 w-8 h-8" />
            STUDY BUDDY FINDER
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Connect with peers preparing for the same tech corporate sprints
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 relative flex items-center">
        <Search className="absolute left-7 text-zinc-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by name or target company (e.g. Google)..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuddies.map((buddy) => (
          <div 
            key={buddy.id}
            className="bg-white border border-zinc-200 hover:border-orange-250 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all text-left"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${buddy.online ? 'bg-green-500' : 'bg-zinc-300'}`} />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{buddy.online ? 'Online' : 'Offline'}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold font-mono rounded-full">
                  <Flame size={12} className="animate-pulse" /> {buddy.streak} Days
                </div>
              </div>

              <h3 className="text-base font-extrabold text-zinc-950 tracking-tight">{buddy.name}</h3>
              <div className="text-[11px] text-zinc-650 font-mono mt-1">
                Targeting: <span className="font-bold text-zinc-800">{buddy.targetCompany}</span>
              </div>
              <p className="text-xs text-zinc-550 leading-relaxed mt-3 border-t border-zinc-100 pt-3">
                Prepping for {buddy.targetRole} role profiles. Let's practice coding algorithms together!
              </p>
            </div>

            <button
              onClick={() => toggleConnect(buddy.id)}
              className={`w-full mt-6 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                buddy.connected 
                  ? 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200' 
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}
            >
              {buddy.connected ? (
                <>
                  <UserCheck size={14} /> Invite Sent
                </>
              ) : (
                <>
                  <MessageSquare size={14} /> Connect Partner
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
