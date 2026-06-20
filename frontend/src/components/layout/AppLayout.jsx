import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Map,
  FileText,
  MessageSquare,
  Flame,
  Trophy,
  Compass,
  Code,
  LogOut,
  User as UserIcon,
  Clock,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Menu,
  X,
  Award,
  Terminal,
  Users
} from 'lucide-react';

export default function AppLayout({ children }) {
  const {
    user,
    logout,
    timeLeft,
    timerStatus,
    timerType,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerType,
    activeAudio,
    setActiveAudio,
    tick
  } = useStore();

  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTimerDetails, setShowTimerDetails] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [audioElement, setAudioElement] = useState(null);

  // Focus Audio streams
  const audioTracks = {
    lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Synth placeholder
    synthwave: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    ambient: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    nature: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  };

  // Tick timer every second if running
  useEffect(() => {
    let interval = null;
    if (timerStatus === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStatus, tick]);

  // Audio playback controls
  useEffect(() => {
    if (activeAudio && isAudioPlaying) {
      if (audioElement) {
        audioElement.pause();
      }
      const newAudio = new Audio(audioTracks[activeAudio]);
      newAudio.loop = true;
      newAudio.volume = audioVolume;
      newAudio.play().catch(e => console.log('Audio autoplay blocked'));
      setAudioElement(newAudio);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
    }
  }, [activeAudio, isAudioPlaying]);

  useEffect(() => {
    if (audioElement) {
      audioElement.volume = audioVolume;
    }
  }, [audioVolume, audioElement]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Company Prep', path: '/company-prep', icon: Briefcase },
    { name: 'Roadmaps', path: '/roadmaps', icon: Map },
    { name: 'Resume Auditor', path: '/resume-auditor', icon: FileText },
    { name: 'Mock Interview', path: '/mock-interview', icon: Terminal },
    { name: 'Communities', path: '/communities', icon: MessageSquare },
    { name: 'Hackathons', path: '/hackathons', icon: Compass },
    { name: 'DSA Sheets', path: '/dsa-sheets', icon: Code },
    { name: 'Profile Tracker', path: '/trackers', icon: Award },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy }
  ];

  // XP calculations for level bar
  const xpInCurrentLevel = user?.xp ? user.xp % 1000 : 0;
  const xpProgressPercent = (xpInCurrentLevel / 1000) * 100;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-gray-100 font-sans selection:bg-violet-600/30 relative overflow-hidden">
      {/* Dark Radial Glow Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 200px, #3e3e3e, transparent)`,
        }}
      />
      
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-violet-600 hover:bg-violet-500 rounded-full shadow-lg box-glow-violet transition-all duration-300"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <aside 
        className={`w-72 bg-[#020617] border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-lg shadow-md tracking-wider text-glow-violet select-none">
            SQ
          </div>
          <div>
            <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-wide font-sans text-lg">
              STUDYQUEST OS
            </h1>
            <span className="text-[10px] text-cyan-400 tracking-widest font-mono">CAREER STACK</span>
          </div>
        </div>

        {/* User XP & Level HUD */}
        {user && (
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative flex items-center justify-center">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
                  <circle 
                    cx="28" 
                    cy="28" 
                    r="24" 
                    stroke="url(#grad)" 
                    strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray={150.7} 
                    strokeDashoffset={150.7 - (150.7 * xpProgressPercent) / 100}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute font-mono font-bold text-base text-cyan-400 text-glow-cyan">{user.level}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold truncate text-white">{user.username}</p>
                  <span className="text-[10px] text-gray-500 font-mono">{user.xp % 1000}/1000 XP</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${xpProgressPercent}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Streak and Profile Summary */}
            <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl p-3 mt-4">
              <div className="flex items-center gap-1.5">
                <Flame className={`w-5 h-5 ${user.streak > 0 ? 'text-amber-500 animate-pulse' : 'text-gray-500'}`} />
                <span className="font-mono text-sm font-bold text-glow-cyan text-white">{user.streak} DAY STREAK</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] text-cyan-300 uppercase font-mono tracking-wider">{user.targetCompany}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/5 text-white border-l-2 border-violet-500 shadow-sm shadow-violet-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-violet-400' : 'text-gray-400 group-hover:text-violet-400'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Panel */}
        <header className="h-20 bg-gradient-to-r from-[#0c0e14]/50 to-[#07080c]/50 border-b border-white/5 flex items-center justify-between px-8 z-30 sticky top-0 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-cyan-400 tracking-wider">STATUS: ONLINE</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Quick HUD Elements (Pomodoro Quick Status & Focus Audio Widget) */}
          <div className="flex items-center gap-6">
            
            {/* Quick Pomodoro Widget */}
            <div className="relative">
              <button 
                onClick={() => setShowTimerDetails(!showTimerDetails)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-xs font-semibold"
              >
                <Clock className={`w-4 h-4 text-violet-400 ${timerStatus === 'running' ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
                <span className="font-mono text-glow-cyan text-white">{formatTime(timeLeft)}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${timerStatus === 'running' ? 'bg-rose-500' : 'bg-gray-500'}`} />
              </button>

              {/* Float Timer Panel Details */}
              <AnimatePresence>
                {showTimerDetails && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-72 glassmorphism rounded-2xl p-5 shadow-2xl z-50 border border-white/10"
                  >
                    <h3 className="text-sm font-bold text-white mb-1.5 flex items-center justify-between">
                      <span>POMODORO STATION</span>
                      <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">{timerType}</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mb-4">Focus session completes quest and logs XP.</p>
                    
                    <div className="text-center py-4 bg-white/[0.02] border border-white/5 rounded-xl mb-4">
                      <span className="text-4xl font-extrabold font-mono text-white text-glow-cyan tracking-wider">{formatTime(timeLeft)}</span>
                    </div>

                    {/* Timer controls */}
                    <div className="flex justify-center gap-3 mb-4">
                      {timerStatus === 'running' ? (
                        <button 
                          onClick={pauseTimer}
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600/30 border border-amber-500/20 hover:bg-amber-600/50 rounded-xl text-xs font-semibold transition-all"
                        >
                          <Pause size={14} /> Pause
                        </button>
                      ) : (
                        <button 
                          onClick={startTimer}
                          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-semibold box-glow-violet text-white transition-all"
                        >
                          <Play size={14} /> Start Focus
                        </button>
                      )}
                      <button 
                        onClick={resetTimer}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl text-xs font-semibold text-gray-300 transition-all"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>

                    {/* Preset session lengths */}
                    <div className="grid grid-cols-3 gap-1.5 mb-4 border-t border-white/5 pt-4">
                      <button 
                        onClick={() => setTimerType('focus')}
                        className={`py-1 text-[10px] rounded-lg font-mono font-semibold transition-all ${
                          timerType === 'focus' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20' : 'bg-white/[0.01] hover:bg-white/5 border border-transparent text-gray-500'
                        }`}
                      >
                        Focus
                      </button>
                      <button 
                        onClick={() => setTimerType('shortBreak')}
                        className={`py-1 text-[10px] rounded-lg font-mono font-semibold transition-all ${
                          timerType === 'shortBreak' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20' : 'bg-white/[0.01] hover:bg-white/5 border border-transparent text-gray-500'
                        }`}
                      >
                        Short
                      </button>
                      <button 
                        onClick={() => setTimerType('longBreak')}
                        className={`py-1 text-[10px] rounded-lg font-mono font-semibold transition-all ${
                          timerType === 'longBreak' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20' : 'bg-white/[0.01] hover:bg-white/5 border border-transparent text-gray-500'
                        }`}
                      >
                        Long
                      </button>
                    </div>

                    {/* Focus Ambient Audio streams */}
                    <div className="border-t border-white/5 pt-4 space-y-2">
                      <h4 className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
                        <Music size={10} /> Focus Ambient Station
                      </h4>
                      <div className="grid grid-cols-4 gap-1">
                        {['lofi', 'synthwave', 'ambient', 'nature'].map((track) => (
                          <button
                            key={track}
                            onClick={() => {
                              setActiveAudio(track);
                              setIsAudioPlaying(true);
                            }}
                            className={`py-1 text-[9px] rounded-md font-mono capitalize transition-all ${
                              activeAudio === track && isAudioPlaying 
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20' 
                                : 'bg-white/[0.01] hover:bg-white/5 text-gray-400'
                            }`}
                          >
                            {track}
                          </button>
                        ))}
                      </div>

                      {activeAudio && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-cyan-400"
                          >
                            {isAudioPlaying ? <Pause size={10} /> : <Play size={10} />}
                          </button>
                          <Volume2 size={10} className="text-gray-500" />
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={audioVolume}
                            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile configuration Link */}
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-violet-500/30 transition-all">
                <UserIcon size={16} className="text-violet-400" />
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Layout Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
