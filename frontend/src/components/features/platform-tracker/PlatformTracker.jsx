import React, { useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { api } from '../../../lib/api';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, BarChart2, Plus, Check, Link, AlertTriangle } from 'lucide-react';

export default function PlatformTracker() {
  const { user, updateProfile } = useStore();
  const [leetcodeHandle, setLeetcodeHandle] = useState(user?.codingProfiles?.leetcode || '');
  const [codechefHandle, setCodechefHandle] = useState(user?.codingProfiles?.codechef || '');
  const [codeforcesHandle, setCodeforcesHandle] = useState(user?.codingProfiles?.codeforces || '');
  const [hackerrankHandle, setHackerrankHandle] = useState(user?.codingProfiles?.hackerrank || '');
  
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleSaveHandles = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSyncResult(null);

    try {
      // Update handles on backend
      const updatedUser = await updateProfile({
        codingProfiles: {
          leetcode: leetcodeHandle,
          codechef: codechefHandle,
          codeforces: codeforcesHandle,
          hackerrank: hackerrankHandle
        }
      });
      alert('Coding profiles saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update handles.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStats = async () => {
    setLoading(true);
    setSyncResult(null);

    try {
      const response = await api.get('/trackers/stats/mock');
      if (response.status === 'success') {
        setSyncResult(response.data);
        alert(`Synced stats! Gained XP: ${response.data.xpGained} XP (Level: ${response.data.currentLevel})`);
      }
    } catch (err) {
      alert(err.message || 'Failed to sync stats from platform APIs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header HUD */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
          CODING PROFILE TRACKER
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          SYNC SOLVE STATS FROM LEETCODE, CODECHEF, AND CODEFORCES TO EARN CHARACTER EXPERIENCE
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Handles Configuration */}
        <div className="lg:col-span-2">
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-violet relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Link size={18} className="text-violet-400" />
              Configure Handles
            </h3>

            <form onSubmit={handleSaveHandles} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Leetcode Username</label>
                  <input
                    type="text"
                    value={leetcodeHandle}
                    onChange={(e) => setLeetcodeHandle(e.target.value)}
                    placeholder="leetcode_username"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Codechef Handle</label>
                  <input
                    type="text"
                    value={codechefHandle}
                    onChange={(e) => setCodechefHandle(e.target.value)}
                    placeholder="codechef_handle"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Codeforces Handle</label>
                  <input
                    type="text"
                    value={codeforcesHandle}
                    onChange={(e) => setCodeforcesHandle(e.target.value)}
                    placeholder="codeforces_handle"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Hackerrank Username</label>
                  <input
                    type="text"
                    value={hackerrankHandle}
                    onChange={(e) => setHackerrankHandle(e.target.value)}
                    placeholder="hackerrank_username"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs font-mono rounded-xl cursor-pointer shadow-md active:scale-[0.98] transition-all"
                >
                  Save Profile Handles
                </button>
                
                <button
                  type="button"
                  onClick={handleSyncStats}
                  disabled={loading || (!leetcodeHandle && !codechefHandle && !codeforcesHandle)}
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/5 text-black disabled:text-gray-500 font-bold text-xs font-mono rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Stats & XP
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Sync results / widgets */}
        <div>
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-cyan relative overflow-hidden h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={18} className="text-cyan-400" />
                Solve Stats Summary
              </h3>

              {!syncResult ? (
                <div className="text-center py-12 text-xs font-mono text-gray-500 uppercase">
                  No sync logs computed yet. Save handles and trigger sync.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center space-y-1">
                    <h4 className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">Aggregate Solved Problems</h4>
                    <div className="text-4xl font-extrabold text-glow-cyan text-cyan-400 font-mono">
                      {syncResult.totalSolved}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(syncResult.stats || {}).map(([platform, stats]) => (
                      <div key={platform} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                        <span className="capitalize font-bold text-white">{platform}</span>
                        <div className="flex gap-4 font-mono text-[11px]">
                          <span className="text-gray-400">SOLVED: {stats.solved || 0}</span>
                          <span className="text-cyan-400">RATING: {stats.rating || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex gap-3 text-xs text-emerald-400 font-mono leading-relaxed">
                    <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                    <span>User XP verified and synced. Level is updated.</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[9px] text-gray-500 text-center font-mono mt-6">ALIGNED WITH SYNCED PROFILE METRICS</p>
          </div>
        </div>

      </div>
    </div>
  );
}
