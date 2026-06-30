import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Sparkles, User, Lock, Briefcase, Building, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useStore } from "../../../hooks/useStore";
import logo from '../../../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== Pupil Component ====================
const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

// ==================== EyeBall Component ====================
const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150 border border-zinc-200"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

export default function AuthModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthModalOpen, 
    authModalRedirectPath, 
    closeAuthModal, 
    login, 
    register, 
    updateProfile, 
    authLoading, 
    authError 
  } = useStore();

  const handleClose = () => {
    closeAuthModal();
    if (location.pathname === '/login' || location.pathname === '/register') {
      navigate('/');
    }
  };

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isOrangeBlinking, setIsOrangeBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isOrangePeeking, setIsOrangePeeking] = useState(false);

  const orangeCharRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const grayRef = useRef(null);

  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setErrorMessage("");
    setIsTyping(false);
  }, [isRegisterMode]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsOrangeBlinking(true);
        setTimeout(() => {
          setIsOrangeBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsOrangePeeking(true);
          setTimeout(() => {
            setIsOrangePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };
      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsOrangePeeking(false);
    }
  }, [password, showPassword]);

  const calculatePosition = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const orangePos = calculatePosition(orangeCharRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const grayPos = calculatePosition(grayRef);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      if (isRegisterMode) {
        if (!username || !email || !password) {
          setErrorMessage("Please fill in all required fields.");
          return;
        }
        await register(username, email, password);
        await updateProfile({ targetRole, targetCompany });
      } else {
        if (!email || !password) {
          setErrorMessage("Please provide both email and password.");
          return;
        }
        await login(email, password);
      }
      closeAuthModal();
      if (authModalRedirectPath) {
        navigate(authModalRedirectPath);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Check credentials.');
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-[850px] bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl flex flex-col md:flex-row z-10 animate-in fade-in zoom-in duration-305">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors z-30"
        >
          <X size={18} />
        </button>

        {/* Left Side: Animated Characters */}
        <div className="w-full md:w-1/2 bg-zinc-50 flex flex-col justify-between p-8 relative overflow-hidden border-r border-zinc-200/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
            <img src={logo} alt="Logo" className="w-6 h-6 object-contain rounded-lg" />
            <span className="font-mono tracking-wider font-bold text-zinc-900">CODEVIZ ACADEMY</span>
          </div>

          {/* Character Container */}
          <div className="relative flex items-end justify-center h-[260px] md:h-[320px] select-none mt-6">
            <div className="relative w-[320px] h-[280px]">
              
              {/* Tall Orange Accent Character */}
              <div 
                ref={orangeCharRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '40px',
                  width: '100px',
                  height: (isTyping || (password.length > 0 && !showPassword)) ? '260px' : '230px',
                  backgroundColor: '#ea580c', // orange accent
                  borderRadius: '10px 10px 0 0',
                  zIndex: 1,
                  transform: (password.length > 0 && showPassword)
                    ? `skewX(0deg)`
                    : (isTyping || (password.length > 0 && !showPassword))
                      ? `skewX(${(orangePos.bodySkew || 0) - 10}deg) translateX(20px)` 
                      : `skewX(${orangePos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Eyes */}
                <div 
                  className="absolute flex gap-4 transition-all duration-700 ease-in-out"
                  style={{
                    left: (password.length > 0 && showPassword) ? `12px` : isLookingAtEachOther ? `30px` : `${24 + orangePos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? `24px` : isLookingAtEachOther ? `40px` : `${25 + orangePos.faceY}px`,
                  }}
                >
                  <EyeBall 
                    size={14} 
                    pupilSize={5} 
                    maxDistance={4} 
                    eyeColor="white" 
                    pupilColor="#2D2D2D" 
                    isBlinking={isOrangeBlinking}
                    forceLookX={(password.length > 0 && showPassword) ? (isOrangePeeking ? 3 : -3) : isLookingAtEachOther ? 2 : undefined}
                    forceLookY={(password.length > 0 && showPassword) ? (isOrangePeeking ? 3 : -3) : isLookingAtEachOther ? 3 : undefined}
                  />
                  <EyeBall 
                    size={14} 
                    pupilSize={5} 
                    maxDistance={4} 
                    eyeColor="white" 
                    pupilColor="#2D2D2D" 
                    isBlinking={isOrangeBlinking}
                    forceLookX={(password.length > 0 && showPassword) ? (isOrangePeeking ? 3 : -3) : isLookingAtEachOther ? 2 : undefined}
                    forceLookY={(password.length > 0 && showPassword) ? (isOrangePeeking ? 3 : -3) : isLookingAtEachOther ? 3 : undefined}
                  />
                </div>
              </div>

              {/* Black Tall Character */}
              <div 
                ref={blackRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '130px',
                  width: '80px',
                  height: '200px',
                  backgroundColor: '#27272a',
                  borderRadius: '8px 8px 0 0',
                  zIndex: 2,
                  transform: (password.length > 0 && showPassword)
                    ? `skewX(0deg)`
                    : isLookingAtEachOther
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 8}deg) translateX(10px)`
                      : (isTyping || (password.length > 0 && !showPassword))
                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` 
                        : `skewX(${blackPos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Eyes */}
                <div 
                  className="absolute flex gap-3 transition-all duration-700 ease-in-out"
                  style={{
                    left: (password.length > 0 && showPassword) ? `8px` : isLookingAtEachOther ? `20px` : `${16 + blackPos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? `20px` : isLookingAtEachOther ? `8px` : `${20 + blackPos.faceY}px`,
                  }}
                >
                  <EyeBall 
                    size={12} 
                    pupilSize={4} 
                    maxDistance={3} 
                    eyeColor="white" 
                    pupilColor="#2D2D2D" 
                    isBlinking={isBlackBlinking}
                    forceLookX={(password.length > 0 && showPassword) ? -3 : isLookingAtEachOther ? 0 : undefined}
                    forceLookY={(password.length > 0 && showPassword) ? -3 : isLookingAtEachOther ? -3 : undefined}
                  />
                  <EyeBall 
                    size={12} 
                    pupilSize={4} 
                    maxDistance={3} 
                    eyeColor="white" 
                    pupilColor="#2D2D2D" 
                    isBlinking={isBlackBlinking}
                    forceLookX={(password.length > 0 && showPassword) ? -3 : isLookingAtEachOther ? 0 : undefined}
                    forceLookY={(password.length > 0 && showPassword) ? -3 : isLookingAtEachOther ? -3 : undefined}
                  />
                </div>
              </div>

              {/* Yellow Semi-Circle Character */}
              <div 
                ref={yellowRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '0px',
                  width: '140px',
                  height: '120px',
                  zIndex: 3,
                  backgroundColor: '#f59e0b',
                  borderRadius: '70px 70px 0 0',
                  transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div 
                  className="absolute flex gap-4 transition-all duration-200 ease-out"
                  style={{
                    left: (password.length > 0 && showPassword) ? `30px` : `${45 + yellowPos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? `50px` : `${52 + yellowPos.faceY}px`,
                  }}
                >
                  <Pupil size={8} maxDistance={3} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -3 : undefined} forceLookY={(password.length > 0 && showPassword) ? -3 : undefined} />
                  <Pupil size={8} maxDistance={3} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -3 : undefined} forceLookY={(password.length > 0 && showPassword) ? -3 : undefined} />
                </div>
              </div>

              {/* Gray Character on the Right */}
              <div 
                ref={grayRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '180px',
                  width: '90px',
                  height: '150px',
                  backgroundColor: '#a1a1aa',
                  borderRadius: '45px 45px 0 0',
                  zIndex: 4,
                  transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${grayPos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div 
                  className="absolute flex gap-3 transition-all duration-200 ease-out"
                  style={{
                    left: (password.length > 0 && showPassword) ? `12px` : `${30 + grayPos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? `20px` : `${25 + grayPos.faceY}px`,
                  }}
                >
                  <Pupil size={8} maxDistance={3} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -3 : undefined} forceLookY={(password.length > 0 && showPassword) ? -3 : undefined} />
                  <Pupil size={8} maxDistance={3} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -3 : undefined} forceLookY={(password.length > 0 && showPassword) ? -3 : undefined} />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 font-mono text-center mt-4">
            System verification module active.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-white text-zinc-950">
          <div className="w-full max-w-[320px] space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-zinc-950 leading-none">
                {isRegisterMode ? "SEED PROFILE DNA" : "WELCOME DEVELOPER"}
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-orange-600 font-bold">
                {isRegisterMode ? "Initialize System Modules" : "Verify Learner Identity"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegisterMode && (
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <User size={13} />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. NeoCoder"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      required
                      className="w-full h-10 pl-8 pr-3 rounded-lg text-xs font-mono border border-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-zinc-50 text-zinc-950"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Mail size={13} />
                  </span>
                  <input
                    type="email"
                    placeholder="operator@studyquest.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="w-full h-10 pl-8 pr-3 rounded-lg text-xs font-mono border border-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-zinc-50 text-zinc-950"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock size={13} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="w-full h-10 pl-8 pr-9 rounded-lg text-xs font-mono border border-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-zinc-50 text-zinc-950"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {isRegisterMode && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                      Target Role
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                        <Briefcase size={13} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Developer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                        className="w-full h-10 pl-8 pr-3 rounded-lg text-xs font-mono border border-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-zinc-50 text-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                      Target Company
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                        <Building size={13} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Google"
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                        className="w-full h-10 pl-8 pr-3 rounded-lg text-xs font-mono border border-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-zinc-50 text-zinc-950"
                      />
                    </div>
                  </div>
                </>
              )}

              {(errorMessage || authError) && (
                <div className="p-3 rounded-lg text-[9px] font-mono text-left border border-red-200 bg-red-50 text-red-700 leading-normal">
                  <span className="font-bold uppercase mr-1">[ERROR]:</span> 
                  {errorMessage || authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-10 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md select-none flex items-center justify-center gap-2"
              >
                {authLoading ? "Initializing..." : isRegisterMode ? "Seed Profile" : "Initialize Interface"} &rarr;
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-[9px] font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer underline decoration-dotted underline-offset-4 font-bold text-orange-600 hover:text-orange-700"
              >
                {isRegisterMode ? "Switch to Access Module (LogIn)" : "Switch to Seed Profile (Signup)"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
