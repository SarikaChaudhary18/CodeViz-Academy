import React, { useEffect, useState } from 'react';
import { Search, Users, MessageSquare, Compass, CheckCircle2, UserCheck, Flame, UserPlus, XCircle, CheckCircle, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../hooks/useStore';

export default function BuddyFinder() {
  const {
    peers,
    peersLoading,
    fetchPeers,
    sendConnection,
    acceptConnection,
    rejectConnection
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  const handleConnect = async (peerId) => {
    try {
      await sendConnection(peerId);
      setSuccessMsg('Connection invite sent successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (senderId) => {
    try {
      await acceptConnection(senderId);
      setSuccessMsg('Accepted connection invite!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (senderId) => {
    try {
      await rejectConnection(senderId);
      setSuccessMsg('Invite declined.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Separate incoming pending invitations
  const incomingRequests = peers.filter(p => p.connectionStatus === 'request_received');
  // Peers to search/filter (excluding already received requests to show them in invitation panel)
  const peerList = peers.filter(p => p.connectionStatus !== 'request_received');

  const filteredBuddies = peerList.filter(buddy => 
    buddy.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    buddy.targetCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buddy.targetRole.toLowerCase().includes(searchTerm.toLowerCase())
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

      {successMsg && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-xs font-mono">
          {successMsg}
        </div>
      )}

      {/* Incoming Requests Panel */}
      {incomingRequests.length > 0 && (
        <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-200/60 text-left">
          <h2 className="text-sm font-extrabold text-orange-950 font-mono tracking-wider mb-4 flex items-center gap-2">
            <Flame className="text-orange-600 w-4 h-4 animate-bounce" /> INCOMING STUDY REQUESTS ({incomingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingRequests.map(req => (
              <div key={req.id} className="bg-white border border-orange-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="text-xs font-bold text-zinc-950">{req.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Targeting {req.targetCompany} ({req.targetRole})</p>
                  {req.bio && <p className="text-[10px] text-zinc-600 mt-1 italic">"{req.bio}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Accept Invitation"
                  >
                    <CheckCircle size={12} /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Decline Invitation"
                  >
                    <XCircle size={12} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 relative flex items-center">
        <Search className="absolute left-7 text-zinc-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by name, target role, or company (e.g. Google)..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900"
        />
      </div>

      {/* Loading state */}
      {peersLoading ? (
        <div className="py-12 flex justify-center items-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
          Loading peer profiles...
        </div>
      ) : filteredBuddies.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-xs font-mono uppercase tracking-widest bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
          No matching study buddies found.
        </div>
      ) : (
        /* Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuddies.map((buddy) => (
            <div 
              key={buddy.id}
              className="bg-white border border-zinc-200 hover:border-orange-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all text-left"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-orange-100/60 text-orange-700">
                      {buddy.matchScore}% Match
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold font-mono rounded-full">
                    <Flame size={12} className="animate-pulse" /> {buddy.streak} Days
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-950 tracking-tight">{buddy.name}</h3>
                    <div className="text-[11px] text-zinc-600 font-mono mt-0.5">
                      Targeting: <span className="font-bold text-zinc-800">{buddy.targetCompany}</span>
                    </div>
                  </div>
                  {buddy.github && (
                    <a
                      href={buddy.github.startsWith('http') ? buddy.github : `https://github.com/${buddy.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-orange-600 transition-colors"
                      title="GitHub Profile"
                    >
                      <Github size={18} />
                    </a>
                  )}
                </div>

                <div className="text-[10px] text-zinc-500 font-mono mt-1">
                  Level {buddy.level || 1} • {buddy.xp || 0} XP
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed mt-3 border-t border-zinc-100 pt-3">
                  {buddy.bio || `Prepping for ${buddy.targetRole} role profiles. Let's practice coding algorithms together!`}
                </p>
              </div>

              {buddy.connectionStatus === 'connected' ? (
                <div className="w-full mt-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-green-50 text-green-700 border border-green-200 flex items-center justify-center gap-1.5">
                  <CheckCircle size={14} /> Connected Buddy
                </div>
              ) : buddy.connectionStatus === 'request_sent' ? (
                <div className="w-full mt-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-zinc-100 text-zinc-500 border border-zinc-200 flex items-center justify-center gap-1.5">
                  <UserCheck size={14} /> Invite Sent
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(buddy.id)}
                  className="w-full mt-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare size={14} /> Connect Partner
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
