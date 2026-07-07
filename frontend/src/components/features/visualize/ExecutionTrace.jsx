import React, { useState, useEffect, useRef } from 'react';
import {
  Eye, RotateCcw, Sparkles, ChevronLeft, ChevronRight,
  Play, Pause, Code2, Activity, GitBranch, Layers,
  Lightbulb, BookOpen, Zap, Clock, Database, FileCode2
} from 'lucide-react';
import { api } from '../../../lib/api';
import InteractiveGraph from './InteractiveGraph';

// ── Operation styling ──────────────────────────────────────────────────────────
const OP = {
  COMPARE:    { color:'#d97706', bg:'#fef3c7', border:'#fde68a' },
  SWAP:       { color:'#dc2626', bg:'#fee2e2', border:'#fecaca' },
  ASSIGN:     { color:'#2563eb', bg:'#dbeafe', border:'#bfdbfe' },
  RECURSE:    { color:'#7c3aed', bg:'#ede9fe', border:'#ddd6fe' },
  RETURN:     { color:'#059669', bg:'#d1fae5', border:'#a7f3d0' },
  PUSH:       { color:'#d97706', bg:'#fef3c7', border:'#fde68a' },
  POP:        { color:'#dc2626', bg:'#fee2e2', border:'#fecaca' },
  CHECK:      { color:'#4f46e5', bg:'#e0e7ff', border:'#c7d2fe' },
  LOOP_START: { color:'#0891b2', bg:'#cffafe', border:'#a5f3fc' },
  LOOP_END:   { color:'#0891b2', bg:'#cffafe', border:'#a5f3fc' },
  CALL:       { color:'#7c3aed', bg:'#ede9fe', border:'#ddd6fe' },
  BASE_CASE:  { color:'#059669', bg:'#d1fae5', border:'#a7f3d0' },
};

// ── Array Visualizer ──────────────────────────────────────────────────────────
function ArrayViz({ arrayState, highlighted=[], swapped=[], sorted=[] }) {
  if (!arrayState?.length) return null;
  const nums = arrayState.map(Number);
  const max  = Math.max(...nums.filter(n=>!isNaN(n)), 1);
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:5, padding:'20px 20px 14px', background:'#0f172a', borderRadius:16, minHeight:200, border:'1px solid #1e293b', overflowX:'auto' }}>
        {arrayState.map((val, idx) => {
          const isH  = highlighted.includes(idx);
          const isS  = swapped.includes(idx);
          const isOk = sorted.includes(idx);
          const h    = isNaN(nums[idx]) ? 40 : Math.max(28, (nums[idx]/max)*160);
          const col  = isOk ? '#22c55e' : isS ? '#ef4444' : isH ? '#f59e0b' : '#334155';
          return (
            <div key={idx} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flex:1, minWidth:36 }}>
              <span style={{ fontSize:14, fontWeight:900, fontFamily:'monospace', color: isH||isS ? col : isOk ? '#22c55e' : '#94a3b8', textShadow: isH||isS ? `0 0 14px ${col}` : 'none', transition:'color 0.2s' }}>{val}</span>
              <div style={{ width:'80%', maxWidth:44, height:h, background:col, borderRadius:'6px 6px 3px 3px', transition:'height 0.35s cubic-bezier(.4,0,.2,1), background 0.2s', boxShadow: (isH||isS) ? `0 0 20px ${col}70, 0 0 8px ${col}50` : isOk ? '0 0 10px #22c55e30' : 'none' }} />
              <span style={{ fontSize:10, color:'#475569', fontFamily:'monospace', fontWeight:600 }}>[{idx}]</span>
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:14, padding:'8px 4px' }}>
        {[['#f59e0b','Comparing'],['#ef4444','Swapping'],['#22c55e','Sorted'],['#334155','Unsorted']].map(([c,l])=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:c }} />
            <span style={{ fontSize:10, color:'#64748b', fontFamily:'monospace', fontWeight:600 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Call Stack ─────────────────────────────────────────────────────────────────
function CallStack({ frames=[] }) {
  if (!frames.length) return null;
  return (
    <div>
      <div style={{ fontSize:10, fontFamily:'monospace', fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Call Stack</div>
      <div style={{ display:'flex', flexDirection:'column-reverse', gap:3 }}>
        {frames.map((f,i)=>{
          const isTop = i===frames.length-1;
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', background: isTop ? '#fff7ed' : '#f8fafc', border:`1.5px solid ${isTop ? '#fb923c' : '#e2e8f0'}`, borderRadius:10, fontFamily:'monospace', fontSize:12, fontWeight:700, color: isTop ? '#c2410c' : '#475569', boxShadow: isTop ? '0 2px 8px rgba(234,88,12,0.12)' : 'none' }}>
              <span style={{ fontSize:9, color: isTop ? '#fb923c' : '#94a3b8', fontWeight:600 }}>#{i+1}</span>
              <span style={{ flex:1 }}>{f}</span>
              {isTop && <span style={{ fontSize:9, color:'#fb923c', background:'#ffedd5', padding:'2px 7px', borderRadius:6 }}>ACTIVE</span>}
            </div>
          );
        })}
        <div style={{ padding:'5px 14px', background:'#0f172a', borderRadius:8, fontFamily:'monospace', fontSize:10, color:'#475569', textAlign:'center' }}>— main() —</div>
      </div>
    </div>
  );
}

// ── Variable Inspector ─────────────────────────────────────────────────────────
function VarGrid({ variables }) {
  if (!variables || !Object.keys(variables).length) return null;
  const entries = Object.entries(variables);
  return (
    <div>
      <div style={{ fontSize:10, fontFamily:'monospace', fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Variables</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {entries.map(([k,v])=>(
          <div key={k} style={{ padding:'8px 14px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color:'#6366f1', fontFamily:'monospace', fontWeight:800 }}>{k}</span>
            <span style={{ fontSize:11, color:'#94a3b8' }}>=</span>
            <span style={{ fontSize:15, color:'#ea580c', fontFamily:'monospace', fontWeight:900 }}>{v===null?'null':v===undefined?'—':String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Code Viewer ────────────────────────────────────────────────────────────────
function CodeView({ code, activeLine, editable, onChange }) {
  const lines = code.split('\n');
  return (
    <div style={{ background:'#0f172a', borderRadius:12, overflow:'hidden', border:'1px solid #1e293b', fontFamily:'monospace' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#1e293b' }}>
        {['#ef4444','#f59e0b','#22c55e'].map((c,i)=><div key={i} style={{ width:9, height:9, borderRadius:'50%', background:c, opacity:0.7 }} />)}
        <span style={{ marginLeft:8, fontSize:10, color:'#475569' }}>{editable ? 'editor.js' : 'traced.js'}</span>
        {!editable && activeLine && <span style={{ marginLeft:'auto', fontSize:9, color:'#ea580c', background:'rgba(234,88,12,0.15)', padding:'2px 8px', borderRadius:4 }}>Line {activeLine} executing</span>}
      </div>
      {editable ? (
        <textarea value={code} onChange={e=>onChange(e.target.value)} placeholder="Paste code OR describe a LeetCode problem..." style={{ width:'100%', minHeight:320, padding:'14px 16px', background:'transparent', border:'none', outline:'none', color:'#e2e8f0', fontFamily:'monospace', fontSize:12, lineHeight:1.7, resize:'vertical', boxSizing:'border-box' }} />
      ) : (
        <div style={{ padding:'8px 0', maxHeight:400, overflowY:'auto', overflowX:'auto' }}>
          {lines.map((ln,i)=>{
            const n = i+1;
            const active = n===activeLine;
            return (
              <div key={i} style={{ display:'flex', background: active ? 'rgba(234,88,12,0.16)' : 'transparent', borderLeft:`3px solid ${active ? '#ea580c' : 'transparent'}`, transition:'background 0.2s' }}>
                <span style={{ width:34, padding:'0 8px', textAlign:'right', color: active ? '#fb923c' : '#334155', fontSize:10, userSelect:'none', flexShrink:0, lineHeight:'22px' }}>{n}</span>
                <span style={{ padding:'0 12px', color: active ? '#fde68a' : '#64748b', whiteSpace:'pre', fontSize:12, lineHeight:'22px' }}>{ln||' '}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Approach Panel ─────────────────────────────────────────────────────────────
function ApproachPanel({ data }) {
  if (!data) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, background:'white', border:'1px solid #e2e8f0', borderRadius:24, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
      {/* header */}
      <div style={{ padding:'16px 22px', background:'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <BookOpen size={16} color="#f97316" />
          <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:800, color:'white' }}>
            {data.problemTitle || data.algorithmType?.toUpperCase() || 'ALGORITHM'} APPROACH
          </span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <span style={{ fontSize:10, fontFamily:'monospace', background:'rgba(234,88,12,0.2)', color:'#fb923c', border:'1px solid rgba(234,88,12,0.3)', padding:'3px 10px', borderRadius:6, fontWeight:700 }}>
            {data.algorithmType}
          </span>
          {data.inputType === 'problem' && (
            <span style={{ fontSize:10, fontFamily:'monospace', background:'rgba(139,92,246,0.2)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.3)', padding:'3px 10px', borderRadius:6, fontWeight:700 }}>
              PROBLEM → SOLUTION
            </span>
          )}
        </div>
      </div>

      <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:16 }}>
        {/* summary */}
        <p style={{ margin:0, fontSize:13, color:'#0f172a', fontFamily:'system-ui, sans-serif', fontWeight:600, lineHeight:1.6 }}>{data.summary}</p>

        {/* approach explanation */}
        {data.approach && (
          <div style={{ padding:'14px 16px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14 }}>
            <div style={{ fontSize:10, fontFamily:'monospace', fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
              <Lightbulb size={11} color="#f59e0b" /> Key Insight
            </div>
            <p style={{ margin:0, fontSize:12, color:'#334155', lineHeight:1.8, fontFamily:'system-ui, sans-serif' }}>{data.approach}</p>
          </div>
        )}

        {/* complexity row */}
        <div style={{ display:'flex', gap:12 }}>
          {data.timeComplexity && (
            <div style={{ flex:1, padding:'12px 16px', background:'#fef3c7', border:'1px solid #fde68a', borderRadius:12, display:'flex', alignItems:'center', gap:10 }}>
              <Clock size={14} color="#d97706" />
              <div>
                <div style={{ fontSize:9, fontFamily:'monospace', fontWeight:800, color:'#92400e', textTransform:'uppercase', letterSpacing:'0.08em' }}>Time</div>
                <div style={{ fontSize:18, fontFamily:'monospace', fontWeight:900, color:'#d97706' }}>{data.timeComplexity}</div>
              </div>
            </div>
          )}
          {data.spaceComplexity && (
            <div style={{ flex:1, padding:'12px 16px', background:'#e0e7ff', border:'1px solid #c7d2fe', borderRadius:12, display:'flex', alignItems:'center', gap:10 }}>
              <Database size={14} color="#4f46e5" />
              <div>
                <div style={{ fontSize:9, fontFamily:'monospace', fontWeight:800, color:'#3730a3', textTransform:'uppercase', letterSpacing:'0.08em' }}>Space</div>
                <div style={{ fontSize:18, fontFamily:'monospace', fontWeight:900, color:'#4f46e5' }}>{data.spaceComplexity}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Default code ───────────────────────────────────────────────────────────────
const DEFAULT = `function bubbleSort(arr) {
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

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ExecutionTrace() {
  const [input, setInput]     = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [data, setData]       = useState(null);
  const [idx, setIdx]         = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab]         = useState('visual');
  const timer                 = useRef(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setData(null); setIdx(0); setPlaying(false);
    try {
      const res = await api.post('/ai/tool', { toolType:'execution-trace', payload:input });
      if (res.data) { setData(res.data); }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(()=>{
    if (!playing || !data?.steps) return;
    timer.current = setInterval(()=>{
      setIdx(p=>{ if (p>=data.steps.length-1){ setPlaying(false); return p; } return p+1; });
    }, 900);
    return ()=>clearInterval(timer.current);
  }, [playing, data]);

  const steps = data?.steps ?? [];
  const total = steps.length;
  const step  = steps[idx];
  const op    = step?.operation ? (OP[step.operation] ?? { color:'#64748b', bg:'#f1f5f9', border:'#e2e8f0' }) : null;
  const codeToShow = data?.code || input;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

      {/* ── HEADER ── */}
      <div>
        <h1 style={{ fontSize:28, fontWeight:900, color:'#0f172a', display:'flex', alignItems:'center', gap:10, margin:0 }}>
          <Eye style={{ color:'#ea580c', width:28, height:28 }} />
          DSA EXECUTION VISUALIZER
        </h1>
        <p style={{ fontSize:11, color:'#94a3b8', fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:4 }}>
          Paste code or describe a LeetCode problem — AI traces every step with educational insights
        </p>
      </div>

      {/* ── INPUT ROW ── */}
      <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:24, padding:22, boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, paddingBottom:12, borderBottom:'1px solid #f1f5f9' }}>
          <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:800, color:'#0f172a', display:'flex', alignItems:'center', gap:7 }}>
            <FileCode2 size={14} color="#ea580c" /> INPUT — Code or Problem
          </span>
          <button onClick={()=>{ setData(null); setIdx(0); setPlaying(false); }} style={{ background:'none', border:'1px solid #e2e8f0', padding:'5px 9px', borderRadius:9, cursor:'pointer', color:'#94a3b8' }}><RotateCcw size={12} /></button>
        </div>

        {/* Main input area */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 min-w-0">
            <CodeView code={data ? codeToShow : input} activeLine={step?.line} editable={!data} onChange={setInput} />
            <button onClick={run} disabled={loading || !input.trim()}
              style={{ width:'100%', marginTop:12, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 0', background:'#ea580c', color:'white', border:'none', borderRadius:12, fontFamily:'monospace', fontSize:12, fontWeight:900, cursor:'pointer', opacity: loading ? 0.7 : 1, boxShadow:'0 4px 14px rgba(234,88,12,0.28)', transition:'opacity 0.2s' }}>
              {loading ? <><div style={{ width:13, height:13, border:'2.5px solid rgba(255,255,255,0.3)', borderTop:'2.5px solid white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Analyzing...</> : <><Sparkles size={13} /> Trace Execution</>}
            </button>
          </div>

          {/* Quick examples */}
          <div className="w-full md:w-[190px] shrink-0" style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <span style={{ fontSize:9, fontFamily:'monospace', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>Quick examples</span>
            {[
              ['Two Sum', 'Given an array of integers and a target, return indices of the two numbers that add up to target. Use O(n) approach.'],
              ['Binary Search', 'function binarySearch(arr,t){\n  let l=0,r=arr.length-1;\n  while(l<=r){\n    let m=Math.floor((l+r)/2);\n    if(arr[m]===t) return m;\n    arr[m]<t?l=m+1:r=m-1;\n  }\n  return -1;\n}\nbinarySearch([1,3,5,7,9,11],7);'],
              ['Merge Sort', 'Explain merge sort. Show divide and conquer with example [38,27,43,3,9,82,10].'],
              ['Fib DP', 'function fib(n,memo={}){\n  if(n<=1) return n;\n  if(memo[n]) return memo[n];\n  return memo[n]=fib(n-1,memo)+fib(n-2,memo);\n}\nfib(6);'],
              ['Valid Parens', 'Given a string of brackets, determine if it is valid. Use a stack approach.'],
            ].map(([label, val])=>(
              <button key={label} className="ex-btn" onClick={()=>{ setInput(val); setData(null); }}
                style={{ padding:'9px 12px', background:'white', border:'1px solid #e2e8f0', borderRadius:11, fontFamily:'monospace', fontSize:10, fontWeight:700, color:'#334155', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:7, transition:'all 0.15s' }}>
                <Zap size={9} color="#ea580c" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:28, padding:48, display:'flex', flexDirection:'column', alignItems:'center', gap:16, boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ width:48, height:48, border:'4px solid #fed7aa', borderTop:'4px solid #ea580c', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
          <div style={{ textAlign:'center' }}>
            <p style={{ fontFamily:'monospace', fontSize:13, color:'#0f172a', fontWeight:700, margin:0 }}>NVIDIA Nemotron Ultra is reasoning...</p>
            <p style={{ fontFamily:'monospace', fontSize:11, color:'#94a3b8', margin:'4px 0 0' }}>Analyzing algorithm · Building trace · Computing steps</p>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {data && !loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:20, animation:'fadeIn 0.4s ease' }}>

          {/* Approach panel */}
          <ApproachPanel data={data} />

          {/* Full visualizer card */}
          <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:28, padding:24, boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>

            {/* Tab bar + controls */}
            <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:20, flexWrap:'wrap' }}>
              {[['visual', Activity, 'Visualizer'],['graph', GitBranch, 'Flow Graph'],['trace', Layers, 'Full Trace']].map(([id, Icon, label])=>(
                <button key={id} onClick={()=>setTab(id)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', background: tab===id ? '#0f172a' : '#f8fafc', color: tab===id ? 'white' : '#64748b', border: tab===id ? 'none' : '1px solid #e2e8f0', borderRadius:10, fontFamily:'monospace', fontSize:11, fontWeight:800, cursor:'pointer', transition:'all 0.15s' }}>
                  <Icon size={12} /> {label}
                </button>
              ))}

              {total > 0 && (
                <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
                  <button onClick={()=>setIdx(p=>Math.max(0,p-1))} disabled={idx===0}
                    style={{ display:'flex', alignItems:'center', gap:4, padding:'7px 14px', background:'white', border:'1px solid #e2e8f0', borderRadius:10, fontFamily:'monospace', fontSize:11, fontWeight:700, cursor:'pointer', opacity:idx===0?0.4:1 }}>
                    <ChevronLeft size={13} /> Prev
                  </button>
                  <button onClick={()=>setPlaying(p=>!p)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 20px', background: playing ? '#1e293b' : '#ea580c', color:'white', border:'none', borderRadius:10, fontFamily:'monospace', fontSize:11, fontWeight:800, cursor:'pointer' }}>
                    {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
                  </button>
                  <button onClick={()=>setIdx(p=>Math.min(total-1,p+1))} disabled={idx===total-1}
                    style={{ display:'flex', alignItems:'center', gap:4, padding:'7px 14px', background:'#ea580c', color:'white', border:'none', borderRadius:10, fontFamily:'monospace', fontSize:11, fontWeight:700, cursor:'pointer', opacity:idx===total-1?0.4:1 }}>
                    Next <ChevronRight size={13} />
                  </button>
                  <span style={{ fontSize:11, fontFamily:'monospace', color:'#64748b', marginLeft:4 }}>{idx+1}/{total}</span>
                </div>
              )}
            </div>

            {/* Progress */}
            {total > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ height:6, background:'#f1f5f9', borderRadius:999, overflow:'hidden', marginBottom:6 }}>
                  <div style={{ height:'100%', width:`${((idx+1)/total)*100}%`, background:'linear-gradient(90deg,#ea580c,#f97316)', borderRadius:999, transition:'width 0.3s ease' }} />
                </div>
                <div style={{ display:'flex', gap:3 }}>
                  {Array.from({length:Math.min(total,30)}).map((_,i)=>(
                    <button key={i} onClick={()=>setIdx(i)} style={{ flex:1, height:4, borderRadius:2, background: i===idx?'#ea580c':i<idx?'#fed7aa':'#e2e8f0', border:'none', cursor:'pointer', transition:'background 0.2s', padding:0 }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── VISUAL TAB ── */}
            {tab === 'visual' && step && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {/* Step header */}
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:16 }}>
                  {op && (
                    <span style={{ padding:'6px 14px', background:op.bg, border:`1.5px solid ${op.border}`, color:op.color, borderRadius:10, fontFamily:'monospace', fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>
                      {step.operation}
                    </span>
                  )}
                  {step.line && <span style={{ fontSize:11, fontFamily:'monospace', color:'#ea580c', background:'#fff7ed', border:'1px solid #fed7aa', padding:'4px 10px', borderRadius:8, flexShrink:0 }}>Line {step.line}</span>}
                  <p style={{ margin:0, fontSize:12, fontFamily:'system-ui,sans-serif', color:'#334155', lineHeight:1.5 }}>{step.description}</p>
                </div>

                {/* Insight bubble */}
                {step.insight && (
                  <div style={{ display:'flex', gap:12, padding:'12px 16px', background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:14 }}>
                    <Lightbulb size={16} color="#d97706" style={{ flexShrink:0, marginTop:1 }} />
                    <p style={{ margin:0, fontSize:12, color:'#92400e', fontFamily:'system-ui,sans-serif', lineHeight:1.6, fontStyle:'italic' }}>{step.insight}</p>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-5 items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-4">
                    {step.arrayState ? (
                      <ArrayViz arrayState={step.arrayState} highlighted={step.highlighted??[]} swapped={step.swapped??[]} sorted={step.sorted??[]} />
                    ) : (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:140, background:'#f8fafc', borderRadius:16, border:'1px dashed #e2e8f0' }}>
                        <p style={{ fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>No array — check Full Trace or Flow Graph</p>
                      </div>
                    )}
                    <VarGrid variables={step.variables} />
                  </div>
                  <div className="w-full md:w-[280px] shrink-0">
                    <CallStack frames={step.callStack??[]} />
                  </div>
                </div>
              </div>
            )}

            {/* ── FLOW GRAPH TAB ── */}
            {tab === 'graph' && (
              <div style={{ height:560 }}>
                {data.graph ? (
                  <InteractiveGraph graphData={data.graph} activeNodeId={step?.nodeId} title="Control Flow" />
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400, background:'#f8fafc', borderRadius:16, border:'1px dashed #e2e8f0' }}>
                    <p style={{ fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>No flow graph returned</p>
                  </div>
                )}
              </div>
            )}

            {/* ── FULL TRACE TAB ── */}
            {tab === 'trace' && (
              <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:560, overflowY:'auto', paddingRight:4 }}>
                {steps.map((s,i)=>{
                  const o = s.operation ? (OP[s.operation] ?? { color:'#64748b', bg:'#f1f5f9', border:'#e2e8f0' }) : null;
                  const isActive = i===idx;
                  return (
                    <button key={i} onClick={()=>setIdx(i)}
                      style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', background: isActive?'#fff7ed':'#f8fafc', border:`1.5px solid ${isActive?'#fb923c':'#e2e8f0'}`, borderRadius:14, cursor:'pointer', textAlign:'left', transition:'all 0.15s', boxShadow: isActive?'0 2px 12px rgba(234,88,12,0.12)':'none' }}>
                      <span style={{ fontSize:11, fontFamily:'monospace', color:'#94a3b8', fontWeight:700, minWidth:22, flexShrink:0 }}>{i+1}</span>
                      {o && <span style={{ padding:'2px 8px', background:o.bg, border:`1px solid ${o.border}`, color:o.color, borderRadius:6, fontFamily:'monospace', fontSize:9, fontWeight:900, textTransform:'uppercase', whiteSpace:'nowrap', alignSelf:'flex-start', flexShrink:0 }}>{s.operation}</span>}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, fontSize:11, fontFamily:'system-ui,sans-serif', color: isActive?'#c2410c':'#334155', fontWeight: isActive?700:500, lineHeight:1.5 }}>{s.description}</p>
                        {s.insight && <p style={{ margin:'3px 0 0', fontSize:10, color:'#92400e', fontFamily:'system-ui,sans-serif', fontStyle:'italic' }}>💡 {s.insight}</p>}
                        {s.variables && <p style={{ margin:'3px 0 0', fontSize:10, fontFamily:'monospace', color:'#64748b' }}>{Object.entries(s.variables).map(([k,v])=>`${k}=${v}`).join('  ·  ')}</p>}
                      </div>
                      {s.line && <span style={{ fontSize:10, fontFamily:'monospace', color:'#94a3b8', whiteSpace:'nowrap', flexShrink:0 }}>L{s.line}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
