import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';
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
  Users,
  ChevronDown
} from 'lucide-react';
import { cn } from "../../lib/utils";
import Copilot from '../ui/Copilot';

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
  const [showTimerDetails, setShowTimerDetails] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [audioElement, setAudioElement] = useState(null);

  // Mobile drawer state
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Desktop "More" dropdown state
  const [showDesktopMore, setShowDesktopMore] = useState(false);

  // Theme support
  const theme = "dark";
  const isDark = true;

  const toggleTheme = () => {};

  // Focus Audio streams
  const audioTracks = {
    lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    synthwave: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    ambient: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    nature: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  };

  // Tick timer
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

  // Cleanup audio
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

  // XP Progress Calculation
  const xpInCurrentLevel = user?.xp ? user.xp % 1000 : 0;
  const xpProgressPercent = (xpInCurrentLevel / 1000) * 100;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Horizontal Desktop Navigation Tabs
  const desktopTabs = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Company Prep', path: '/company-prep' },
    { name: 'Roadmaps', path: '/roadmaps' },
    { name: 'DSA Sheets', path: '/dsa-sheets' },
    { name: 'Mock Interview', path: '/mock-interview' },
    { name: 'Resume Auditor', path: '/resume-auditor' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'More', path: 'more' }
  ];

  const desktopMoreLinks = [
    { name: 'Communities', path: '/communities', icon: MessageSquare },
    { name: 'Hackathons', path: '/hackathons', icon: Compass },
    { name: 'Profile Tracker', path: '/trackers', icon: Award }
  ];

  // Mobile Bottom dock layout items
  const mobileNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Prep', path: '/company-prep', icon: Briefcase },
    { label: 'Roadmaps', path: '/roadmaps', icon: Map },
    { label: 'DSA', path: '/dsa-sheets', icon: Code },
    { label: 'More', path: 'more', icon: Menu }
  ];

  // Items shown inside the mobile More Drawer
  const remainingMobileLinks = [
    { name: 'Resume Auditor', path: '/resume-auditor', icon: FileText },
    { name: 'Mock Interview', path: '/mock-interview', icon: Terminal },
    { name: 'Communities', path: '/communities', icon: MessageSquare },
    { name: 'Hackathons', path: '/hackathons', icon: Compass },
    { name: 'Profile Tracker', path: '/trackers', icon: Award },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy }
  ];

  // Sliding Cursor Pill calculation
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const tabRefs = useRef([]);

  const syncActivePosition = () => {
    let activeIndex = desktopTabs.findIndex(tab => tab.path === location.pathname);
    if (activeIndex === -1) {
      // Highlight "More" tab if current sub-page is in the "More" dropdown
      activeIndex = desktopTabs.findIndex(tab => tab.path === 'more');
    }
    if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
      const activeEl = tabRefs.current[activeIndex];
      setPosition({
        width: activeEl.offsetWidth,
        opacity: 1,
        left: activeEl.offsetLeft,
      });
    } else {
      setPosition(pv => ({ ...pv, opacity: 0 }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(syncActivePosition, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Recalculate on window resize
  useEffect(() => {
    window.addEventListener('resize', syncActivePosition);
    return () => window.removeEventListener('resize', syncActivePosition);
  }, [location.pathname]);

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans selection:bg-violet-600/30 relative overflow-hidden transition-colors duration-500 z-10",
      isDark ? "bg-[#000000] text-gray-100" : "bg-white text-black"
    )}>
      {/* Dark Radial Glow Background (Dark theme only) */}
      {isDark && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle 600px at 50% 150px, rgba(255, 255, 255, 0.03), transparent)`,
          }}
        />
      )}

      {/* Global Desktop & Mobile Navigation Header */}
      <header className={cn(
        "h-20 border-b flex items-center justify-between px-6 lg:px-8 z-30 sticky top-0 backdrop-blur-md transition-colors duration-500",
        isDark 
          ? "bg-black/85 border-white/5" 
          : "bg-white/85 border-zinc-200"
      )}>
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 select-none">
          <img src={logo} alt="StudyQuest Logo" className="w-10 h-10 object-contain rounded-lg" />
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-sm tracking-wide">
              STUDYQUEST
            </h1>
            <span className={cn("text-[9px] tracking-widest font-mono", isDark ? "text-cyan-400" : "text-zinc-500")}>
              CAREER PLATFORM
            </span>
          </div>
        </div>

        {/* Desktop Sliding Hover Menu (center) */}
        <nav className="hidden lg:block relative">
          <ul
            className={cn(
              "relative flex w-fit rounded-full border p-1 transition-all duration-300",
              isDark ? "border-white/5 bg-white/[0.02]" : "border-zinc-200 bg-zinc-50"
            )}
            onMouseLeave={syncActivePosition}
          >
            {/* Sliding Pill Cursor */}
            <motion.li
              animate={position}
              className={cn(
                "absolute z-0 h-8 rounded-full pointer-events-none",
                isDark ? "bg-white/[0.08]" : "bg-black/[0.06]"
              )}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            />

            {desktopTabs.map((tab, index) => {
              const isMore = tab.path === 'more';
              
              if (isMore) {
                return (
                  <li
                    key={tab.name}
                    ref={(el) => (tabRefs.current[index] = el)}
                    onMouseEnter={() => {
                      setShowDesktopMore(true);
                      const el = tabRefs.current[index];
                      if (el) {
                        setPosition({
                          width: el.offsetWidth,
                          opacity: 1,
                          left: el.offsetLeft,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setShowDesktopMore(false);
                      syncActivePosition();
                    }}
                    className={cn(
                      "relative z-10 block cursor-pointer px-4 py-2 text-[10px] font-mono font-bold uppercase transition-colors select-none",
                      location.pathname.startsWith('/communities') || 
                      location.pathname.startsWith('/hackathons') || 
                      location.pathname.startsWith('/trackers')
                        ? (isDark ? "text-cyan-400" : "text-black")
                        : (isDark ? "text-gray-400 hover:text-white" : "text-zinc-500 hover:text-black")
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {tab.name} <ChevronDown size={10} />
                    </span>

                    {/* Desktop "More" Dropdown Menu */}
                    <AnimatePresence>
                      {showDesktopMore && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={cn(
                            "absolute top-full right-0 mt-2.5 w-44 rounded-xl border p-1.5 shadow-xl z-50 text-left transition-colors duration-500",
                            isDark ? "bg-[#07080a] border-white/10 text-white" : "bg-white border-zinc-200 text-black"
                          )}
                        >
                          {desktopMoreLinks.map((link) => {
                            const Icon = link.icon;
                            const isLinkActive = location.pathname === link.path;
                            return (
                              <Link
                                key={link.name}
                                to={link.path}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors font-sans",
                                  isLinkActive
                                    ? (isDark ? "bg-white/10 text-cyan-400" : "bg-zinc-100 text-black font-semibold")
                                    : (isDark ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-zinc-50 text-zinc-600 hover:text-black")
                                )}
                              >
                                <Icon size={14} className="text-violet-500" />
                                <span>{link.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              }

              const isLinkActive = location.pathname === tab.path;

              return (
                <li
                  key={tab.name}
                  ref={(el) => (tabRefs.current[index] = el)}
                  onMouseEnter={() => {
                    const el = tabRefs.current[index];
                    if (el) {
                      setPosition({
                        width: el.offsetWidth,
                        opacity: 1,
                        left: el.offsetLeft,
                      });
                    }
                  }}
                  onMouseLeave={syncActivePosition}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "relative z-10 block cursor-pointer px-4 py-2 text-[10px] font-mono font-bold uppercase transition-colors select-none",
                    isLinkActive
                      ? (isDark ? "text-cyan-400" : "text-black")
                      : (isDark ? "text-gray-400 hover:text-white" : "text-zinc-500 hover:text-black")
                  )}
                >
                  {tab.name}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User HUD, Pomodoro, and Theme Controls (right side) */}
        <div className="flex items-center gap-4 lg:gap-5">
          
          {/* User Streak HUD (Desktop only) */}
          {user && (
            <div className={cn(
              "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold",
              isDark ? "bg-white/[0.02] border-white/5 text-white" : "bg-zinc-50 border-zinc-200 text-black"
            )}>
              <Flame className={cn("w-4 h-4", user.streak > 0 ? "text-amber-500 animate-pulse" : "text-gray-500")} />
              <span className="font-mono text-[10px]">{user.streak} DAYS</span>
            </div>
          )}

          {/* User Level HUD (Desktop only) */}
          {user && (
            <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono">
              <span className="font-bold">LVL {user.level}</span>
              <div className="w-16 bg-zinc-200 dark:bg-white/10 rounded-full h-1 overflow-hidden">
                <div className="bg-violet-600 h-full" style={{ width: `${xpProgressPercent}%` }} />
              </div>
            </div>
          )}

          {/* Pomodoro Timer widget */}
          <div className="relative">
            <button 
              onClick={() => setShowTimerDetails(!showTimerDetails)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold select-none",
                isDark ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/5" : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200"
              )}
            >
              <Clock className={cn("w-3.5 h-3.5 text-violet-500", timerStatus === 'running' ? 'animate-spin' : '')} style={{ animationDuration: '10s' }} />
              <span className="font-mono text-[10px]">{formatTime(timeLeft)}</span>
            </button>

            {/* Float Timer Panel Details */}
            <AnimatePresence>
              {showTimerDetails && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    "absolute right-0 mt-3 w-72 rounded-2xl p-5 shadow-2xl z-50 border transition-all duration-300",
                    isDark ? "bg-[#07080a] border-white/10 text-white" : "bg-white border-zinc-200 text-black"
                  )}
                >
                  <h3 className="text-xs font-bold mb-1.5 flex items-center justify-between">
                    <span>POMODORO STATION</span>
                    <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-mono">{timerType}</span>
                  </h3>
                  <p className="text-[10px] text-gray-500 mb-4">Focus session completes quest and logs XP.</p>
                  
                  <div className={cn(
                    "text-center py-4 rounded-xl mb-4 border",
                    isDark ? "bg-white/[0.01] border-white/5" : "bg-zinc-50 border-zinc-100"
                  )}>
                    <span className="text-3xl font-extrabold font-mono tracking-wider">{formatTime(timeLeft)}</span>
                  </div>

                  {/* Timer controls */}
                  <div className="flex justify-center gap-2 mb-4">
                    {timerStatus === 'running' ? (
                      <button 
                        onClick={pauseTimer}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 border border-amber-500/20 hover:bg-amber-600/30 rounded-xl text-[10px] font-semibold transition-all"
                      >
                        <Pause size={12} /> Pause
                      </button>
                    ) : (
                      <button 
                        onClick={startTimer}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-[10px] font-semibold text-white transition-all shadow-md"
                      >
                        <Play size={12} /> Start Focus
                      </button>
                    )}
                    <button 
                      onClick={resetTimer}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all border",
                        isDark ? "bg-white/[0.03] border-white/5 text-gray-300 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
                      )}
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>

                  {/* Preset session lengths */}
                  <div className={cn(
                    "grid grid-cols-3 gap-1.5 mb-4 border-t pt-4",
                    isDark ? "border-white/5" : "border-zinc-100"
                  )}>
                    <button 
                      onClick={() => setTimerType('focus')}
                      className={`py-1 text-[9px] rounded-lg font-mono font-semibold transition-all ${
                        timerType === 'focus' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' : 'bg-transparent text-gray-500'
                      }`}
                    >
                      Focus
                    </button>
                    <button 
                      onClick={() => setTimerType('shortBreak')}
                      className={`py-1 text-[9px] rounded-lg font-mono font-semibold transition-all ${
                        timerType === 'shortBreak' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' : 'bg-transparent text-gray-500'
                      }`}
                    >
                      Short
                    </button>
                    <button 
                      onClick={() => setTimerType('longBreak')}
                      className={`py-1 text-[9px] rounded-lg font-mono font-semibold transition-all ${
                        timerType === 'longBreak' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' : 'bg-transparent text-gray-500'
                      }`}
                    >
                      Long
                    </button>
                  </div>

                  {/* Ambient Audio Widget inside Pomodoro Panel */}
                  <div className={cn("border-t pt-4 space-y-2", isDark ? "border-white/5" : "border-zinc-100")}>
                    <h4 className="text-[9px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
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
                          className={`py-1 text-[8px] rounded-md font-mono capitalize transition-all ${
                            activeAudio === track && isAudioPlaying 
                              ? 'bg-cyan-500/25 text-cyan-500 border border-cyan-500/20' 
                              : 'bg-transparent text-gray-400 hover:text-gray-200'
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
                          className="p-1 rounded-md bg-zinc-200 dark:bg-white/5 hover:bg-zinc-300 dark:hover:bg-white/10 text-cyan-500"
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
                          className="flex-1 h-1 bg-zinc-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          {/* Profile configuration Avatar and Sign Out Link */}
          <div className="flex items-center gap-3">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group"
            >
              <div className={cn(
                "w-8 h-8 rounded-full border flex items-center justify-center transition-all",
                isDark ? "bg-white/[0.04] border-white/10 hover:border-violet-500/30" : "bg-zinc-100 border-zinc-200 hover:border-black/20"
              )}>
                <UserIcon size={14} className="text-violet-500" />
              </div>
            </Link>

            {/* Logout on Desktop */}
            <button
              onClick={handleLogout}
              className={cn(
                "hidden md:flex items-center justify-center p-2 rounded-full transition-colors cursor-pointer",
                isDark ? "hover:bg-red-500/10 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-zinc-500 hover:text-red-500"
              )}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Layout Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-5 lg:p-8 pb-24 lg:pb-8 relative">
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
              <Copilot />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock Menu */}
      <div className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex justify-around items-center px-2 py-2.5 backdrop-blur-md transition-all duration-300",
        isDark ? "bg-black/90 border-white/5" : "bg-white/95 border-zinc-200"
      )}>
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === 'more' 
            ? showMoreMenu 
            : location.pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.path === 'more') {
                  setShowMoreMenu(!showMoreMenu);
                } else {
                  setShowMoreMenu(false);
                  navigate(item.path);
                }
              }}
              className="flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-xl transition-all relative cursor-pointer"
            >
              <Icon size={18} className={cn(
                "transition-colors",
                isActive 
                  ? (isDark ? "text-cyan-400" : "text-black") 
                  : (isDark ? "text-gray-500" : "text-zinc-400")
              )} />
              <span className={cn(
                "text-[8px] font-mono font-bold transition-colors uppercase tracking-wider",
                isActive 
                  ? (isDark ? "text-cyan-400" : "text-black") 
                  : (isDark ? "text-gray-500" : "text-zinc-500")
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="mobileActiveDot"
                  className={cn(
                    "absolute -bottom-1.5 w-1 h-1 rounded-full",
                    isDark ? "bg-cyan-400" : "bg-black"
                  )} 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Bottom Drawer Menu (More Menu) */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Drawer Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            />
            {/* Bottom Drawer Sheet */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t p-6 max-h-[80vh] overflow-y-auto lg:hidden transition-colors duration-500",
                isDark ? "bg-[#07080a] border-white/10 text-white" : "bg-white border-zinc-200 text-black"
              )}
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xs uppercase tracking-wider font-mono">Operations Module</h3>
                <button onClick={() => setShowMoreMenu(false)} className="p-1 rounded-full hover:bg-white/10 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              {/* User Profile summary inside mobile drawer */}
              {user && (
                <div className={cn(
                  "p-4 rounded-2xl border mb-6",
                  isDark ? "bg-white/[0.02] border-white/5" : "bg-zinc-50 border-zinc-200"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-600 font-bold text-white text-sm shadow-md">
                      {user.level}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold truncate">{user.username}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{user.xp % 1000}/1000 XP</p>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-white/10 rounded-full h-1 mb-3 overflow-hidden">
                    <div className="bg-violet-600 h-full rounded-full" style={{ width: `${xpProgressPercent}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="flex items-center gap-1"><Flame size={12} className="text-amber-500" /> {user.streak} DAYS</span>
                    <span>{user.targetCompany}</span>
                  </div>
                </div>
              )}

              {/* Mobile Drawer menu options */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {remainingMobileLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.name}
                      onClick={() => {
                        setShowMoreMenu(false);
                        navigate(link.path);
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer text-left",
                        isDark 
                          ? "bg-white/[0.01] border-white/5 text-gray-300 hover:bg-white/10" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100"
                      )}
                    >
                      <Icon size={16} className="text-violet-500" />
                      <span>{link.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Logout action */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  handleLogout();
                }}
                className="w-full py-3.5 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
