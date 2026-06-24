import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Target, BookOpen, Terminal, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';
import TextReveal from '../ui/TextReveal';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from "../../lib/utils";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ==================== Premium Background (Floating Beams & Grain Noise) ====================
function createBeam(width, height, layer) {
  const angle = -35 + Math.random() * 10;
  const baseSpeed = 0.2 + layer * 0.2;
  const baseOpacity = 0.08 + layer * 0.05;
  const baseWidth = 10 + layer * 5;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    width: baseWidth,
    length: height * 2.5,
    angle,
    speed: baseSpeed + Math.random() * 0.2,
    opacity: baseOpacity + Math.random() * 0.1,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.01 + Math.random() * 0.015,
    layer,
  };
}

const AuroraBackground = ({ isDark }) => {
  const canvasRef = useRef(null);
  const noiseRef = useRef(null);
  const beamsRef = useRef([]);
  const animationFrameRef = useRef(0);

  const LAYERS = 3;
  const BEAMS_PER_LAYER = 8;

  useEffect(() => {
    if (!isDark) return;

    const canvas = canvasRef.current;
    const noiseCanvas = noiseRef.current;
    if (!canvas || !noiseCanvas) return;
    const ctx = canvas.getContext("2d");
    const nCtx = noiseCanvas.getContext("2d");
    if (!ctx || !nCtx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      noiseCanvas.width = window.innerWidth * dpr;
      noiseCanvas.height = window.innerHeight * dpr;
      noiseCanvas.style.width = `${window.innerWidth}px`;
      noiseCanvas.style.height = `${window.innerHeight}px`;
      nCtx.setTransform(1, 0, 0, 1, 0, 0);
      nCtx.scale(dpr, dpr);

      beamsRef.current = [];
      for (let layer = 1; layer <= LAYERS; layer++) {
        for (let i = 0; i < BEAMS_PER_LAYER; i++) {
          beamsRef.current.push(createBeam(window.innerWidth, window.innerHeight, layer));
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const generateNoise = () => {
      const imgData = nCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.random() * 255;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 12;
      }
      nCtx.putImageData(imgData, 0, 0);
    };

    const drawBeam = (beam) => {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity = Math.min(1, beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.4));
      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `rgba(0,255,255,0)`);
      gradient.addColorStop(0.2, `rgba(0,255,255,${pulsingOpacity * 0.5})`);
      gradient.addColorStop(0.5, `rgba(0,255,255,${pulsingOpacity})`);
      gradient.addColorStop(0.8, `rgba(0,255,255,${pulsingOpacity * 0.5})`);
      gradient.addColorStop(1, `rgba(0,255,255,0)`);

      ctx.fillStyle = gradient;
      ctx.filter = `blur(${2 + beam.layer * 2}px)`;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    };

    const animate = () => {
      if (!canvas || !ctx) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#050505");
      gradient.addColorStop(1, "#111111");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      beamsRef.current.forEach((beam) => {
        beam.y -= beam.speed * (beam.layer / LAYERS + 0.5);
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -50) {
          beam.y = window.innerHeight + 50;
          beam.x = Math.random() * window.innerWidth;
        }
        drawBeam(beam);
      });

      generateNoise();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isDark]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden transition-opacity duration-1000" style={{ opacity: isDark ? 0.85 : 0 }}>
      <canvas ref={noiseRef} className="absolute inset-0 z-0 pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
    </div>
  );
};

// ==================== Magnetic Button component ====================
const MagneticButton = React.forwardRef(({ className, children, as: Component = "button", ...props }, forwardedRef) => {
  const localRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const element = localRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      const handleMouseMove = (e) => {
        const rect = element.getBoundingClientRect();
        const h = rect.width / 2;
        const w = rect.height / 2;
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - w;

        gsap.to(element, {
          x: x * 0.4,
          y: y * 0.4,
          rotationX: -y * 0.15,
          rotationY: x * 0.15,
          scale: 1.05,
          ease: "power2.out",
          duration: 0.4,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          ease: "elastic.out(1, 0.3)",
          duration: 1.2,
        });
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, element);

    return () => ctx.revert();
  }, []);

  return (
    <Component
      ref={(node) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </Component>
  );
});
MagneticButton.displayName = "MagneticButton";

// ==================== Cinematic Curtain Reveal Footer ====================
const FOOTER_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  
  /* Theme variables mapping */
  --bg-color: #020617;
  --fg-color: #ffffff;
  --primary-color: #8b5cf6;
  --secondary-color: #06b6d4;
  
  --pill-bg-1: rgba(255, 255, 255, 0.03);
  --pill-bg-2: rgba(255, 255, 255, 0.01);
  --pill-shadow: rgba(0, 0, 0, 0.5);
  --pill-highlight: rgba(255, 255, 255, 0.1);
  --pill-inset-shadow: rgba(0, 0, 0, 0.8);
  --pill-border: rgba(255, 255, 255, 0.08);
  
  --pill-bg-1-hover: rgba(255, 255, 255, 0.08);
  --pill-bg-2-hover: rgba(255, 255, 255, 0.02);
  --pill-border-hover: rgba(255, 255, 255, 0.2);
  --pill-shadow-hover: rgba(0, 0, 0, 0.7);
  --pill-highlight-hover: rgba(255, 255, 255, 0.2);
}

html.light .cinematic-footer-wrapper {
  --bg-color: #ffffff;
  --fg-color: #000000;
  --primary-color: #000000;
  --secondary-color: #333333;
  
  --pill-bg-1: rgba(0, 0, 0, 0.03);
  --pill-bg-2: rgba(0, 0, 0, 0.01);
  --pill-shadow: rgba(0, 0, 0, 0.03);
  --pill-highlight: rgba(0, 0, 0, 0.05);
  --pill-inset-shadow: rgba(255, 255, 255, 0.8);
  --pill-border: rgba(0, 0, 0, 0.08);
  
  --pill-bg-1-hover: rgba(0, 0, 0, 0.08);
  --pill-bg-2-hover: rgba(0, 0, 0, 0.02);
  --pill-border-hover: rgba(0, 0, 0, 0.20);
  --pill-shadow-hover: rgba(0, 0, 0, 0.08);
  --pill-highlight-hover: rgba(0, 0, 0, 0.1);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.3)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.6)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(120, 120, 120, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(120, 120, 120, 0.05) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    rgba(139, 92, 246, 0.12) 0%, 
    rgba(6, 182, 212, 0.12) 40%, 
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--fg-color);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
}

.footer-giant-bg-text {
  font-size: 20vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(120, 120, 120, 0.08);
  background: linear-gradient(180deg, rgba(120, 120, 120, 0.15) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, var(--fg-color) 0%, rgba(120, 120, 120, 0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
`;

const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Gamified Careers</span> <span className="text-violet-500">✦</span>
    <span>DSA Sheets Tracking</span> <span className="text-cyan-400">✦</span>
    <span>AI Resume Audit</span> <span className="text-violet-500">✦</span>
    <span>Mock Interview Sandbox</span> <span className="text-cyan-400">✦</span>
    <span>WebSocket Squads</span> <span className="text-violet-500">✦</span>
    <span>Absolute Privacy</span> <span className="text-cyan-400">✦</span>
  </div>
);

const CinematicFooter = ({ navigate, isDark }) => {
  const wrapperRef = useRef(null);
  const giantTextRef = useRef(null);
  const headingRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Background giant text parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "8vh", scale: 0.85, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 85%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered reveal animations
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 50%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FOOTER_STYLES }} />

      {/* Curtain reveal viewport box */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* Underlay fixed footer */}
        <footer className={cn(
          "fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden transition-colors duration-500 cinematic-footer-wrapper",
          isDark ? "bg-[#020617] text-white" : "bg-white text-black"
        )}>

          {/* Ambient Aurora glow */}
          {isDark && (
            <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          )}
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[2vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none uppercase font-mono tracking-widest font-black"
          >
            STUDYQUEST
          </div>

          {/* 1. Diagonal Sleek Marquee */}
          <div className={cn(
            "absolute top-16 left-0 w-full overflow-hidden border-y bg-opacity-65 backdrop-blur-md py-4.5 z-10 -rotate-2 scale-110 shadow-2xl transition-colors duration-500",
            isDark ? "border-white/5 bg-[#020617]" : "border-zinc-200 bg-white"
          )}>
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.25em] text-zinc-500 uppercase">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-5xl md:text-7xl font-black footer-text-glow tracking-tighter mb-10 text-center"
            >
              Ready to begin?
            </h2>

            {/* Interactive Magnetic Pills */}
            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton
                  onClick={() => navigate('/register')}
                  className="footer-glass-pill px-8 py-4.5 rounded-full font-bold text-sm md:text-base flex items-center gap-2.5 group"
                >
                  <Sparkles size={18} className="text-violet-500 group-hover:animate-pulse" />
                  Seed Profile
                </MagneticButton>

                <MagneticButton
                  onClick={() => navigate('/login')}
                  className="footer-glass-pill px-8 py-4.5 rounded-full font-bold text-sm md:text-base flex items-center gap-2.5 group"
                >
                  <Play size={14} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                  Initialize OS
                </MagneticButton>
              </div>

              {/* Secondary links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
                <MagneticButton onClick={() => navigate('/login')} className="footer-glass-pill px-5 py-2.5 rounded-full text-zinc-500 font-medium text-xs hover:text-current">
                  Privacy Policy
                </MagneticButton>
                <MagneticButton onClick={() => navigate('/login')} className="footer-glass-pill px-5 py-2.5 rounded-full text-zinc-500 font-medium text-xs hover:text-current">
                  Terms of Service
                </MagneticButton>
                <MagneticButton onClick={() => navigate('/login')} className="footer-glass-pill px-5 py-2.5 rounded-full text-zinc-500 font-medium text-xs hover:text-current">
                  Support OS
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar / Credits */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Copyright */}
            <div className="text-zinc-500 text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1 font-mono">
              © 2026 StudyQuest. All rights reserved.
            </div>

            {/* "Made with Love" Badge */}
            <div className="footer-glass-pill px-6 py-2.5 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-border/50">
              <span className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-widest font-mono">Crafted</span>

              <span className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-widest font-mono">by</span>
              <span className="font-black text-xs md:text-sm tracking-normal font-sans ml-1 text-cyan-400">StudyQuest Team</span>
            </div>

            {/* Back to top */}
            <MagneticButton
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-zinc-500 hover:text-current group order-3"
            >
              <svg className="w-4.5 h-4.5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </MagneticButton>

          </div>
        </footer>
      </div>
    </>
  );
};

// ==================== Main Hero Component ====================
export default function Hero() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [titleNumber, setTitleNumber] = useState(0);
  const aiTitles = ["intelligent", "gamified", "adaptive", "collaborative", "comprehensive"];

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleNumber((prev) => (prev + 1) % aiTitles.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const theme = "dark";
  const isDark = true;

  const toggleTheme = () => { };

  const runCode = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setCount((prev) => prev + 1);
      setIsCompiling(false);
    }, 500);
  };

  return (
    <div className={cn(
      "min-h-screen w-full font-sans relative overflow-hidden transition-colors duration-500",
      isDark ? "bg-[#000000] text-white" : "bg-white text-black"
    )}>
      {/* WebGL Aurora Shader Background (Active in Dark Mode only) */}
      <AuroraBackground isDark={isDark} />


      {/* Dark Radial Glow Background (only in dark mode) */}
      {isDark && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(255, 255, 255, 0.03), transparent)`,
          }}
        />
      )}

      {/* Light Mode Grid (only in light mode) */}
      {!isDark && (
        <div className="absolute inset-0 z-0 pointer-events-none bg-grid-black/[0.03] bg-[size:20px_20px]" />
      )}

      {/* Clean Header */}
      <header className={cn(
        "relative z-10 max-w-7xl mx-auto px-8 py-6 flex items-center justify-between border-b transition-colors",
        isDark ? "border-white/10" : "border-zinc-200"
      )}>
        <div className="flex items-center gap-3">
          <img src={logo} alt="StudyQuest Logo" className="w-10 h-10 object-contain rounded-lg" />
          <span className="text-lg font-black tracking-wider font-mono">
            STUDYQUEST
          </span>
        </div>

        <div className="flex items-center gap-6">


          <button
            onClick={() => navigate('/login')}
            className={cn(
              "text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer",
              isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-black"
            )}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className={cn(
              "text-xs font-mono font-bold px-4 py-2 transition-colors cursor-pointer border",
              isDark
                ? "bg-white border-white hover:bg-zinc-200 text-black"
                : "bg-black border-black hover:bg-zinc-800 text-white"
            )}
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-8 pt-24 pb-20 flex flex-col items-center text-center space-y-10">

        {/* Centered info */}
        <div className="space-y-8 flex flex-col items-center w-full">

          <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full text-xs transition-all duration-300 group cursor-pointer border border-white/5">
            <span className="text-zinc-400">Support for AI Models</span>
            <ArrowRight size={12} className="text-zinc-500 transform group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none max-w-3xl pt-4 flex flex-col items-center text-center w-full">
            <span className="text-white">This is Career Prep</span>
            <span className="relative flex w-full h-[1.3em] justify-center overflow-hidden pt-2">
              &nbsp;
              {aiTitles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute font-black tracking-widest text-cyan-400 text-glow-cyan uppercase"
                  initial={{ opacity: 0, y: -50 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  animate={
                    titleNumber === index
                      ? { y: 0, opacity: 1 }
                      : { y: titleNumber > index ? -100 : 100, opacity: 0 }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </span>
          </h1>

          <p className="leading-relaxed text-sm sm:text-base max-w-xl text-zinc-400">
            A minimalist workspace for tracking data structures, auditing resume formats, practicing mock interviews, and syncing levels. Complete daily quests, earn XP, and level up your software engineering credentials.
          </p>

          <div className="flex flex-row gap-4 flex-wrap justify-center pt-2">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 font-bold px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-[0.98] text-sm"
            >
              Get Started <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-white/5 font-semibold px-8 py-3.5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all cursor-pointer text-sm"
            >
              Sign In
            </button>
          </div>
        </div>

      </main>

      {/* Grid features */}
      <section className={cn(
        "relative z-10 max-w-7xl mx-auto px-8 py-16 border-t transition-colors",
        isDark ? "border-zinc-800" : "border-zinc-200"
      )}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Module 1 */}
          <div className={cn(
            "border p-6 space-y-3 transition-colors rounded-2xl backdrop-blur-sm",
            isDark ? "border-zinc-800 bg-[#09090b]/40" : "border-zinc-200 bg-zinc-50/50"
          )}>
            <div className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg",
              isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border border-cyan-100"
            )}>
              <Target size={16} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wide">Company Prep</h3>
            <p className={cn("text-xs leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-600")}>Tailored arrays filtered by big tech pipeline standards.</p>
          </div>

          {/* Module 2 */}
          <div className={cn(
            "border p-6 space-y-3 transition-colors rounded-2xl backdrop-blur-sm",
            isDark ? "border-zinc-800 bg-[#09090b]/40" : "border-zinc-200 bg-zinc-50/50"
          )}>
            <div className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg",
              isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border border-cyan-100"
            )}>
              <BookOpen size={16} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wide">DSA Sheets</h3>
            <p className={cn("text-xs leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-600")}>Track data structure progress with clean local states.</p>
          </div>

          {/* Module 3 */}
          <div className={cn(
            "border p-6 space-y-3 transition-colors rounded-2xl backdrop-blur-sm",
            isDark ? "border-zinc-800 bg-[#09090b]/40" : "border-zinc-200 bg-zinc-50/50"
          )}>
            <div className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg",
              isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border border-cyan-100"
            )}>
              <Terminal size={16} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wide">AI Resume Auditor</h3>
            <p className={cn("text-xs leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-600")}>Audit formatting metrics and LaTeX structures instantly.</p>
          </div>

          {/* Module 4 */}
          <div className={cn(
            "border p-6 space-y-3 transition-colors rounded-2xl backdrop-blur-sm",
            isDark ? "border-zinc-800 bg-[#09090b]/40" : "border-zinc-200 bg-zinc-50/50"
          )}>
            <div className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg",
              isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border border-cyan-100"
            )}>
              <Users size={16} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wide">Squad Chat</h3>
            <p className={cn("text-xs leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-600")}>Sync levels, activity streams, and live rooms via WebSockets.</p>
          </div>
        </div>
      </section>

      {/* Centered interactive terminal widget moved down */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-20 flex flex-col items-center select-text">
        <div className="w-full max-w-xl text-left">
          <div className={cn(
            "border rounded-lg overflow-hidden backdrop-blur-sm transition-colors duration-500",
            isDark ? "border-zinc-800 bg-black/90" : "border-zinc-200 bg-zinc-50/90"
          )}>
            {/* Terminal Header */}
            <div className={cn(
              "px-4 py-2 flex items-center justify-between border-b transition-colors",
              isDark ? "bg-white/5 text-white border-white/10" : "bg-zinc-100 text-black border-zinc-200"
            )}>
              <span className="font-mono text-xs font-bold">interactive_terminal.js</span>
              <span className={cn(
                "text-[10px] font-mono px-2 py-0.5 border rounded transition-colors",
                isDark ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border-cyan-100"
              )}>
                ACTIVE
              </span>
            </div>

            {/* Terminal Body */}
            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="space-y-1 text-zinc-500">
                <p>// Run compile to increment code execution state</p>
                <p>const studyQuest = require("studyquest-core");</p>
                <p>const sandbox = studyQuest.createSandbox();</p>
              </div>

              {/* Status Output */}
              <div className={cn(
                "border p-4 transition-colors rounded-xl",
                isDark ? "border-white/5 bg-white/[0.01]" : "border-zinc-200 bg-zinc-100/50"
              )}>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Execution Feed</p>
                <div className="flex items-center justify-between">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-700"}>Successful executions:</span>
                  <span className={cn(
                    "font-bold text-xs transition-colors font-mono text-cyan-400"
                  )}>
                    {count}
                  </span>
                </div>
              </div>

              {/* Action trigger */}
              <div className={cn(
                "flex items-center justify-between pt-2 border-t transition-colors",
                isDark ? "border-white/10" : "border-zinc-200"
              )}>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">
                  {isCompiling ? "Compiling source..." : "Status: Ready"}
                </span>

                <button
                  onClick={runCode}
                  disabled={isCompiling}
                  className={cn(
                    "flex items-center gap-2 font-bold text-xs px-4 py-2 border transition-all cursor-pointer disabled:opacity-50 rounded-lg",
                    isDark
                      ? "bg-cyan-600 border-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                      : "bg-cyan-600 border-cyan-600 hover:bg-cyan-700 text-white active:scale-[0.98]"
                  )}
                >
                  <Play size={12} fill="white" className="text-white" /> RUN COMPILE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-24 border-t border-zinc-850 transition-colors bg-black">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            CORE PLATFORM MODULES
          </h2>
          <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
            Deep-dive into the high-performance engineering workspace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="border border-zinc-800 bg-[#09090b] p-8 space-y-6 rounded-xl hover:border-zinc-700 transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MODULE 01</span>
              <h3 className="text-xl font-bold tracking-wide uppercase text-white">Coding Sandbox</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Solve algorithmic challenges inside a high-fidelity editor. Powered by Monaco, featuring automated starter code generation, language selection (JS, Python, C++, Java), active timer, and live output draw feeds.
            </p>
            <ul className="space-y-1.5 text-[11px] text-zinc-500 font-mono">
              <li>• Real-time syntax checking & compilation</li>
              <li>• Custom input execution pipeline</li>
              <li>• Embedded problem descriptions, editorial & hints</li>
            </ul>
            <div className="flex gap-2 pt-2">
              <span className="bg-zinc-900 text-zinc-400 font-mono text-[9px] px-2.5 py-1 border border-zinc-800 rounded-md uppercase">Monaco Editor</span>
              <span className="bg-zinc-900 text-zinc-400 font-mono text-[9px] px-2.5 py-1 border border-zinc-800 rounded-md uppercase">Multi-Language</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="border border-zinc-800 bg-[#09090b] p-8 space-y-6 rounded-xl hover:border-zinc-700 transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MODULE 02</span>
              <h3 className="text-xl font-bold tracking-wide uppercase text-white">AI Resume Auditor</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instantly scan and audit your software engineering resume. Our parser reviews formatting integrity, sections completeness, density metrics, and offers copy-pasteable LaTeX patches to beat ATS filters.
            </p>
            <ul className="space-y-1.5 text-[11px] text-zinc-500 font-mono">
              <li>• Exact PDF content extraction & structure audit</li>
              <li>• Quantitative scoring across 10 formatting rules</li>
              <li>• Immediate copy-pasteable LaTeX overrides</li>
            </ul>
            <div className="flex gap-2 pt-2">
              <span className="bg-zinc-900 text-zinc-400 font-mono text-[9px] px-2.5 py-1 border border-zinc-800 rounded-md uppercase">PDF Parsing</span>
              <span className="bg-zinc-900 text-zinc-400 font-mono text-[9px] px-2.5 py-1 border border-zinc-800 rounded-md uppercase">ATS Verification</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="border border-zinc-800 bg-[#09090b] p-8 space-y-6 rounded-xl hover:border-zinc-700 transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MODULE 03</span>
              <h3 className="text-xl font-bold tracking-wide uppercase text-white">Sequential Career Paths</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Explore 60 learning roadmaps powered by roadmap.sh data. Pre-seeded with conceptual multiple-choice quizzes for every node and hand-on capstone projects to verify actual coding application.
            </p>
            <ul className="space-y-1.5 text-[11px] text-zinc-500 font-mono">
              <li>• 60 predefined career & language roadmaps</li>
              <li>• Interactive quizzes with dynamic validation</li>
              <li>• Hands-on capstone verifier with XP awarding</li>
            </ul>
            <div className="flex gap-2 pt-2">
              <span className="bg-zinc-900 text-zinc-400 font-mono text-[9px] px-2.5 py-1 border border-zinc-800 rounded-md uppercase">60 Tracks</span>
              <span className="bg-zinc-900 text-zinc-400 font-mono text-[9px] px-2.5 py-1 border border-zinc-800 rounded-md uppercase">Quiz + Capstone</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="border border-zinc-800 bg-[#09090b] p-8 space-y-6 rounded-xl hover:border-zinc-700 transition-all">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MODULE 04</span>
              <h3 className="text-xl font-bold tracking-wide uppercase text-white">Socket Communities</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Learn in a multiplayer workspace. Track peer levels on the global leaderboard, chat in real-time rooms driven by Socket.io, and discover active hackathons aggregated live across top competition networks.
            </p>
            <ul className="space-y-1.5 text-[11px] text-zinc-500 font-mono">
              <li>• Live workspace peer feed & streaking</li>
              <li>• Threaded room channels using WebSockets</li>
              <li>• Automated Unstop, Devpost & Devfolio scraping</li>
            </ul>
            <div className="flex gap-2 pt-2">
              <span className="bg-zinc-900 text-zinc-400 font-mono text-[9px] px-2.5 py-1 border border-zinc-800 rounded-md uppercase">WebSockets</span>
              <span className="bg-zinc-900 text-zinc-400 font-mono text-[9px] px-2.5 py-1 border border-zinc-800 rounded-md uppercase">Scraped Aggregator</span>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-24 border-t border-zinc-850 transition-colors bg-black">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            MEMBERSHIP TIERS
          </h2>
          <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
            Choose the plan that fits your career acceleration scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tier 1 */}
          <div className="border border-zinc-800 bg-[#09090b] p-8 space-y-6 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              <h3 className="text-md font-bold tracking-wider font-mono text-zinc-400 uppercase">FREE SANDBOX</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">₹99</span>
                <span className="text-xs text-zinc-500 font-mono">/ MONTH</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Start tracking algorithms, complete baseline DSA sheets, and explore default roadmaps.
              </p>
              <ul className="space-y-2 text-xs text-zinc-500 pt-4 border-t border-zinc-800 font-mono">
                <li>✓ 905 DSA Practice Problems</li>
                <li>✓ Basic Code Execution</li>
                <li>✓ Community Chat Rooms</li>
                <li>✓ Standard Roadmap Paths</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="w-full mt-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
            >
              INITIALIZE ACCOUNT
            </button>
          </div>

          {/* Tier 2 */}
          <div className="border border-zinc-700 bg-zinc-950 p-8 space-y-6 rounded-xl relative flex flex-col justify-between hover:border-zinc-650 transition-all shadow-lg">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-white text-black font-mono text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              RECOMMENDED
            </div>
            <div className="space-y-4">
              <h3 className="text-md font-bold tracking-wider font-mono text-zinc-200 uppercase">PRO DEVELOPER</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">₹399</span>
                <span className="text-xs text-zinc-500 font-mono">/ MONTH</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Full-stack tool suite for aggressive technical interview preparation and profile validation.
              </p>
              <ul className="space-y-2 text-xs text-zinc-400 pt-4 border-t border-zinc-800 font-mono">
                <li>✓ Everything in Free Sandbox</li>
                <li>✓ AI-Powered Resume Auditor</li>
                <li>✓ AI-Assisted Mock Interviews</li>
                <li>✓ Custom Input Sandbox Testing</li>
                <li>✓ Priority Hackathon Pipeline</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="w-full mt-6 py-2.5 bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer text-center shadow-md"
            >
              UPGRADE TO PRO
            </button>
          </div>

          {/* Tier 3 */}
          <div className="border border-zinc-800 bg-[#09090b] p-8 space-y-6 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              <h3 className="text-md font-bold tracking-wider font-mono text-zinc-400 uppercase">TEAM STACK</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">₹699</span>
                <span className="text-xs text-zinc-500 font-mono">/ MONTH</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Shared workspace features designed for bootcamp cohorts, hacker groups, and university squads.
              </p>
              <ul className="space-y-2 text-xs text-zinc-500 pt-4 border-t border-zinc-800 font-mono">
                <li>✓ Everything in Pro Developer</li>
                <li>✓ Dedicated Shared Squad Rooms</li>
                <li>✓ Batch Performance Analytics</li>
                <li>✓ Custom Interview Pipelines</li>
                <li>✓ Priority Live Support</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="w-full mt-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
            >
              CREATE TEAM SQUAD
            </button>
          </div>
        </div>
      </section>

      {/* Cinematic Curtain Reveal Footer */}
      <CinematicFooter navigate={navigate} isDark={isDark} />
    </div>
  );
}

