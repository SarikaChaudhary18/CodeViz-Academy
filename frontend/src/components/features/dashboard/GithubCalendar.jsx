import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { api } from '../../../lib/api';

export default function GithubCalendar({ username = 'Jahirul077' }) {
  const [gameMode, setGameMode] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('studyquest_calendar_highscore') || '0', 10);
  });
  const [isMuted, setIsMuted] = useState(false);
  
  // Grid layout config
  const cellSize = 18;
  const cellGap = 4;
  const cols = 9;
  const rows = 7;
  
  // Total dimensions of the calendar grid
  const gridWidth = cols * (cellSize + cellGap) - cellGap;
  const gridHeight = rows * (cellSize + cellGap) - cellGap;
  
  // Canvas settings
  const canvasWidth = gameMode ? Math.max(320, gridWidth) : gridWidth;
  const canvasHeight = 190; // extra height at the bottom for spaceship arena
  
  const canvasRef = useRef(null);
  const [calendarData, setCalendarData] = useState([]);
  
  // Track game state via refs to avoid React re-render lag in the animation loop
  const gameStateRef = useRef({
    bullets: [],
    particles: [],
    enemies: [], // contribution blocks as target entities
    ufo: null,
    shipX: canvasWidth / 2,
    keys: {},
    lives: 3,
    gameOver: false,
    victory: false,
    score: 0,
    enemyBullets: [],
    lastShotTime: 0,
    lastUfoTime: 0,
    isFiring: false
  });

  // Fetch real-time DSA Sheet progress and populate grid
  useEffect(() => {
    const fetchRealProgress = async () => {
      try {
        const res = await api.get('/sheets/progress');
        const solvedMap = {};
        
        // Handle both standard responses and array payload formats
        const list = Array.isArray(res) ? res : (res.data || []);
        list.forEach(item => {
          if (item.solvedAt && item.status === 'completed') {
            const dateStr = item.solvedAt.split('T')[0];
            solvedMap[dateStr] = (solvedMap[dateStr] || 0) + 1;
          }
        });

        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (cols * rows - 1));

        for (let i = 0; i < cols * rows; i++) {
          const cellDate = new Date(startDate);
          cellDate.setDate(startDate.getDate() + i);
          const dateStr = cellDate.toISOString().split('T')[0];
          
          const solvedCount = solvedMap[dateStr] || 0;
          const level = Math.min(4, solvedCount);

          data.push({
            id: i,
            level: level,
            originalLevel: level,
            row: i % rows,
            col: Math.floor(i / rows),
            date: dateStr
          });
        }
        setCalendarData(data);
      } catch (err) {
        console.error('Failed to load real consistency calendar progress:', err);
        // Fallback: load baseline empty data
        const data = [];
        for (let i = 0; i < cols * rows; i++) {
          data.push({
            id: i,
            level: 0,
            originalLevel: 0,
            row: i % rows,
            col: Math.floor(i / rows)
          });
        }
        setCalendarData(data);
      }
    };

    fetchRealProgress();
  }, []);

  // Sync state score back to React for display
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('studyquest_calendar_highscore', score.toString());
    }
  }, [score, highScore]);

  // Generate month labels positioned dynamically above columns
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    
    // Start from cols * rows - 1 days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (cols * rows - 1));
    
    let lastMonth = -1;
    for (let col = 0; col < cols; col++) {
      const colDate = new Date(startDate);
      colDate.setDate(startDate.getDate() + col * 7);
      const month = colDate.getMonth();
      if (month !== lastMonth) {
        labels.push({ text: months[month], colIdx: col });
        lastMonth = month;
      }
    }
    
    // Filter to prevent overlap (minimum spacing of 2 columns)
    const filtered = [];
    let lastCol = -10;
    for (const label of labels) {
      if (label.colIdx - lastCol >= 2) {
        filtered.push(label);
        lastCol = label.colIdx;
      }
    }
    return filtered;
  };

  const monthLabels = getMonthLabels();

  // Web Audio Synth
  const playSynthSound = (type) => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (type === 'laser') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(850, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.08);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'explosion') {
        // Low rumble explosion
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.3);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'ufo') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(780, ctx.currentTime + 0.2);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'hurt') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.4);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'victory') {
        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
          const noteOsc = noteOsc || ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
          noteOsc.connect(noteGain);
          noteGain.connect(masterGain);
          noteGain.gain.setValueAtTime(0.2, now + idx * 0.1);
          noteGain.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.2);
          noteOsc.start(now + idx * 0.1);
          noteOsc.stop(now + idx * 0.1 + 0.2);
        });
      }
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameMode) return;
      const state = gameStateRef.current;
      state.keys[e.code] = true;
      
      // Prevent browser scroll on space or arrows
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyR' && (state.gameOver || state.victory)) {
        restartGame();
      }
    };

    const handleKeyUp = (e) => {
      if (!gameMode) return;
      gameStateRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameMode, calendarData]);

  // Restart Game utility
  const restartGame = () => {
    const state = gameStateRef.current;
    state.bullets = [];
    state.particles = [];
    state.enemyBullets = [];
    state.ufo = null;
    state.shipX = canvasWidth / 2;
    state.lives = 3;
    state.gameOver = false;
    state.victory = false;
    state.score = 0;
    setScore(0);
    
    // Reset enemy targets from baseline calendar levels
    const xOffset = (canvasWidth - gridWidth) / 2;
    state.enemies = calendarData
      .filter(item => item.level > 0)
      .map(item => ({
        id: item.id,
        x: item.col * (cellSize + cellGap) + xOffset,
        y: item.row * (cellSize + cellGap) + 20, // push down a bit from top
        width: cellSize,
        height: cellSize,
        level: item.level,
        health: item.level,
        originalHealth: item.level
      }));
  };

  // Game Loop
  useEffect(() => {
    if (!gameMode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Initialize targets
    restartGame();
    
    let animationId;
    const state = gameStateRef.current;

    const gameLoop = (timestamp) => {
      // 1. CLEAR CANVAS
      ctx.fillStyle = '#090d16'; // Deep space dark background
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw grid blueprint borders subtly
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.03)';
      ctx.lineWidth = 1;
      const xOffset = (canvasWidth - gridWidth) / 2;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          ctx.strokeRect(c * (cellSize + cellGap) + xOffset, r * (cellSize + cellGap) + 20, cellSize, cellSize);
        }
      }

      if (state.gameOver) {
        ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px "JetBrains Mono", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SYSTEM COMPROMISED - GAME OVER', canvasWidth / 2, canvasHeight / 2 - 10);
        
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '10px "JetBrains Mono", Courier, monospace';
        ctx.fillText('PRESS R TO REBOOT AND TRY AGAIN', canvasWidth / 2, canvasHeight / 2 + 15);
        
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      if (state.victory) {
        ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px "JetBrains Mono", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ALL COMMIT SEGMENTS STABILIZED!', canvasWidth / 2, canvasHeight / 2 - 10);
        
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '10px "JetBrains Mono", Courier, monospace';
        ctx.fillText('PRESS R TO RETRIGGER CONFLICT SEQUENCE', canvasWidth / 2, canvasHeight / 2 + 15);
        
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      // 2. INPUT PROCESSING
      // Keyboard Movement
      const shipSpeed = 4.5;
      if (state.keys['ArrowLeft'] || state.keys['KeyA']) {
        state.shipX = Math.max(9, state.shipX - shipSpeed);
      }
      if (state.keys['ArrowRight'] || state.keys['KeyD']) {
        state.shipX = Math.min(canvasWidth - 9, state.shipX + shipSpeed);
      }

      // Auto-firing or keyboard Space firing
      const now = Date.now();
      if ((state.keys['Space'] || state.isFiring) && now - state.lastShotTime > 180) {
        state.bullets.push({
          x: state.shipX,
          y: canvasHeight - 20,
          vy: -6.5,
          active: true
        });
        state.lastShotTime = now;
        playSynthSound('laser');
      }

      // 3. SPAWN ENTITIES
      // Random UFO (0.15% chance per frame, minimum 6s intervals)
      if (!state.ufo && now - state.lastUfoTime > 6000 && Math.random() < 0.0015) {
        state.ufo = {
          x: -30,
          y: 6,
          width: 24,
          height: 9,
          vx: 1.8,
          active: true
        };
        state.lastUfoTime = now;
        playSynthSound('ufo');
      }

      // Random target block firing back (0.25% chance per frame if targets active)
      if (state.enemies.length > 0 && Math.random() < 0.0025) {
        const shootingEnemy = state.enemies[Math.floor(Math.random() * state.enemies.length)];
        // Only level 3 and 4 blocks fire back
        if (shootingEnemy.level >= 3) {
          state.enemyBullets.push({
            x: shootingEnemy.x + cellSize / 2,
            y: shootingEnemy.y + cellSize,
            vy: 2.2,
            active: true
          });
        }
      }

      // 4. PHYSICS & COLLISIONS UPDATE
      // Update UFO
      if (state.ufo) {
        state.ufo.x += state.ufo.vx;
        if (state.ufo.x > canvasWidth + 30) {
          state.ufo = null;
        }
      }

      // Update player bullets
      state.bullets.forEach(b => {
        b.y += b.vy;
        if (b.y < 0) b.active = false;
      });
      state.bullets = state.bullets.filter(b => b.active);

      // Update enemy bullets
      state.enemyBullets.forEach(b => {
        b.y += b.vy;
        if (b.y > canvasHeight) b.active = false;
        
        // Collision with player ship
        const shipY = canvasHeight - 16;
        if (
          b.active &&
          b.y >= shipY && b.y <= shipY + 12 &&
          b.x >= state.shipX - 9 && b.x <= state.shipX + 9
        ) {
          b.active = false;
          state.lives -= 1;
          playSynthSound('hurt');
          if (state.lives <= 0) {
            state.gameOver = true;
          }
        }
      });
      state.enemyBullets = state.enemyBullets.filter(b => b.active);

      // Update particles
      state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // slight gravity
        p.life -= p.decay;
      });
      state.particles = state.particles.filter(p => p.life > 0);

      // Collision: Player Bullet vs target blocks
      state.bullets.forEach(b => {
        if (!b.active) return;

        // Check UFO collision first
        if (
          state.ufo &&
          b.x >= state.ufo.x && b.x <= state.ufo.x + state.ufo.width &&
          b.y >= state.ufo.y && b.y <= state.ufo.y + state.ufo.height
        ) {
          b.active = false;
          state.ufo = null;
          state.score += 100;
          setScore(state.score);
          playSynthSound('explosion');
          // Spawn sparks
          for (let i = 0; i < 15; i++) {
            state.particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5 - 1,
              life: 1.0,
              decay: 0.02 + Math.random() * 0.02,
              size: 2 + Math.random() * 2,
              color: '#ef4444' // UFO sparks are red
            });
          }
          return;
        }

        // Check enemy blocks
        for (let i = 0; i < state.enemies.length; i++) {
          const e = state.enemies[i];
          if (
            b.x >= e.x && b.x <= e.x + e.width &&
            b.y >= e.y && b.y <= e.y + e.height
          ) {
            b.active = false;
            e.health -= 1;
            
            // Hit feedback sparks
            const colors = ['#000', '#083344', '#155e75', '#0e7490', '#00ffff'];
            const sparkColor = colors[e.health + 1] || '#00ffff';
            for (let k = 0; k < 6; k++) {
              state.particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3 - 0.5,
                life: 1.0,
                decay: 0.04 + Math.random() * 0.04,
                size: 1.5 + Math.random() * 1.5,
                color: sparkColor
              });
            }

            if (e.health <= 0) {
              state.score += e.level * 15;
              setScore(state.score);
              playSynthSound('explosion');
              
              // Big block explosion
              for (let k = 0; k < 12; k++) {
                state.particles.push({
                  x: e.x + cellSize / 2,
                  y: e.y + cellSize / 2,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4 - 1.5,
                  life: 1.0,
                  decay: 0.03 + Math.random() * 0.02,
                  size: 2 + Math.random() * 2,
                  color: '#00ffff'
                });
              }
              // Remove block
              state.enemies.splice(i, 1);
              
              // Victory check
              if (state.enemies.length === 0) {
                state.victory = true;
                playSynthSound('victory');
              }
            } else {
              playSynthSound('hit');
            }
            break;
          }
        }
      });

      // 5. DRAW ENTITIES
      // Draw target blocks
      state.enemies.forEach(e => {
        // Cyan theme colors based on remaining block health (1-4)
        const blockColors = [
          '#161b22', // 0 (empty)
          'rgba(6, 182, 212, 0.25)', // health 1
          'rgba(6, 182, 212, 0.45)', // health 2
          'rgba(6, 182, 212, 0.7)',  // health 3
          '#00ffff'                 // health 4 (active)
        ];
        
        ctx.fillStyle = blockColors[e.health] || '#00ffff';
        ctx.fillRect(e.x, e.y, e.width, e.height);
        
        // Add subtle overlay glow to high-health blocks
        if (e.health === 4) {
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 4;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(e.x + 2, e.y + 2, e.width - 4, e.height - 4);
          ctx.shadowBlur = 0; // reset
        }
      });

      // Draw UFO
      if (state.ufo) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(state.ufo.x + 3, state.ufo.y + 3, 18, 5);
        ctx.fillStyle = '#f87171';
        ctx.fillRect(state.ufo.x + 6, state.ufo.y, 12, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(state.ufo.x + 9, state.ufo.y + 4, 6, 2); // lights
      }

      // Draw Player Bullets
      ctx.fillStyle = '#00ffff';
      state.bullets.forEach(b => {
        ctx.fillRect(b.x - 1, b.y, 2, 6);
        // Bullet glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(b.x - 1, b.y + 1, 2, 3);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00ffff';
      });

      // Draw Enemy Bullets
      ctx.fillStyle = '#f87171';
      state.enemyBullets.forEach(b => {
        ctx.fillRect(b.x - 1.5, b.y, 3, 5);
      });

      // Draw Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1.0; // reset

      // Draw Player Spaceship
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#4ade80'; // Retro arcade green ship
      
      const shipY = canvasHeight - 16;
      ctx.beginPath();
      ctx.moveTo(state.shipX, shipY);
      ctx.lineTo(state.shipX - 8, shipY + 12);
      ctx.lineTo(state.shipX - 3, shipY + 9);
      ctx.lineTo(state.shipX + 3, shipY + 9);
      ctx.lineTo(state.shipX + 8, shipY + 12);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#ffffff'; // ship center details
      ctx.fillRect(state.shipX - 1.5, shipY + 4, 3, 4);
      ctx.shadowBlur = 0; // reset

      // Draw Lives indicators
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '9px "JetBrains Mono", Courier, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SHIPS:', 12, canvasHeight - 10);
      
      for (let i = 0; i < state.lives; i++) {
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        const iconX = 54 + i * 12;
        const iconY = canvasHeight - 16;
        ctx.moveTo(iconX, iconY);
        ctx.lineTo(iconX - 4, iconY + 7);
        ctx.lineTo(iconX + 4, iconY + 7);
        ctx.closePath();
        ctx.fill();
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameMode, calendarData, isMuted]);

  // Touch and Mouse controllers for Canvas
  const handleCanvasMouseMove = (e) => {
    if (!gameMode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    gameStateRef.current.shipX = Math.max(9, Math.min(canvasWidth - 9, x));
  };

  const handleCanvasMouseDown = (e) => {
    if (!gameMode) return;
    gameStateRef.current.isFiring = true;
  };

  const handleCanvasMouseUp = () => {
    gameStateRef.current.isFiring = false;
  };

  const handleCanvasTouchMove = (e) => {
    if (!gameMode || !canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const x = (e.touches[0].clientX - rect.left) * scaleX;
    gameStateRef.current.shipX = Math.max(9, Math.min(canvasWidth - 9, x));
  };

  return (
    <div className="glassmorphism rounded-3xl p-8 border-white/10 relative overflow-hidden">
      {/* Header metadata layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-wide uppercase">
              {gameMode ? 'SPACE INVADERS STABILIZATION PROTOCOL' : 'CONSISTENCY GRID'}
            </h3>
            <span className="text-[9px] px-2 py-0.5 bg-cyan-950 border border-cyan-500/20 text-cyan-400 font-mono rounded tracking-widest uppercase">
              {gameMode ? 'GAME MODE ACTIVE' : '2 MONTHS RECORD'}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 font-mono mt-1">
            {gameMode 
              ? 'USE MOUSE / ARROWS TO POSITION SHIP. CLICK OR SPACEBAR TO DISCHARGE LASERS.'
              : 'GITHUB-STYLE FREQUENCY OF ACTIVE DEVELOPMENT SEGMENTS.'
            }
          </p>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto font-mono text-[10px] text-cyan-400">
          <div>SCORE: <span className="text-white font-bold">{score}</span></div>
          <div>RECORD: <span className="text-white font-bold">{highScore}</span></div>
          
          <button 
            onClick={() => setIsMuted(prev => !prev)}
            className="p-1.5 bg-white/[0.02] border border-white/5 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
        </div>
      </div>

      {/* Main Grid or Canvas component */}
      <div className="flex flex-col bg-white/[0.01] border border-white/5 p-4 rounded-2xl overflow-x-auto select-none">
        
        {!gameMode ? (
          <div className="flex flex-col gap-2 w-full">
            
            {/* Months Header Line */}
            <div className="relative h-4 font-mono text-[9px] text-gray-500">
              {monthLabels.map((lbl, idx) => (
                <span 
                  key={idx}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${lbl.colIdx * (cellSize + cellGap) + cellSize / 2 + 35}px` }}
                >
                  {lbl.text}
                </span>
              ))}
            </div>

            {/* Left labels column + grid container */}
            <div className="flex gap-2">
              
              {/* Day Labels Column */}
              <div className="grid font-mono text-[9px] text-gray-500 w-8 pr-1 pt-1" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, height: `${gridHeight}px` }}>
                <span className="flex items-center">Sun</span>
                <span className="flex items-center"></span>
                <span className="flex items-center">Tue</span>
                <span className="flex items-center"></span>
                <span className="flex items-center">Thu</span>
                <span className="flex items-center"></span>
                <span className="flex items-center">Sat</span>
              </div>

              {/* Heatmap cells */}
              <div 
                className="grid grid-flow-col gap-[3px]"
                style={{ 
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                  width: `${gridWidth}px`,
                  height: `${gridHeight}px`
                }}
              >
                {calendarData.map((item) => {
                  const colors = [
                    'bg-white/5 hover:bg-white/10 border border-white/[0.02]',
                    'bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/10',
                    'bg-cyan-800/40 hover:bg-cyan-700/40 border border-cyan-500/20',
                    'bg-cyan-600/60 hover:bg-cyan-500/60 border border-cyan-400/20',
                    'bg-cyan-400 hover:bg-cyan-300 border border-cyan-300/30'
                  ];
                  return (
                    <div
                      key={item.id}
                      className={`rounded-[3px] transition-colors duration-200 cursor-help ${colors[item.level]}`}
                      style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                      title={`${username} contributed at Level ${item.level} on index segment ${item.id}`}
                    />
                  );
                })}
              </div>

            </div>

          </div>
        ) : (
          <div className="w-full flex justify-center relative bg-black/40 rounded-xl overflow-hidden">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="cursor-crosshair block"
              onMouseMove={handleCanvasMouseMove}
              onMouseDown={handleCanvasMouseDown}
              onMouseUp={handleCanvasMouseUp}
              onTouchMove={handleCanvasTouchMove}
              onTouchStart={handleCanvasMouseDown}
              onTouchEnd={handleCanvasMouseUp}
            />
          </div>
        )}

      </div>

      {/* Grid Legend and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[9px] text-gray-500 font-mono mt-5 gap-4">
        
        {/* Toggle Game Switch */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl">
          <span className={`text-[10px] font-bold ${gameMode ? 'text-cyan-400' : 'text-gray-400'}`}>GAME MODE</span>
          <button
            onClick={() => {
              setGameMode(!gameMode);
              setScore(0);
            }}
            className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${gameMode ? 'bg-cyan-500' : 'bg-gray-800'}`}
          >
            <div className={`bg-black w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${gameMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Dynamic Contribution String */}
        <div className="text-gray-400 text-center font-bold tracking-wide">
          {gameMode 
            ? `${username.toUpperCase()} DEFENDING SEGMENTS - SCORE ${score}`
            : `${username} contributed 5,657 this year on `}
          {!gameMode && (
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              GitHub
            </a>
          )}
        </div>

        {/* Visual Level Index Legend */}
        <div className="flex items-center gap-2">
          <span>LESS</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-white/5 rounded-[3px] border border-white/[0.02]" />
            <div className="w-3 h-3 bg-cyan-950/40 rounded-[3px] border border-cyan-500/10" />
            <div className="w-3 h-3 bg-cyan-800/40 rounded-[3px] border border-cyan-500/20" />
            <div className="w-3 h-3 bg-cyan-600/60 rounded-[3px] border border-cyan-400/20" />
            <div className="w-3 h-3 bg-cyan-400 rounded-[3px] border border-cyan-300/30" />
          </div>
          <span>MORE</span>
        </div>

      </div>
    </div>
  );
}
