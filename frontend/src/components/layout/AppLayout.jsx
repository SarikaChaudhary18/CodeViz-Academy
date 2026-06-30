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
    tick,
    userRole,
    setUserRole
  } = useStore();

  const location = useLocation();
  const navigate = useNavigate();
  const [showTimerDetails, setShowTimerDetails] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [audioElement, setAudioElement] = useState(null);

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
    navigate('/');
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
    { name: 'Learning DNA', path: '/skill-dna' },
    { name: 'Forgetting Prediction', path: '/forgetting-prediction' }
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

  // Admin groups based on role
  const adminGroup = [];
  if (userRole === 'faculty') {
    adminGroup.push({ name: 'Faculty Dashboard', path: '/college/faculty' });
  } else if (userRole === 'recruiter') {
    adminGroup.push({ name: 'Recruiter Portal', path: '/career/recruiter' });
  } else if (userRole === 'enterprise') {
    adminGroup.push({ name: 'Employee Dashboard', path: '/enterprise/dashboard' });
    adminGroup.push({ name: 'Certification Badges', path: '/enterprise/badges' });
  } else {
    // Default student views
    adminGroup.push({ name: 'Student Classroom', path: '/college/classroom' });
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-orange-600/30 selection:text-orange-950 relative overflow-hidden transition-colors duration-500 z-10 bg-white text-zinc-950">
      
      {/* Global Desktop & Mobile Navigation Header */}
      <header className="h-20 border-b flex items-center justify-between px-6 lg:px-8 z-30 sticky top-0 backdrop-blur-md bg-white/85 border-zinc-200">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 select-none">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-lg border border-zinc-200" />
          <div className="hidden sm:block text-left">
            <h1 className="font-extrabold text-sm tracking-wide text-zinc-950">
              CODEVIZ ACADEMY
            </h1>
            <span className="text-[9px] tracking-widest font-mono text-orange-600 font-bold uppercase">
              VISUAL CODING ACADEMY
            </span>
          </div>
        </div>

        {/* User HUD, Pomodoro, and Theme Controls (right side) */}
        <div className="flex items-center gap-3 lg:gap-4">
          
          {/* Interactive Role Swapper Mock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-semibold">
            <span className="text-[9px] text-zinc-550 font-mono mr-1">ROLE:</span>
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-transparent border-none text-[9px] font-bold font-mono focus:outline-none cursor-pointer text-orange-600 uppercase"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="recruiter">Recruiter</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* User Streak HUD */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900">
              <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
              <span className="font-mono text-[9px]">{user.streak || 3} DAYS</span>
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

          {/* Profile configuration Avatar and Sign Out Link */}
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
            {/* Learning */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Learning</span>
              <div className="space-y-0.5">
                {learningGroup.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={cn(
                      "block px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      location.pathname === item.path 
                        ? "bg-orange-50 text-orange-600 font-bold" 
                        : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* AI Tools */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">AI Tools</span>
              <div className="space-y-0.5">
                {aiToolsGroup.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={cn(
                      "block px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      location.pathname === item.path 
                        ? "bg-orange-50 text-orange-600 font-bold" 
                        : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Visualize */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Visualize</span>
              <div className="space-y-0.5">
                {visualizeGroup.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={cn(
                      "block px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      location.pathname === item.path 
                        ? "bg-orange-50 text-orange-600 font-bold" 
                        : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Community */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Community</span>
              <div className="space-y-0.5">
                {communityGroup.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={cn(
                      "block px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      location.pathname === item.path 
                        ? "bg-orange-50 text-orange-600 font-bold" 
                        : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Games */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Games</span>
              <div className="space-y-0.5">
                {gamesGroup.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={cn(
                      "block px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      location.pathname === item.path 
                        ? "bg-orange-50 text-orange-600 font-bold" 
                        : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Career */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Career</span>
              <div className="space-y-0.5">
                {careerGroup.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={cn(
                      "block px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      location.pathname === item.path 
                        ? "bg-orange-50 text-orange-600 font-bold" 
                        : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Admin Role-based Section */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Admin Module ({userRole})</span>
              <div className="space-y-0.5">
                {adminGroup.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={cn(
                      "block px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      location.pathname === item.path 
                        ? "bg-orange-50 text-orange-600 font-bold" 
                        : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

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

    </div>
  );
}
