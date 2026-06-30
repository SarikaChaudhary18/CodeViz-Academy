import React, { useState, useEffect, useRef } from 'react';
import {
  Eye, RotateCcw, Sparkles, ChevronLeft, ChevronRight,
  Play, Pause, Code2, Activity, GitBranch, Terminal, Layers
} from 'lucide-react';
import { api } from '../../../lib/api';
import InteractiveGraph from './InteractiveGraph';

// ── Operation palette ─────────────────────────────────────────────────────────
const OP_META = {
  COMPARE:    { color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  SWAP:       { color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  ASSIGN:     { color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  RECURSE:    { color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe' },
  RETURN:     { color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  PUSH:       { color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  POP:        { color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  CHECK:      { color: '#4f46e5', bg: '#e0e7ff', border: '#c7d2fe' },
  LOOP_START: { color: '#0891b2', bg: '#cffafe', border: '#a5f3fc' },
  LOOP_END:   { color: '#0891b2', bg: '#cffafe', border: '#a5f3fc' },
  CALL:       { color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe' },
  BASE_CASE:  { color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
};

// ── Array bars ────────────────────────────────────────────────────────────────
function ArrayViz({ arrayState, highlighted = [], swapped = [], sorted = [] }) {
  if (!arrayState?.length) return null;
  const nums = arrayState.map(Number);
  const max  = Math.max(...nums.filter(n => !isNaN(n)), 1);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, padding:'20px 24px 16px', background:'#0f172a', borderRadius:16, minHeight:180, border:'1px solid #1e293b' }}>
        {arrayState.map((val, idx) => {
          const isH = highlighted.includes(idx);
          const isS = swapped.includes(idx);
          const isOk = sorted.includes(idx);
          const h   = isNaN(nums[idx]) ? 40 : Math.max(24, (nums[idx] / max) * 140);
          const barColor = isOk ? '#22c55e' : isS ? '#ef4444' : isH ? '#f59e0b' : '#334155';
          const glowColor = isH ? '#f59e0b' : isS ? '#ef4444' : null;

          return (
            <div key={idx} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flex:1, minWidth:0 }}>
              <span style={{
                fontSize: 13, fontWeight:800, fontFamily:'monospace',
                color: isH || isS ? barColor : isOk ? '#22c55e' : '#94a3b8',
                textShadow: glowColor ? `0 0 12px ${glowColor}` : 'none',
                transition:'color 0.2s',
              }}>{val}</span>
              <div style={{
                width:'100%', maxWidth:48, height: h,
                background: barColor,
                borderRadius:'6px 6px 3px 3px',
                transition:'height 0.35s cubic-bezier(.4,0,.2,1), background 0.2s',
                boxShadow: glowColor ? `0 0 16px ${glowColor}80, 0 0 6px ${glowColor}60` : isOk ? '0 0 8px #22c55e40' : 'none',
              }} />
              <span style={{ fontSize:10, color:'#475569', fontFamily:'monospace', fontWeight:600 }}>[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, paddingLeft:4 }}>
        {[['#f59e0b','Comparing'],['#ef4444','Swapping'],['#22c55e','Sorted'],['#334155','Unsorted']].map(([c, l]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:c }} />
            <span style={{ fontSize:10, color:'#64748b', fontFamily:'monospace', fontWeight:600 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Call stack ────────────────────────────────────────────────────────────────
function CallStack({ frames = [] }) {
  if (!frames.length) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <span style={{ fontSize:10, fontFamily:'monospace', fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em' }}>Call Stack</span>
      <div style={{ display:'flex', flexDirection:'column-reverse', gap:3 }}>
        {frames.map((f, i) => {
          const isTop = i === frames.length - 1;
          return (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 14px',
              background: isTop ? '#fff7ed' : '#f8fafc',
              border:`1.5px solid ${isTop ? '#fb923c' : '#e2e8f0'}`,
              borderRadius:10,
              fontFamily:'monospace', fontSize:12, fontWeight:700,
              color: isTop ? '#c2410c' : '#475569',
              boxShadow: isTop ? '0 2px 8px rgba(234,88,12,0.12)' : 'none',
            }}>
              <span style={{ fontSize:9, color: isTop ? '#fb923c' : '#94a3b8', fontWeight:600 }}>#{i+1}</span>
              <span>{f}</span>
              {isTop && <span style={{ marginLeft:'auto', fontSize:9, color:'#fb923c', background:'#ffedd5', padding:'2px 7px', borderRadius:6 }}>▶ ACTIVE</span>}
            </div>
          );
        })}
        <div style={{ padding:'5px 14px', background:'#0f172a', borderRadius:8, fontFamily:'monospace', fontSize:10, color:'#475569', textAlign:'center', letterSpacing:'0.05em' }}>
          — main() —
        </div>
      </div>
    </div>
  );
}

// ── Variable table ────────────────────────────────────────────────────────────
function VarInspector({ variables }) {
  if (!variables || !Object.keys(variables).length) return null;
  const entries = Object.entries(variables);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <span style={{ fontSize:10, fontFamily:'monospace', fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em' }}>Variables</span>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(entries.length, 4)}, 1fr)`, gap:6 }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{
            padding:'10px 14px', background:'#f8fafc',
            border:'1.5px solid #e2e8f0', borderRadius:12,
            display:'flex', flexDirection:'column', gap:4, alignItems:'center',
          }}>
            <span style={{ fontSize:10, color:'#6366f1', fontFamily:'monospace', fontWeight:800 }}>{k}</span>
            <span style={{ fontSize:16, color:'#ea580c', fontFamily:'monospace', fontWeight:900 }}>
              {v === null ? 'null' : v === undefined ? '—' : String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Code viewer ───────────────────────────────────────────────────────────────
function CodeView({ code, activeLine, editable, onChange }) {
  const lines = code.split('\n');
  return (
    <div style={{ background:'#0f172a', borderRadius:12, overflow:'hidden', border:'1px solid #1e293b', fontFamily:'monospace' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#1e293b' }}>
        {['#ef4444','#f59e0b','#22c55e'].map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:'50%', background:c, opacity:0.7 }} />)}
        <span style={{ marginLeft:8, fontSize:10, color:'#475569' }}>source.js</span>
      </div>
      {editable ? (
        <textarea value={code} onChange={e => onChange(e.target.value)}
          style={{ width:'100%', minHeight:180, padding:'14px 16px', background:'transparent', border:'none', outline:'none', color:'#e2e8f0', fontFamily:'monospace', fontSize:12, lineHeight:1.7, resize:'vertical' }} />
      ) : (
        <div style={{ padding:'8px 0', maxHeight:240, overflowY:'auto' }}>
          {lines.map((ln, i) => {
            const n = i + 1;
            const active = n === activeLine;
            return (
              <div key={i} style={{ display:'flex', background: active ? 'rgba(234,88,12,0.18)' : 'transparent', borderLeft:`3px solid ${active ? '#ea580c' : 'transparent'}`, transition:'background 0.2s' }}>
                <span style={{ width:32, padding:'0 8px', textAlign:'right', color: active ? '#fb923c' : '#334155', fontSize:10, userSelect:'none', flexShrink:0, lineHeight:'22px' }}>{n}</span>
                <span style={{ padding:'0 12px', color: active ? '#fde68a' : '#64748b', whiteSpace:'pre', fontSize:12, lineHeight:'22px' }}>{ln || ' '}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const DEFAULT_CODE = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
bubbleSort([5, 3, 8, 1, 4]);`;

export default function ExecutionTrace() {
  const [code, setCode]         = useState(DEFAULT_CODE);
  const [loading, setLoading]   = useState(false);
  const [data, setData]         = useState(null);
  const [idx, setIdx]           = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [activeTab, setActiveTab] = useState('visual');
  const timer = useRef(null);

  const run = async () => {
    if (!code.trim()) return;
    setLoading(true); setData(null); setIdx(0); setPlaying(false);
    try {
      const res = await api.post('/ai/tool', { toolType: 'execution-trace', payload: code });
      if (res.data) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!playing || !data?.steps) return;
    timer.current = setInterval(() => {
      setIdx(p => { if (p >= data.steps.length - 1) { setPlaying(false); return p; } return p + 1; });
    }, 850);
    return () => clearInterval(timer.current);
  }, [playing, data]);

  const steps = data?.steps ?? [];
  const total = steps.length;
  const step  = steps[idx];
  const op    = step?.operation ? (OP_META[step.operation] ?? { color:'#64748b', bg:'#f1f5f9', border:'#e2e8f0' }) : null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24, maxWidth:'100%' }}>

      {/* ── Header ── */}
      <div>
        <h1 style={{ fontSize:28, fontWeight:900, color:'#0f172a', display:'flex', alignItems:'center', gap:10, margin:0 }}>
          <Eye style={{ color:'#ea580c', width:30, height:30 }} />
          DSA EXECUTION VISUALIZER
        </h1>
        <p style={{ fontSize:11, color:'#94a3b8', fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:4 }}>
          Watch every comparison, swap & recursion unfold — step by step
        </p>
      </div>

      {/* ── Top row: Code + Info ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:16 }}>
        {/* Code */}
        <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:24, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, paddingBottom:12, borderBottom:'1px solid #f1f5f9' }}>
            <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:800, color:'#0f172a', display:'flex', alignItems:'center', gap:6 }}>
              <Code2 size={13} color="#ea580c" /> SOURCE CODE
            </span>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {data && (
                <span style={{ fontSize:10, fontFamily:'monospace', background:'#fff7ed', color:'#ea580c', border:'1px solid #fed7aa', padding:'3px 10px', borderRadius:7, fontWeight:700, textTransform:'uppercase' }}>
                  {data.algorithmType || 'algorithm'}
                </span>
              )}
              <button onClick={() => { setData(null); setIdx(0); setPlaying(false); }}
                style={{ background:'none', border:'1px solid #e2e8f0', padding:'4px 8px', borderRadius:8, cursor:'pointer', color:'#94a3b8' }}>
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
          <CodeView code={code} activeLine={step?.line} editable={!data} onChange={setCode} />
          <button onClick={run} disabled={loading || !code.trim()}
            style={{
              width:'100%', marginTop:12, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              padding:'10px 0', background:'#ea580c', color:'white', border:'none', borderRadius:12,
              fontFamily:'monospace', fontSize:12, fontWeight:800, cursor:'pointer', opacity: loading ? 0.6 : 1,
              boxShadow:'0 4px 12px rgba(234,88,12,0.25)',
            }}>
            {loading
              ? <><div style={{ width:13, height:13, border:'2.5px solid rgba(255,255,255,0.3)', borderTop:'2.5px solid white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Tracing...</>
              : <><Sparkles size={13} /> Trace Execution</>
            }
          </button>
        </div>

        {/* Right info column (step log) */}
        {step && (
          <div style={{ width:280, background:'white', border:'1px solid #e2e8f0', borderRadius:24, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', gap:14 }}>
            {/* Op badge */}
            {op && (
              <div style={{ padding:'8px 14px', background:op.bg, border:`1.5px solid ${op.border}`, borderRadius:12, fontFamily:'monospace', fontSize:12, fontWeight:900, color:op.color, textTransform:'uppercase', textAlign:'center', letterSpacing:'0.08em' }}>
                {step.operation}
              </div>
            )}
            {step.line && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:10, color:'#94a3b8', fontFamily:'monospace' }}>Line</span>
                <span style={{ fontSize:18, fontWeight:900, color:'#ea580c', fontFamily:'monospace' }}>{step.line}</span>
              </div>
            )}
            <div style={{ flex:1, padding:'10px 14px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12 }}>
              <p style={{ fontSize:11, fontFamily:'monospace', color:'#334155', lineHeight:1.7, margin:0 }}>{step.description}</p>
            </div>
            {/* mini step counter */}
            <div style={{ textAlign:'center', fontSize:11, fontFamily:'monospace', color:'#64748b' }}>
              Step <b style={{ color:'#0f172a' }}>{idx+1}</b> / {total}
            </div>
          </div>
        )}
      </div>

      {/* ── Full-width visualizer panel ── */}
      {(data || loading) && (
        <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:28, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>

          {/* tab bar */}
          {data && (
            <div style={{ display:'flex', gap:4, marginBottom:24 }}>
              {[['visual', Activity, 'Array Visualizer'],['graph', GitBranch, 'Flow Graph'],['stack', Layers, 'Full Trace']].map(([id, Icon, label]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  style={{
                    display:'flex', alignItems:'center', gap:6, padding:'8px 18px',
                    background: activeTab === id ? '#0f172a' : '#f8fafc',
                    color: activeTab === id ? 'white' : '#64748b',
                    border: activeTab === id ? 'none' : '1px solid #e2e8f0',
                    borderRadius:10, fontFamily:'monospace', fontSize:11, fontWeight:800,
                    cursor:'pointer', transition:'all 0.15s',
                  }}>
                  <Icon size={12} /> {label}
                </button>
              ))}

              {/* spacer + controls */}
              {total > 0 && (
                <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
                  <button onClick={() => setIdx(p => Math.max(0, p-1))} disabled={idx===0}
                    style={{ display:'flex', alignItems:'center', gap:4, padding:'7px 14px', background:'white', border:'1px solid #e2e8f0', borderRadius:10, fontFamily:'monospace', fontSize:11, fontWeight:700, cursor:'pointer', opacity: idx===0 ? 0.4 : 1 }}>
                    <ChevronLeft size={13} /> Prev
                  </button>
                  <button onClick={() => setPlaying(p => !p)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', background: playing ? '#1e293b' : '#ea580c', color:'white', border:'none', borderRadius:10, fontFamily:'monospace', fontSize:11, fontWeight:800, cursor:'pointer' }}>
                    {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Auto Play</>}
                  </button>
                  <button onClick={() => setIdx(p => Math.min(total-1, p+1))} disabled={idx===total-1}
                    style={{ display:'flex', alignItems:'center', gap:4, padding:'7px 14px', background:'#ea580c', color:'white', border:'none', borderRadius:10, fontFamily:'monospace', fontSize:11, fontWeight:700, cursor:'pointer', opacity: idx===total-1 ? 0.4 : 1 }}>
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:320, gap:16 }}>
              <div style={{ width:44, height:44, border:'4px solid #fed7aa', borderTop:'4px solid #ea580c', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
              <p style={{ fontFamily:'monospace', fontSize:12, color:'#94a3b8' }}>Generating trace...</p>
            </div>
          )}

          {/* Progress strip */}
          {data && total > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ height:6, background:'#f1f5f9', borderRadius:999, overflow:'hidden', marginBottom:8 }}>
                <div style={{ height:'100%', width:`${((idx+1)/total)*100}%`, background:'linear-gradient(90deg,#ea580c,#f97316)', borderRadius:999, transition:'width 0.35s ease' }} />
              </div>
              <div style={{ display:'flex', gap:3 }}>
                {Array.from({length:Math.min(total,30)}).map((_,i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    style={{ flex:1, height:4, borderRadius:2, background: i===idx ? '#ea580c' : i<idx ? '#fed7aa' : '#e2e8f0', border:'none', cursor:'pointer', transition:'background 0.2s', padding:0 }} />
                ))}
              </div>
            </div>
          )}

          {/* ── Visual tab ── */}
          {data && !loading && activeTab === 'visual' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24 }}>
              {/* Array viz - large */}
              <div>
                {step?.arrayState ? (
                  <ArrayViz arrayState={step.arrayState} highlighted={step.highlighted??[]} swapped={step.swapped??[]} sorted={step.sorted??[]} />
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:180, background:'#f8fafc', borderRadius:16, border:'1px dashed #e2e8f0' }}>
                    <p style={{ fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>No array state at this step</p>
                  </div>
                )}

                {/* Variables */}
                {step?.variables && (
                  <div style={{ marginTop:20 }}>
                    <VarInspector variables={step.variables} />
                  </div>
                )}
              </div>

              {/* Right: call stack */}
              <div>
                <CallStack frames={step?.callStack ?? []} />
              </div>
            </div>
          )}

          {/* ── Flow Graph tab ── */}
          {data && !loading && activeTab === 'graph' && (
            <div style={{ height: 520 }}>
              {data.graph ? (
                <InteractiveGraph graphData={data.graph} activeNodeId={step?.nodeId} title="Control Flow" />
              ) : (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400, background:'#f8fafc', borderRadius:16, border:'1px dashed #e2e8f0' }}>
                  <p style={{ fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>No flow graph returned</p>
                </div>
              )}
            </div>
          )}

          {/* ── Full trace tab ── */}
          {data && !loading && activeTab === 'stack' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:520, overflowY:'auto', paddingRight:4 }}>
              {steps.map((s, i) => {
                const o = s.operation ? (OP_META[s.operation] ?? { color:'#64748b', bg:'#f1f5f9', border:'#e2e8f0' }) : null;
                const isActive = i === idx;
                return (
                  <button key={i} onClick={() => setIdx(i)}
                    style={{
                      display:'flex', alignItems:'flex-start', gap:14, padding:'12px 16px',
                      background: isActive ? '#fff7ed' : '#f8fafc',
                      border: `1.5px solid ${isActive ? '#fb923c' : '#e2e8f0'}`,
                      borderRadius:14, cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                      boxShadow: isActive ? '0 2px 10px rgba(234,88,12,0.12)' : 'none',
                    }}>
                    <span style={{ fontSize:11, fontFamily:'monospace', color:'#94a3b8', fontWeight:700, minWidth:24 }}>{i+1}</span>
                    {o && (
                      <span style={{ padding:'2px 8px', background:o.bg, border:`1px solid ${o.border}`, color:o.color, borderRadius:6, fontFamily:'monospace', fontSize:9, fontWeight:900, textTransform:'uppercase', whiteSpace:'nowrap', alignSelf:'flex-start' }}>
                        {s.operation}
                      </span>
                    )}
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontSize:11, fontFamily:'monospace', color: isActive ? '#c2410c' : '#334155', fontWeight: isActive ? 700 : 500, lineHeight:1.5 }}>
                        {s.description}
                      </p>
                      {s.variables && (
                        <p style={{ margin:'4px 0 0', fontSize:10, fontFamily:'monospace', color:'#64748b' }}>
                          {Object.entries(s.variables).map(([k,v]) => `${k}=${v}`).join('  ·  ')}
                        </p>
                      )}
                    </div>
                    {s.line && <span style={{ fontSize:10, fontFamily:'monospace', color:'#94a3b8', whiteSpace:'nowrap' }}>L{s.line}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
