import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Bell,
  CheckCheck,
  UserPlus,
  GraduationCap
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
    tick,
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationsRead,
    acceptConnection,
    rejectConnection,
    fetchPeers,
  } = useStore();

  const location = useLocation();
  const navigate = useNavigate();
  const [showTimerDetails, setShowTimerDetails] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [audioElement, setAudioElement] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

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

  // Fetch notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    navigate('/');
  };

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markNotificationsRead();
    }
  };

  const handleAcceptFromNotif = async (senderId) => {
    try {
      await acceptConnection(senderId);
      await fetchPeers();
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectFromNotif = async (senderId) => {
    try {
      await rejectConnection(senderId);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // XP Progress Calculation
  const xpInCurrentLevel = user?.xp ? user.xp % 1000 : 0;
  const xpProgressPercent = (xpInCurrentLevel / 1000) * 100;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Sidebar link categories
  const learningGroup = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Courses', path: '/courses' },
    { name: 'Quizzes', path: '/quizzes' },
    { name: 'Roadmaps', path: '/roadmaps' },
    { name: 'Learning DNA', path: '/skill-dna' }
  ];

  const aiToolsGroup = [
    { name: 'Socratic Mentor', path: '/socratic-mentor' },
    { name: 'Bug Detective', path: '/bug-detective' },
    { name: 'Code Review', path: '/code-review' },
    { name: 'Career Navigator', path: '/career-navigator' },
    { name: 'Interview Simulator', path: '/interview-simulator' }
  ];

  const visualizeGroup = [
    { name: 'Execution Trace', path: '/visualizer/execution-trace' },
    { name: 'Step Debugger', path: '/visualizer/step-debugger' },
    { name: 'Architecture Visualizer', path: '/visualizer/architecture' }
  ];

  const communityGroup = [
    { name: 'Chat Rooms', path: '/communities' },
    { name: 'Buddy Finder', path: '/community/buddy-finder' },
    { name: 'Collab Room', path: '/community/collab' },
    { name: 'Video Meeting', path: '/community/meeting' },
    { name: 'Whiteboard', path: '/community/whiteboard' }
  ];

  const gamesGroup = [
    { name: 'Adventure Hub', path: '/games/adventure-hub' },
    { name: 'Code Battle', path: '/games/code-battle' },
    { name: 'Bug Hunt', path: '/games/bug-hunt' },
    { name: 'Algorithm Race', path: '/games/algo-race' },
    { name: 'Escape Room', path: '/games/escape-room' }
  ];

  const careerGroup = [
    { name: 'DSA Sheets Practice', path: '/dsa-sheets' },
    { name: 'Resume Auditor', path: '/resume-auditor' },
    { name: 'Mock Interview Flow', path: '/mock-interview' },
    { name: 'Project List', path: '/projects/list' },
    { name: 'Portfolio Page', path: '/projects/portfolio' },
    { name: 'AI Project Reviewer', path: '/projects/reviewer' }
  ];

  const studentGroup = [
    { name: 'Student Classroom', path: '/college/classroom' }
  ];

  const SidebarLink = ({ item, onClick }) => (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        "block px-3 py-2 rounded-xl text-xs font-semibold transition-all",
        location.pathname === item.path
          ? "bg-orange-50 text-orange-600 font-bold"
          : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950"
      )}
    >
      {item.name}
    </Link>
  );

  const SidebarSection = ({ label, items, onClick }) => (
    <div className="space-y-2">
      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">{label}</span>
      <div className="space-y-0.5">
        {items.map(item => <SidebarLink key={item.name} item={item} onClick={onClick} />)}
      </div>
    </div>
  );

  const notifIcon = (type) => {
    if (type === 'friend_request') return <UserPlus size={12} className="text-orange-500" />;
    if (type === 'friend_accepted') return <CheckCheck size={12} className="text-green-500" />;
    return <Bell size={12} className="text-zinc-400" />;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-orange-600/30 selection:text-orange-950 relative overflow-hidden transition-colors duration-500 z-10 bg-white text-zinc-950">
      
      {/* Global Desktop & Mobile Navigation Header */}
      <header className="h-20 border-b flex items-center justify-between px-6 lg:px-8 z-30 sticky top-0 backdrop-blur-md bg-white/85 border-zinc-200">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 select-none">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-2 -ml-2 rounded-lg lg:hidden hover:bg-zinc-100 text-zinc-700 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src={logo} alt="Logo" className="w-[3rem] h-[3rem] object-contain" />
        </div>

        {/* User HUD, Pomodoro, and Controls (right side) */}
        <div className="flex items-center gap-3 lg:gap-4">
          
          {/* Static Student Role Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-[9px] font-bold font-mono text-orange-600 uppercase">Student</span>
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleOpenNotifications}
              className="relative flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-zinc-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                    <span className="text-[10px] font-bold font-mono text-zinc-700 uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[9px] text-orange-600 font-mono font-bold">{unreadCount} NEW</span>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell size={20} className="text-zinc-300 mx-auto mb-2" />
                        <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={cn(
                            "px-4 py-3 text-left transition-colors",
                            !notif.read ? "bg-orange-50/40" : "bg-white hover:bg-zinc-50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                              notif.type === 'friend_request' ? "bg-orange-100" : "bg-green-100"
                            )}>
                              {notifIcon(notif.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-zinc-800 font-medium leading-relaxed">{notif.message}</p>
                              <p className="text-[9px] text-zinc-400 font-mono mt-0.5">
                                {new Date(notif.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>

                              {/* Inline Accept/Decline for friend_request */}
                              {notif.type === 'friend_request' && notif.sender && (
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() => handleAcceptFromNotif(notif.sender._id)}
                                    className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[9px] font-bold font-mono transition-all cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectFromNotif(notif.sender._id)}
                                    className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-200 rounded-lg text-[9px] font-bold font-mono transition-all cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Unread dot */}
                            {!notif.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Streak HUD */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900">
              <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
              <span className="font-mono text-[9px]">{user.streak || 0} DAYS</span>
            </div>
          )}

          {/* Pomodoro Timer widget */}
          <div className="relative">
            <button 
              onClick={() => setShowTimerDetails(!showTimerDetails)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-all text-xs font-semibold select-none text-zinc-800"
            >
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span className="font-mono text-[9px]">{formatTime(timeLeft)}</span>
            </button>

            {/* Float Timer Panel Details */}
            <AnimatePresence>
              {showTimerDetails && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-72 rounded-2xl p-5 shadow-2xl z-50 border transition-all duration-300 bg-white border-zinc-200 text-zinc-950"
                >
                  <h3 className="text-xs font-bold mb-1.5 flex items-center justify-between text-zinc-950">
                    <span>POMODORO STATION</span>
                    <span className="text-[9px] text-orange-600 uppercase tracking-widest font-mono">{timerType}</span>
                  </h3>
                  <p className="text-[9px] text-zinc-500 mb-4 text-left">Focus session completes quest and logs XP.</p>
                  
                  <div className="text-center py-4 rounded-xl mb-4 border border-zinc-100 bg-zinc-50/50">
                    <span className="text-3xl font-extrabold font-mono tracking-wider text-zinc-900">{formatTime(timeLeft)}</span>
                  </div>

                  {/* Timer controls */}
                  <div className="flex justify-center gap-2 mb-4">
                    {timerStatus === 'running' ? (
                      <button 
                        onClick={pauseTimer}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        <Pause size={12} /> Pause
                      </button>
                    ) : (
                      <button 
                        onClick={startTimer}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-semibold transition-all shadow-sm cursor-pointer"
                      >
                        <Play size={12} /> Start Focus
                      </button>
                    )}
                    <button 
                      onClick={resetTimer}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Avatar and Sign Out */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center">
              <UserIcon size={14} className="text-orange-600" />
            </div>

            {/* Logout on Desktop */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-full transition-colors cursor-pointer hover:bg-red-50 text-zinc-500 hover:text-red-650"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Layout Content */}
      <div className="flex-1 flex flex-row min-w-0">
        
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-zinc-200 bg-white p-4 h-[calc(100vh-80px)] overflow-y-auto hidden lg:block text-left select-none scrollbar-thin">
          <div className="space-y-6">
            <SidebarSection label="Learning" items={learningGroup} />
            <SidebarSection label="AI Tools" items={aiToolsGroup} />
            <SidebarSection label="Visualize" items={visualizeGroup} />
            <SidebarSection label="Community" items={communityGroup} />
            <SidebarSection label="Games" items={gamesGroup} />
            <SidebarSection label="Career" items={careerGroup} />
            <SidebarSection label="Student" items={studentGroup} />
          </div>
        </aside>

        {/* Content Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <main className="flex-1 overflow-y-auto p-5 lg:p-8 pb-24 lg:pb-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full text-zinc-950"
              >
                {children}
                <Copilot />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

      </div>

      {/* Mobile Left Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => setShowMobileSidebar(false)}
            />
            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-64 h-full z-10 flex-shrink-0"
            >
              {/* Close Button overlay */}
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="absolute top-4 right-[-44px] p-2 bg-zinc-900 text-white rounded-r-lg shadow-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="h-full flex flex-col bg-white p-4 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                  <img src={logo} alt="Logo" className="w-10 h-10 object-contain animate-pulse" />
                  <span className="font-bold text-xs font-mono">CODEVIZ ACADEMY</span>
                </div>
                <div className="space-y-6">
                  <SidebarSection label="Learning" items={learningGroup} onClick={() => setShowMobileSidebar(false)} />
                  <SidebarSection label="AI Tools" items={aiToolsGroup} onClick={() => setShowMobileSidebar(false)} />
                  <SidebarSection label="Visualize" items={visualizeGroup} onClick={() => setShowMobileSidebar(false)} />
                  <SidebarSection label="Community" items={communityGroup} onClick={() => setShowMobileSidebar(false)} />
                  <SidebarSection label="Games" items={gamesGroup} onClick={() => setShowMobileSidebar(false)} />
                  <SidebarSection label="Career" items={careerGroup} onClick={() => setShowMobileSidebar(false)} />
                  <SidebarSection label="Student" items={studentGroup} onClick={() => setShowMobileSidebar(false)} />
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
