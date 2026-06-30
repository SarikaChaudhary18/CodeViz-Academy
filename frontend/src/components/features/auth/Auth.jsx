import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Sparkles, User, Lock, Briefcase, Building } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useStore } from "../../../hooks/useStore";
import logo from '../../../assets/logo.png';

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
      className="rounded-full flex items-center justify-center transition-all duration-150"
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

// ==================== Main Auth Component ====================
export default function Auth({ isRegisterMode = false }) {
  const navigate = useNavigate();
  const { login, register, updateProfile, authLoading, authError } = useStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);

  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);

  // Sync state if mode toggles
  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setErrorMessage("");
    setIsTyping(false);
  }, [isRegisterMode]);

  // Tracks global mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking effect for purple character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Blinking effect for black character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Looking at each other animation when typing starts
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

  // Purple sneaky peeking animation when typing password and it's visible
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsPurplePeeking(false);
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

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

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
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Check credentials.');
    }
  };

  // Local storage theme option
  const theme = "dark";
  const isDark = true;

  const toggleTheme = () => {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans select-none overflow-hidden relative">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-[850px] bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl flex flex-col md:flex-row z-10 animate-in fade-in zoom-in duration-305">
        
        {/* Left Content Section: Cartoon Characters (desktop only) */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-between p-8 relative overflow-hidden border-r border-zinc-200/80 hidden md:flex z-20">
          <div className="relative">
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="w-[3.5rem] h-[3.5rem] object-contain" />
            </div>
          </div>

          {/* Character Container */}
          <div className="relative z-20 flex items-end justify-center h-[460px] select-none">
            <div className="relative" style={{ width: '500px', height: '400px' }}>
              
              {/* Purple Tall Character - Back Layer */}
              <div 
                ref={purpleRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '60px',
                  width: '160px',
                  height: (isTyping || (password.length > 0 && !showPassword)) ? '420px' : '380px',
                  backgroundColor: '#6C3FF5',
                  borderRadius: '10px 10px 0 0',
                  zIndex: 1,
                  transform: (password.length > 0 && showPassword)
                    ? `skewX(0deg)`
                    : (isTyping || (password.length > 0 && !showPassword))
                      ? `skewX(${(purplePos.bodySkew || 0) - 10}deg) translateX(30px)` 
                      : `skewX(${purplePos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Eyes */}
                <div 
                  className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                  style={{
                    left: (password.length > 0 && showPassword) ? `18px` : isLookingAtEachOther ? `48px` : `${40 + purplePos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? `32px` : isLookingAtEachOther ? `60px` : `${35 + purplePos.faceY}px`,
                  }}
                >
                  <EyeBall 
                    size={18} 
                    pupilSize={7} 
                    maxDistance={5} 
                    eyeColor="white" 
                    pupilColor="#2D2D2D" 
                    isBlinking={isPurpleBlinking}
                    forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                    forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                  />
                  <EyeBall 
                    size={18} 
                    pupilSize={7} 
                    maxDistance={5} 
                    eyeColor="white" 
                    pupilColor="#2D2D2D" 
                    isBlinking={isPurpleBlinking}
                    forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                    forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                  />
                </div>
              </div>

              {/* Black Tall Character - Middle Layer */}
              <div 
                ref={blackRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '210px',
                  width: '110px',
                  height: '300px',
                  backgroundColor: '#2D2D2D',
                  borderRadius: '8px 8px 0 0',
                  zIndex: 2,
                  transform: (password.length > 0 && showPassword)
                    ? `skewX(0deg)`
                    : isLookingAtEachOther
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 8}deg) translateX(15px)`
                      : (isTyping || (password.length > 0 && !showPassword))
                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` 
                        : `skewX(${blackPos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Eyes */}
                <div 
                  className="absolute flex gap-5 transition-all duration-700 ease-in-out"
                  style={{
                    left: (password.length > 0 && showPassword) ? `10px` : isLookingAtEachOther ? `30px` : `${24 + blackPos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? `25px` : isLookingAtEachOther ? `10px` : `${28 + blackPos.faceY}px`,
                  }}
                >
                  <EyeBall 
                    size={16} 
                    pupilSize={6} 
                    maxDistance={4} 
                    eyeColor="white" 
                    pupilColor="#2D2D2D" 
                    isBlinking={isBlackBlinking}
                    forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                    forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                  />
                  <EyeBall 
                    size={16} 
                    pupilSize={6} 
                    maxDistance={4} 
                    eyeColor="white" 
                    pupilColor="#2D2D2D" 
                    isBlinking={isBlackBlinking}
                    forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                    forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                  />
                </div>
              </div>

              {/* Orange Semi-Circle Character - Front Left */}
              <div 
                ref={orangeRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '0px',
                  width: '210px',
                  height: '180px',
                  zIndex: 3,
                  backgroundColor: '#FF9B6B',
                  borderRadius: '110px 110px 0 0',
                  transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Eyes */}
                <div 
                  className="absolute flex gap-7 transition-all duration-200 ease-out"
                  style={{
                    left: (password.length > 0 && showPassword) ? `45px` : `${72 + orangePos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? `80px` : `${82 + orangePos.faceY}px`,
                  }}
                >
                  <Pupil size={11} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                  <Pupil size={11} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                </div>
              </div>

              {/* Yellow Rounded Tall Character - Front Right */}
              <div 
                ref={yellowRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '280px',
                  width: '130px',
                  height: '220px',
                  backgroundColor: '#E8D754',
                  borderRadius: '65px 65px 0 0',
                  zIndex: 4,
                  transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Eyes */}
                <div 
                  className="absolute flex gap-5 transition-all duration-200 ease-out"
                  style={{
                    left: (password.length > 0 && showPassword) ? `18px` : `${48 + yellowPos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? `30px` : `${35 + yellowPos.faceY}px`,
                  }}
                >
                  <Pupil size={11} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                  <Pupil size={11} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                </div>
                {/* Mouth */}
                <div 
                  className="absolute w-16 h-[3px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                  style={{
                    left: (password.length > 0 && showPassword) ? `8px` : `${36 + yellowPos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? `82px` : `${82 + yellowPos.faceY}px`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-grid-black/[0.03] bg-[size:16px_16px] pointer-events-none" />
        </div>

        {/* Right Section: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative z-20">
          <div className="w-full space-y-6">
            
            {/* Header */}
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-zinc-950 leading-tight">
                {isRegisterMode ? "SEED SYSTEM DNA" : "WELCOME DEVELOPER"}
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-orange-600 font-bold">
                {isRegisterMode ? "Initialize System Modules" : "Verify Learner Identity"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username (Register Mode Only) */}
              {isRegisterMode && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest block font-bold text-zinc-600">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. NeoCoder"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      required
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white focus:bg-zinc-50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-semibold transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Email (Both Modes) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold text-zinc-600">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    placeholder="operator@studyquest.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white focus:bg-zinc-50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-semibold transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password (Both Modes) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold text-zinc-600">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-zinc-200 bg-white focus:bg-zinc-50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-semibold transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Target Role & Company (Register Mode Only) */}
              {isRegisterMode && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest block font-bold text-zinc-600">
                      Target Role
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Briefcase size={15} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Developer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white focus:bg-zinc-50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-semibold transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest block font-bold text-zinc-600">
                      Target Company
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Building size={15} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Google"
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white focus:bg-zinc-50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-semibold transition-all outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Error Message Display */}
              {(errorMessage || authError) && (
                <div className="p-3.5 rounded-xl text-[10px] font-mono text-left border leading-normal bg-red-50 border-red-200 text-red-700">
                  <span className="font-bold uppercase mr-1">[CRITICAL ERROR]:</span> 
                  {errorMessage || authError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold transition-all duration-300 cursor-pointer shadow-md select-none"
              >
                {authLoading ? "Initializing..." : isRegisterMode ? "Seed Profile" : "Initialize Interface"} &rarr;
              </button>

            </form>

            {/* Switch Mode Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate(isRegisterMode ? '/login' : '/register')}
                className="text-[10px] font-mono tracking-wider text-orange-600 hover:text-orange-500 uppercase transition-all duration-200 cursor-pointer underline decoration-dotted underline-offset-4 font-bold"
              >
                {isRegisterMode ? "Switch to Access Module (LogIn)" : "Switch to Seed Profile (Signup)"}
              </button>
            </div>

            <p className="text-[9px] leading-relaxed font-mono text-center text-zinc-400">
              System validation implies consent to security guidelines, operational parameters, and standard kernel privacy codes.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
