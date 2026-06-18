import React, { useEffect, useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ExternalLink, Calendar, Users, Search, Plus, Filter, MessageCircle } from 'lucide-react';

export default function Hackathons() {
  const { hackathons, hackathonsLoading, fetchHackathons, user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  
  // Custom mock squad postings
  const [squads, setSquads] = useState([
    {
      id: 1,
      title: 'Global AI Innovators',
      event: 'Global AI Innovators Challenge',
      needs: 'AI Engineer / Python specialist',
      minLvl: 3,
      postedBy: 'CyberSam',
      contact: 'cybersam@studyquest.io'
    },
    {
      id: 2,
      title: 'Vite Speedsters',
      event: 'Vite & Tailwind Hackfest',
      needs: 'Frontend React Dev / CSS Grid wizard',
      minLvl: 2,
      postedBy: 'NeoCoder',
      contact: 'neo@studyquest.io'
    }
  ]);

  const [showAddSquad, setShowAddSquad] = useState(false);
  const [newSquadTitle, setNewSquadTitle] = useState('');
  const [newSquadEvent, setNewSquadEvent] = useState('');
  const [newSquadNeeds, setNewSquadNeeds] = useState('');
  const [newSquadMinLvl, setNewSquadMinLvl] = useState(1);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  const handlePostSquad = (e) => {
    e.preventDefault();
    if (!newSquadTitle || !newSquadNeeds || !newSquadEvent) return;

    const newPost = {
      id: squads.length + 1,
      title: newSquadTitle,
      event: newSquadEvent,
      needs: newSquadNeeds,
      minLvl: parseInt(newSquadMinLvl, 10),
      postedBy: user?.username || 'Operator',
      contact: user?.email || 'contact@studyquest.io'
    };

    setSquads([newPost, ...squads]);
    setNewSquadTitle('');
    setNewSquadEvent('');
    setNewSquadNeeds('');
    setNewSquadMinLvl(1);
    setShowAddSquad(false);
    alert('Squad recruitment posted successfully!');
  };

  // Compile tags
  const allTags = ['All', ...new Set(hackathons.flatMap(h => h.tags || []))];

  // Filtering
  const filteredHackathons = hackathons.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.host.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || h.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8">
      
      {/* Header HUD */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
          HACKATHON BULLETINS
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          LIVE EVENT NOTIFICATIONS PARSED VIA APIFY ACTORS AND SQUAD FINDER LOBBIES
        </p>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT TWO COLUMNS: Event Bulletins List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-violet relative overflow-hidden">
            
            {/* Search & Filter widgets */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter events..."
                  className="w-full bg-[#07080a] border border-white/10 focus:border-violet-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none transition-all font-mono"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1">
                <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 transition-all ${
                      selectedTag === tag
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border border-transparent text-gray-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulletins cards stack */}
            {hackathonsLoading ? (
              <div className="text-center py-12 text-xs font-mono text-gray-500 uppercase animate-pulse">Running Apify Actor...</div>
            ) : filteredHackathons.length === 0 ? (
              <div className="text-center py-12 text-xs font-mono text-gray-500 uppercase">No upcoming hackathons match filters.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHackathons.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-violet-500/10 rounded-2xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-cyan-400 font-mono tracking-wider">{h.host}</span>
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-white transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 leading-snug">{h.title}</h4>
                      
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono mb-4">
                        <Calendar size={10} />
                        <span>{new Date(h.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} -- {new Date(h.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 border-t border-white/5 pt-4">
                      {h.tags?.map((tag, tIdx) => (
                        <span 
                          key={tIdx}
                          className="px-2 py-0.5 bg-white/[0.02] border border-white/5 rounded text-[9px] font-mono text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Squad Recruit finder */}
        <div>
          <div className="glassmorphism rounded-3xl p-6 border-white/10 box-glow-cyan flex flex-col h-full justify-between">
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={14} className="text-cyan-400" /> Squad Finder
                </h3>
                <button
                  onClick={() => setShowAddSquad(!showAddSquad)}
                  className="p-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-lg text-cyan-400 transition-all cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>

              {showAddSquad && (
                <form onSubmit={handlePostSquad} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <div>
                    <label className="block text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Squad Title</label>
                    <input
                      type="text"
                      required
                      value={newSquadTitle}
                      onChange={(e) => setNewSquadTitle(e.target.value)}
                      placeholder="e.g. AI Hackers"
                      className="w-full bg-[#07080a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Target Hackathon</label>
                    <select
                      value={newSquadEvent}
                      onChange={(e) => setNewSquadEvent(e.target.value)}
                      className="w-full bg-[#07080a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="">Select Event...</option>
                      {hackathons.map((h, idx) => (
                        <option key={idx} value={h.title}>{h.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Partner Roles Needed</label>
                    <input
                      type="text"
                      required
                      value={newSquadNeeds}
                      onChange={(e) => setNewSquadNeeds(e.target.value)}
                      placeholder="e.g. React Frontend"
                      className="w-full bg-[#07080a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Min Level Required</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newSquadMinLvl}
                      onChange={(e) => setNewSquadMinLvl(e.target.value)}
                      className="w-full bg-[#07080a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] font-mono rounded-lg transition-all"
                  >
                    Post Recruitment
                  </button>
                </form>
              )}

              {/* Active recruitment list */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {squads.map((sq) => (
                  <div key={sq.id} className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-white uppercase">{sq.title}</h4>
                      <span className="px-1.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded text-[9px] font-mono">REQ LVL {sq.minLvl}+</span>
                    </div>
                    <p className="text-[10px] text-cyan-300 font-mono">FOR: {sq.event}</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{sq.needs}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] font-mono text-gray-500">
                      <span>BY: {sq.postedBy}</span>
                      <a href={`mailto:${sq.contact}`} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                        <MessageCircle size={10} /> Message
                      </a>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            <p className="text-[9px] text-gray-500 text-center font-mono mt-6">COMMUNITY SYNC ENABLED</p>
          </div>
        </div>

      </div>
    </div>
  );
}
