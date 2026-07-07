import React, { useEffect, useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Calendar, 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MessageCircle,
  Award,
  Clock,
  Shield,
  Check,
  X
} from 'lucide-react';
import { cn } from "../../../lib/utils";

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

  // Helper to determine status badge
  const getEventStatus = (endDate) => {
    const today = new Date();
    const eventEnd = new Date(endDate);
    const diffTime = eventEnd - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Closed', class: 'bg-red-50 text-red-600 border-red-200' };
    if (diffDays <= 7) return { label: 'Ending Soon', class: 'bg-amber-50 text-amber-600 border-amber-200' };
    return { label: 'Open', class: 'bg-green-50 text-green-600 border-green-200' };
  };

  return (
    <div className="space-y-8">
      
      {/* Header HUD - Modern SaaS Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 font-mono uppercase">
            Hackathon Bulletins
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Aggregated live competition events from Devfolio, Devpost, Unstop, and Internshala
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="flex gap-4">
          <div className="bg-orange-50/50 border border-orange-100 px-4 py-2 rounded-xl text-center min-w-[90px]">
            <span className="block text-[9px] text-zinc-400 font-mono uppercase">Total Events</span>
            <span className="text-sm font-bold text-zinc-900">{hackathons.length}</span>
          </div>
          <div className="bg-orange-50/50 border border-orange-100 px-4 py-2 rounded-xl text-center min-w-[90px]">
            <span className="block text-[9px] text-zinc-400 font-mono uppercase">Matching</span>
            <span className="text-sm font-bold text-orange-600">{filteredHackathons.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT BULLETINS COLUMN (8/12 width) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filters Dashboard Panel */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
            
            {/* Search Input Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, organizers or target tech..."
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl pl-11 pr-4 py-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all"
                />
              </div>

              {/* Tag filtering header label */}
              <div className="flex items-center gap-1.5 self-start md:self-auto text-zinc-400 text-[10px] font-mono uppercase">
                <Filter size={11} />
                <span>Categories</span>
              </div>
            </div>

            {/* Scrollable Filter Chips strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-zinc-300">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer border",
                    selectedTag === tag
                      ? "bg-orange-50 text-orange-600 border-orange-300"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>

          {/* Grid Content List */}
          {hackathonsLoading ? (
            /* Loading Skeleton Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-zinc-200 bg-white p-5 rounded-2xl space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-2.5 w-20 bg-zinc-200 rounded" />
                    <div className="h-4 w-16 bg-zinc-200 rounded" />
                  </div>
                  <div className="h-4 w-40 bg-zinc-200 rounded" />
                  <div className="h-3 w-32 bg-zinc-200 rounded" />
                  <div className="pt-4 border-t border-zinc-100 flex gap-2">
                    <div className="h-4 w-12 bg-zinc-200 rounded" />
                    <div className="h-4 w-12 bg-zinc-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHackathons.length === 0 ? (
            /* Empty State Illustration */
            <div className="border border-zinc-200 bg-white p-12 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto text-zinc-400">
                <Search size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-700">No Hackathons Found</h4>
                <p className="text-[11px] text-zinc-400">Try adjusting your filters or query string searches.</p>
              </div>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedTag('All'); }} 
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] rounded-lg border border-zinc-800 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Event bulletins lists */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHackathons.map((h, i) => {
                const status = getEventStatus(h.endDate);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-orange-300 p-5 rounded-2xl transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100 relative"
                  >
                    <div>
                      {/* Host & status labels row */}
                      <div className="flex justify-between items-start gap-2 mb-3 w-full min-w-0">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest truncate min-w-0 flex-1">{h.host}</span>
                        <div className="flex items-center gap-1.5 shrink-0 min-w-0 max-w-[65%] flex-wrap justify-end">
                          {h.prizePool && (
                            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[9px] font-mono font-bold text-amber-600 flex items-center gap-1 max-w-full break-words whitespace-normal text-right">
                              🏆 {h.prizePool}
                            </span>
                          )}
                          <span className={cn("px-2 py-0.5 rounded border text-[9px] font-mono font-bold shrink-0", status.class)}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Event Title */}
                      <h4 className="text-sm font-bold text-zinc-900 mb-2 leading-snug tracking-tight group-hover:text-orange-600 transition-colors">
                        {h.title}
                      </h4>
                      
                      {/* Event Duration Dates */}
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono mb-4">
                        <Calendar size={11} className="text-zinc-400" />
                        <span>
                          {new Date(h.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          {' -- '}
                          {new Date(h.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: tag chips & registration link */}
                    <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4 mt-2">
                      <div className="flex flex-wrap gap-1 min-w-0 flex-1">
                        {h.tags?.slice(0, 3).map((tag, tIdx) => (
                          <span 
                            key={tIdx}
                            className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-[8px] font-mono text-zinc-500 tracking-wider uppercase max-w-full break-words whitespace-normal inline-block"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <a
                        href={h.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 border border-orange-500 hover:border-orange-400 text-white rounded-lg text-[10px] font-bold font-mono transition-all group/btn"
                      >
                        Register
                        <ExternalLink size={10} className="transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>

        {/* RIGHT SQUAD FINDER COLUMN (4/12 width) */}
        <div className="lg:col-span-4">
          
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-sm">
            
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
              <h3 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                <Users size={13} className="text-orange-500 animate-pulse" /> Squad Finder
              </h3>
              <button
                onClick={() => setShowAddSquad(!showAddSquad)}
                className={cn(
                  "p-1.5 border rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold font-mono",
                  showAddSquad 
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-zinc-50 border-zinc-200 text-orange-600 hover:bg-zinc-100 hover:border-zinc-300"
                )}
              >
                {showAddSquad ? <X size={11} /> : <Plus size={11} />}
                <span>{showAddSquad ? 'Cancel' : 'Recruit'}</span>
              </button>
            </div>

            {/* Slide Down Add form */}
            <AnimatePresence>
              {showAddSquad && (
                <motion.form 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handlePostSquad} 
                  className="overflow-hidden border-b border-zinc-200 pb-6 space-y-4"
                >
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3.5">
                    <div>
                      <label className="block text-[9px] text-zinc-400 font-mono uppercase tracking-widest mb-1 font-bold">Squad Title</label>
                      <input
                        type="text"
                        required
                        value={newSquadTitle}
                        onChange={(e) => setNewSquadTitle(e.target.value)}
                        placeholder="e.g. Frontend Speedsters"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-zinc-400 font-mono uppercase tracking-widest mb-1 font-bold">Target Hackathon</label>
                      <select
                        value={newSquadEvent}
                        onChange={(e) => setNewSquadEvent(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 font-sans"
                        required
                      >
                        <option value="">Select Event Target...</option>
                        {hackathons.map((h, idx) => (
                          <option key={idx} value={h.title}>{h.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-zinc-400 font-mono uppercase tracking-widest mb-1 font-bold">Needs / Roles</label>
                      <input
                        type="text"
                        required
                        value={newSquadNeeds}
                        onChange={(e) => setNewSquadNeeds(e.target.value)}
                        placeholder="e.g. React & CSS developer"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-zinc-400 font-mono uppercase tracking-widest mb-1 font-bold">Min Rank Level (1-10)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newSquadMinLvl}
                        onChange={(e) => setNewSquadMinLvl(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] font-mono rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      Post Recruitment Node
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Active recruitment list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {squads.length === 0 ? (
                <div className="text-center py-6 text-[10px] font-mono text-slate-500 uppercase">No active squad recruitments.</div>
              ) : (
                squads.map((sq) => (
                  <div key={sq.id} className="p-4 bg-zinc-50 border border-zinc-200 hover:border-orange-300 rounded-xl space-y-2.5 transition-all">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-zinc-800 truncate">{sq.title}</h4>
                      <span className="px-2 py-0.5 bg-orange-50 border border-orange-200 text-orange-600 rounded text-[8px] font-mono font-bold shrink-0">
                        LVL {sq.minLvl}+
                      </span>
                    </div>

                    {/* Meta target */}
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono bg-white border border-zinc-200 px-2 py-1 rounded">
                      <Shield size={9} className="text-orange-500 shrink-0" />
                      <span className="truncate">{sq.event}</span>
                    </div>

                    {/* Needs */}
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">{sq.needs}</p>
                    
                    {/* Footer / Message details */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-zinc-200 text-[9px] font-mono text-zinc-400">
                      <span className="truncate">By: {sq.postedBy}</span>
                      <a 
                        href={`mailto:${sq.contact}`} 
                        className="text-orange-600 hover:text-orange-500 flex items-center gap-1 transition-colors"
                      >
                        <MessageCircle size={10} /> 
                        <span>Apply</span>
                      </a>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Footer status label */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-center gap-1.5 text-[8px] font-mono text-zinc-400 uppercase tracking-widest cursor-default">
              <Check size={9} className="text-orange-500" />
              <span>Multiplayer Workspace Connected</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
