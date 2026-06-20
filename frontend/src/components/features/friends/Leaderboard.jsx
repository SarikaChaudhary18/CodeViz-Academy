import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal, Flame, RefreshCw, Twitter, Github, Linkedin, ArrowUpRight } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useStore();
  const [boardData, setBoardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/leaderboard?limit=10&page=1');
      if (response.status === 'success') {
        setBoardData(response.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header HUD */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
            GLOBAL SCOREBOARDS
          </h2>
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
            REALTIME EXPERIENCE RANKINGS AND CONSISTENCY LEADERBOARDS
          </p>
        </div>
        
        <button
          onClick={fetchBoard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-xl text-xs font-mono text-gray-400 transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh Sync
        </button>
      </div>

      {/* Leaderboard Table Container */}
      <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-violet relative overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
          <Trophy size={18} className="text-amber-500 animate-pulse" />
          TOP SCORES MATRIX
        </h3>

        {loading ? (
          <div className="text-center py-16 text-xs font-mono text-gray-500 uppercase animate-pulse flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin" />
            Recalculating rank models...
          </div>
        ) : boardData.length === 0 ? (
          <div className="text-center py-16 text-xs font-mono text-gray-500 uppercase">
            Scoreboard is empty. Be the first to register and top the rank!
          </div>
        ) : (
          <div className="space-y-10">
            {/* Top 3 Podium Section */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end pt-4 pb-6 border-b border-white/5">
              {/* Rank 2 (Left) */}
              {boardData[1] && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  onClick={() => setSelectedPlayer(boardData[1])}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-full border-2 border-slate-300 bg-slate-900/50 flex items-center justify-center overflow-hidden">
                      <Medal className="w-8 h-8 text-slate-300" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-400 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-950 font-mono">2</span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-full group-hover:text-cyan-400 transition-colors">{boardData[1].username}</span>
                  <span className="text-[10px] text-gray-500 font-mono">Lvl {boardData[1].level}</span>
                  <div className="w-full mt-3 bg-gradient-to-t from-slate-400/5 to-slate-400/15 border border-white/5 rounded-t-xl py-4 flex flex-col items-center h-24 justify-end">
                    <span className="text-[10px] text-slate-300 font-bold tracking-wider uppercase font-mono">SILVER</span>
                    <span className="text-xs text-slate-300 font-mono font-bold mt-1">{boardData[1].xp.toLocaleString()} XP</span>
                  </div>
                </motion.div>
              )}

              {/* Rank 1 (Center - Elevated) */}
              {boardData[0] && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => setSelectedPlayer(boardData[0])}
                  className="flex flex-col items-center cursor-pointer group -translate-y-4"
                >
                  <div className="relative mb-2">
                    <div className="w-20 h-20 rounded-full border-2 border-amber-400 bg-amber-950/20 flex items-center justify-center overflow-hidden">
                      <Trophy className="w-10 h-10 text-amber-400 animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 border border-amber-400 flex items-center justify-center text-sm font-bold text-amber-950 font-mono">1</span>
                  </div>
                  <span className="text-sm font-black text-white truncate max-w-full group-hover:text-cyan-400 transition-colors">{boardData[0].username}</span>
                  <span className="text-xs text-gray-500 font-mono">Lvl {boardData[0].level}</span>
                  <div className="w-full mt-3 bg-gradient-to-t from-amber-500/10 to-amber-500/20 border border-amber-500/20 rounded-t-2xl py-6 flex flex-col items-center h-32 justify-end">
                    <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase font-mono text-glow-cyan">CHAMPION</span>
                    <span className="text-sm text-cyan-400 font-mono font-bold mt-1 text-glow-cyan">{boardData[0].xp.toLocaleString()} XP</span>
                  </div>
                </motion.div>
              )}

              {/* Rank 3 (Right) */}
              {boardData[2] && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  onClick={() => setSelectedPlayer(boardData[2])}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-700 bg-amber-950/10 flex items-center justify-center overflow-hidden">
                      <Award className="w-8 h-8 text-amber-700" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 border border-amber-600 flex items-center justify-center text-xs font-bold text-amber-950 font-mono">3</span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-full group-hover:text-cyan-400 transition-colors">{boardData[2].username}</span>
                  <span className="text-[10px] text-gray-500 font-mono">Lvl {boardData[2].level}</span>
                  <div className="w-full mt-3 bg-gradient-to-t from-amber-700/5 to-amber-700/15 border border-white/5 rounded-t-xl py-3 flex flex-col items-center h-20 justify-end">
                    <span className="text-[10px] text-amber-600 font-bold tracking-wider uppercase font-mono">BRONZE</span>
                    <span className="text-xs text-amber-600 font-mono font-bold mt-1">{boardData[2].xp.toLocaleString()} XP</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Remaining Rankings Table */}
            {boardData.length > 3 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Discipline</th>
                      <th className="py-3 px-4 text-center">Streak</th>
                      <th className="py-3 px-4 text-right">Aggregate XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {boardData.slice(3).map((player, index) => {
                      const rank = index + 4;
                      const isCurrentUser = player.username === user?.username;
                      
                      let rankIndicator = <span className="font-mono text-gray-400">{rank}</span>;

                      return (
                        <motion.tr
                          key={player._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          onClick={() => setSelectedPlayer(player)}
                          className={`text-xs hover:bg-white/[0.03] transition-colors cursor-pointer ${
                            isCurrentUser ? 'bg-violet-600/5 font-semibold text-white' : 'text-gray-300'
                          }`}
                        >
                          <td className="py-4.5 px-4 flex items-center h-12">{rankIndicator}</td>
                          <td className="py-4.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={isCurrentUser ? 'text-cyan-400 font-bold' : ''}>
                                {player.username}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[8px] font-mono px-1 bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 rounded uppercase tracking-wider">YOU</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4.5 px-4 font-mono font-bold text-violet-400">{player.level}</td>
                          <td className="py-4.5 px-4 font-sans text-gray-400">{player.targetRole || 'Software Engineer'}</td>
                          <td className="py-4.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1 font-mono">
                              <Flame className={`w-3.5 h-3.5 ${player.streak > 0 ? 'text-amber-500' : 'text-gray-600'}`} />
                              <span>{player.streak}d</span>
                            </div>
                          </td>
                          <td className="py-4.5 px-4 text-right font-mono font-bold text-glow-cyan text-cyan-400">
                            {player.xp.toLocaleString()} XP
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Profile Modal Overlay */}
      {selectedPlayer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setSelectedPlayer(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <GlassmorphismProfileCard
              avatarUrl={selectedPlayer.avatarUrl}
              name={selectedPlayer.username}
              title={selectedPlayer.targetRole || 'Software Engineer'}
              bio={selectedPlayer.bio || `Operator rank level ${selectedPlayer.level}. Actively training and routing career progression paths towards ${selectedPlayer.targetCompany || 'Google'}.`}
              socialLinks={[
                { id: 'github', icon: Github, label: 'GitHub', href: '#' },
                { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: '#' },
                { id: 'twitter', icon: Twitter, label: 'Twitter', href: '#' },
              ]}
              actionButton={{
                text: 'Close Profile',
                onClick: () => setSelectedPlayer(null)
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}

// ================================================================================
// GLASSMORPHISM PROFILE CARD COMPONENTS
// ================================================================================

const GlassmorphismProfileCard = ({
  avatarUrl,
  name,
  title,
  bio,
  socialLinks = [],
  actionButton,
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div className="relative w-full max-w-sm">
      <div 
        className="relative flex flex-col items-center p-8 rounded-3xl border transition-all duration-500 ease-out backdrop-blur-xl bg-white/[0.03] border-white/10"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div className="w-24 h-24 mb-4 rounded-full p-1 border-2 border-white/20">
          <img 
            src={avatarUrl} 
            alt={`${name}'s Avatar`}
            className="w-full h-full rounded-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/96x96/8b5cf6/white?text=${name.charAt(0)}`; }}
          />
        </div>

        <h2 className="text-2xl font-bold text-white">{name}</h2>
        <p className="mt-1 text-sm font-semibold text-cyan-400 font-mono tracking-wider">{title}</p>
        <p className="mt-4 text-center text-sm leading-relaxed text-zinc-400">{bio}</p>

        <div className="w-1/2 h-px my-6 rounded-full bg-white/10" />

        <div className="flex items-center justify-center gap-3">
          {socialLinks.map((item) => (
            <SocialButton key={item.id} item={item} setHoveredItem={setHoveredItem} hoveredItem={hoveredItem} />
          ))}
        </div>

        <ActionButton action={actionButton} />
      </div>
      
      <div className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 ease-out blur-2xl opacity-20 bg-gradient-to-r from-violet-500/30 to-cyan-500/30" />
    </div>
  );
};

const SocialButton = ({ item, setHoveredItem, hoveredItem }) => (
  <div className="relative">
    <a
      href={item.href}
      onClick={(e) => e.preventDefault()}
      className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out group overflow-hidden bg-white/5 hover:bg-white/10 border border-white/5"
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      aria-label={item.label}
    >
      <div className="relative z-10 flex items-center justify-center">
        <item.icon size={20} className="transition-all duration-200 ease-out text-zinc-400 group-hover:text-white" />
      </div>
    </a>
    <Tooltip item={item} hoveredItem={hoveredItem} />
  </div>
);

const ActionButton = ({ action }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      if (action.onClick) action.onClick();
    }}
    className="flex items-center gap-2 px-6 py-3 mt-8 rounded-full font-semibold text-sm backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95 group bg-white text-black hover:bg-zinc-200 cursor-pointer border border-white/20 animate-pulse-glow"
    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
  >
    <span>{action.text}</span>
    <ArrowUpRight size={16} className="transition-transform duration-300 ease-out group-hover:rotate-45 text-black" />
  </button>
);

const Tooltip = ({ item, hoveredItem }) => (
  <div 
    role="tooltip"
    className={`absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out pointer-events-none bg-black text-white border-white/10 ${hoveredItem === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
  >
    {item.label}
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-black border-b border-r border-white/10" />
  </div>
);
