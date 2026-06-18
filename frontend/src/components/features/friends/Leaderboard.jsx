import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal, Flame, RefreshCw } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useStore();
  const [boardData, setBoardData] = useState([]);
  const [loading, setLoading] = useState(true);

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
                {boardData.map((player, index) => {
                  const rank = index + 1;
                  const isCurrentUser = player.username === user?.username;
                  
                  // Rank styling indicators
                  let rankIndicator = <span className="font-mono text-gray-400">{rank}</span>;
                  if (rank === 1) rankIndicator = <Trophy className="w-5 h-5 text-amber-500 text-glow-cyan" />;
                  if (rank === 2) rankIndicator = <Medal className="w-5 h-5 text-slate-300" />;
                  if (rank === 3) rankIndicator = <Award className="w-5 h-5 text-amber-700" />;

                  return (
                    <motion.tr
                      key={player._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`text-xs hover:bg-white/[0.01] transition-colors ${
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

    </div>
  );
}
