import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Eraser, Trash2, ShieldAlert, Award, Grid } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Whiteboard() {
  const [tool, setTool] = useState('pen');
  const [shapes, setShapes] = useState([
    { type: 'rect', x: 80, y: 60, w: 120, h: 80, label: "Client Client" },
    { type: 'arrow', sx: 200, sy: 100, ex: 300, ey: 100 },
    { type: 'rect', x: 300, y: 60, w: 120, h: 80, label: "Reverse Proxy" }
  ]);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement.clientWidth || 800;
      canvas.height = canvas.parentElement.clientHeight || 500;
    }
  }, []);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastPos({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 30;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setLastPos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    setShapes([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleAddShape = () => {
    const randomX = 100 + Math.random() * 200;
    const randomY = 100 + Math.random() * 150;
    setShapes(prev => [
      ...prev,
      { type: 'rect', x: randomX, y: randomY, w: 140, h: 80, label: "Server Node" }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <PenTool className="text-orange-600 w-8 h-8" />
          COLLABORATIVE WHITEBOARD
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Sketch system layouts and explain structures to peers in real-time
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
        
        {/* Draw Toolbar */}
        <div className="flex md:flex-col gap-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-150 h-fit w-full md:w-auto">
          <button
            onClick={() => setTool('pen')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              tool === 'pen' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
            title="Pen Tool"
          >
            <PenTool size={16} />
          </button>
          
          <button
            onClick={() => setTool('eraser')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              tool === 'eraser' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
            title="Eraser Tool"
          >
            <Eraser size={16} />
          </button>

          <button
            onClick={handleAddShape}
            className="p-3 rounded-xl border bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 transition-all cursor-pointer"
            title="Add Block Node"
          >
            <Grid size={16} />
          </button>

          <button
            onClick={handleClear}
            className="p-3 rounded-xl border bg-red-50 text-red-650 border-red-100 hover:bg-red-100 transition-all cursor-pointer md:mt-6"
            title="Clear Board"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Canvas area */}
        <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl relative min-h-[350px] p-6 overflow-hidden">
          
          {/* Board Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] opacity-60 pointer-events-none" />

          {/* Interactive drawing canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="absolute inset-0 w-full h-full cursor-crosshair z-10"
          />

          {/* SVG shapes drawing */}
          <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
              </marker>
            </defs>

            {shapes.map((shape, idx) => {
              if (shape.type === 'rect') {
                return (
                  <g key={idx}>
                    <rect
                      x={shape.x}
                      y={shape.y}
                      width={shape.w}
                      height={shape.h}
                      rx="8"
                      fill="#ffffff"
                      stroke="#ea580c"
                      strokeWidth="2"
                    />
                    <text
                      x={shape.x + shape.w / 2}
                      y={shape.y + shape.h / 2 + 4}
                      textAnchor="middle"
                      className="font-mono text-[9px] font-bold fill-zinc-800"
                    >
                      {shape.label}
                    </text>
                  </g>
                );
              }
              if (shape.type === 'arrow') {
                return (
                  <line
                    key={idx}
                    x1={shape.sx}
                    y1={shape.sy}
                    x2={shape.ex}
                    y2={shape.ey}
                    stroke="#71717a"
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                  />
                );
              }
              return null;
            })}
          </svg>

          {/* Guide Overlay */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-[9px] font-mono text-zinc-500">
            Active Collab Session: 2 peers drawing
          </div>

        </div>

      </div>
    </div>
  );
}
