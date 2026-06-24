import React, { useEffect, useState } from 'react';
import GithubCalendar from './GithubCalendar';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import { api } from '../../../lib/api';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Flame,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const {
    user,
    quests,
    questsLoading,
    fetchQuests,
    claimQuest,
    timeLeft,
    timerStatus,
    timerType,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerType,
    isMuted,
    toggleMute
  } = useStore();

  const [claimStatus, setClaimStatus] = useState({});
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    setAddingTask(true);
    try {
      const res = await api.post('/quests', { taskDescription: newTaskDesc });
      if (res.status === 'success') {
        setNewTaskDesc('');
        alert(`Target Created! AI analyzed task as ${res.data.xpReward} XP (${res.data.xpReward === 200 ? 'Hard' : res.data.xpReward === 100 ? 'Medium' : 'Easy'}).`);
        fetchQuests(); // reload
      } else {
        alert(res.message || 'Failed to create target.');
      }
    } catch (err) {
      alert(err.message || 'Failed to create target.');
    } finally {
      setAddingTask(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleClaim = async (questKey) => {
    try {
      setClaimStatus(prev => ({ ...prev, [questKey]: 'claiming' }));
      const msg = await claimQuest(questKey);
      setClaimStatus(prev => ({ ...prev, [questKey]: 'claimed' }));
      alert(msg || 'Reward Claimed successfully!');
      fetchQuests(); // reload
    } catch (err) {
      setClaimStatus(prev => ({ ...prev, [questKey]: 'failed' }));
      alert(err.message || 'Verification conditions not met yet.');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Skill DNA radar chart mock adaptive data
  const skillData = [
    { subject: 'Algorithms', A: user ? Math.min(100, 45 + (user.level * 8)) : 50, fullMark: 100 },
    { subject: 'Frontend', A: user?.targetRole?.includes('Frontend') || user?.targetRole?.includes('Fullstack') ? 90 : 40, fullMark: 100 },
    { subject: 'Backend', A: user?.targetRole?.includes('Backend') || user?.targetRole?.includes('Fullstack') ? 92 : 45, fullMark: 100 },
    { subject: 'DevOps', A: user?.targetRole?.includes('DevOps') ? 88 : 35, fullMark: 100 },
    { subject: 'System Design', A: user ? Math.min(100, 30 + (user.level * 10)) : 40, fullMark: 100 },
    { subject: 'Behavioral', A: 75, fullMark: 100 },
  ];


  return (
    <div className="relative space-y-8 z-10">
      
      {/* HUD Page Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
            OPERATIONAL HUD
          </h2>
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
            WELCOME BACK, USER. SYSTEM INTEGRATION ACTIVE.
          </p>
        </div>
        
        {user && (
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-950/20 border border-cyan-500/25 rounded-2xl">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="font-mono text-sm font-bold text-white uppercase tracking-wider">{user.streak} Day Consistency Streak</span>
          </div>
        )}
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Pomodoro & Focus Station */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="glassmorphism rounded-3xl p-8 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full filter blur-[40px] pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">DEEP FOCUS SANDBOX</h3>
                <p className="text-[11px] text-gray-500 font-mono">COMPLETE POMODOROS TO EARN XP & SOLVE DAILY QUESTS</p>
              </div>
              <button 
                onClick={toggleMute}
                className="p-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl text-gray-400 transition-all"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

            {/* Main Circle Timer HUD */}
            <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
              
              <div className="relative w-56 h-56 flex items-center justify-center">
                {/* SVG Progress Circle Background */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="112" cy="112" r="96" stroke="rgba(255,255,255,0.02)" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="112" 
                    cy="112" 
                    r="96" 
                    stroke="#00ffff" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={603.1} 
                    strokeDashoffset={603.1 - (603.1 * timeLeft) / (timerType === 'focus' ? 50 * 60 : timerType === 'shortBreak' ? 10 * 60 : 15 * 60)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                
                <div className="absolute text-center flex flex-col items-center">
                  <span className="text-5xl font-extrabold font-mono text-white tracking-wider">{formatTime(timeLeft)}</span>
                  <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mt-1.5">{timerType}</span>
                </div>
              </div>

              {/* Action Controls & Presets */}
              <div className="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTimerType('focus')}
                    className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all border ${
                      timerType === 'focus' ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/20' : 'bg-white/[0.01] hover:bg-white/[0.04] border-transparent text-gray-500'
                    }`}
                  >
                    Focus (50m)
                  </button>
                  <button 
                    onClick={() => setTimerType('shortBreak')}
                    className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all border ${
                      timerType === 'shortBreak' ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/20' : 'bg-white/[0.01] hover:bg-white/[0.04] border-transparent text-gray-500'
                    }`}
                  >
                    Short (10m)
                  </button>
                </div>

                <div className="flex justify-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                  {timerStatus === 'running' ? (
                    <button 
                      onClick={pauseTimer}
                      className="p-3 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/10 rounded-xl transition-all"
                    >
                      <Pause size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={startTimer}
                      className="p-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl shadow-lg transition-all"
                    >
                      <Play size={18} />
                    </button>
                  )}
                  <button 
                    onClick={resetTimer}
                    className="p-3 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/5 rounded-xl transition-all"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
                
                <p className="text-[10px] text-gray-500 text-center font-mono">TIMER AUTOSAVES COMPLETE BLOCKS</p>
              </div>

            </div>
          </div>

          {/* Daily Quests checklists */}
          <div className="glassmorphism rounded-3xl p-8 border-white/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">DAILY QUESTS CHECKLIST</h3>
                <p className="text-[11px] text-gray-500 font-mono">COMPLETED TASKS TRIGGER EXPERIENCE MULTIPLIERS</p>
              </div>
              
              {/* Task Creation Form */}
              <form onSubmit={handleAddTask} className="flex gap-2 w-full md:w-auto max-w-md">
                <input 
                  type="text" 
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Set custom daily target (e.g. Learn Docker)..."
                  className="flex-1 min-w-[200px] bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
                  disabled={addingTask}
                />
                <button
                  type="submit"
                  disabled={addingTask || !newTaskDesc.trim()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {addingTask ? 'Analyzing...' : 'Add Target'}
                </button>
              </form>
            </div>

            {questsLoading ? (
              <div className="text-center py-6 text-xs font-mono text-gray-500 uppercase animate-pulse">Syncing quest matrices...</div>
            ) : (
              <div className="space-y-4">
                {quests.map((quest) => {
                  const status = claimStatus[quest.key];
                  return (
                    <div 
                      key={quest._id} 
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-all gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={status === 'claimed'}
                          onChange={() => {
                            if (status !== 'claimed' && status !== 'claiming') {
                              handleClaim(quest.key);
                            }
                          }}
                          disabled={status === 'claiming' || status === 'claimed'}
                          className="w-4.5 h-4.5 rounded border border-white/20 text-cyan-500 focus:ring-cyan-500/20 bg-white/[0.02] cursor-pointer disabled:cursor-not-allowed shrink-0 transition-all accent-cyan-500"
                        />
                        
                        <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 shrink-0">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{quest.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{quest.description}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded text-[9px] font-mono text-cyan-400 uppercase tracking-widest">{quest.type}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className="font-mono text-xs font-bold text-emerald-400">+{quest.xpReward} XP</span>
                        
                        <button
                          onClick={() => handleClaim(quest.key)}
                          disabled={status === 'claiming' || status === 'claimed'}
                          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer ${
                            status === 'claimed'
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'
                              : status === 'claiming'
                              ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-md'
                          }`}
                        >
                          {status === 'claimed' ? <CheckCircle2 size={12} /> : null}
                          {status === 'claimed' ? 'Claimed' : status === 'claiming' ? 'Claiming...' : 'Claim Reward'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Skill DNA & Streaks Heatmap */}
        <div className="space-y-8">
          
          {/* Skill DNA Radar Chart */}
          <div className="glassmorphism rounded-3xl p-8 border-white/10 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-1.5 tracking-wide">CHARACTER SKILL DNA</h3>
            <p className="text-[11px] text-gray-500 font-mono mb-6">COMPREHENSIVE RADAR GRID OF TARGET PROFICIENCIES</p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={skillData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={10} fontFamily="JetBrains Mono" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" fontSize={8} />
                  <Radar
                    name="Skill"
                    dataKey="A"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Grid Heatmap */}
          <GithubCalendar username={user?.username || 'User'} />

        </div>

      </div>
    </div>
  );
}
