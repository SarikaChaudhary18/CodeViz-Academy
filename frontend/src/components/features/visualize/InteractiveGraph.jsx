import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow, Controls, Background, useNodesState, useEdgesState,
  addEdge, Handle, Position, BackgroundVariant, Panel, MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Edit3, Check, X, Zap } from 'lucide-react';

// ── Color palette ─────────────────────────────────────────────────────────────
const COLORS = {
  start:    { bg:'#f0fdf4', border:'#22c55e', text:'#15803d', handle:'#22c55e', badge:'#dcfce7' },
  end:      { bg:'#fef2f2', border:'#ef4444', text:'#b91c1c', handle:'#ef4444', badge:'#fee2e2' },
  decision: { bg:'#fffbeb', border:'#f59e0b', text:'#92400e', handle:'#f59e0b', badge:'#fef3c7' },
  process:  { bg:'#ffffff', border:'#cbd5e1', text:'#334155', handle:'#94a3b8', badge:'#f1f5f9' },
  active:   { bg:'#fff7ed', border:'#ea580c', text:'#9a3412', handle:'#ea580c', badge:'#ffedd5' },
};

// ── Custom node ───────────────────────────────────────────────────────────────
function EditableNode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(data.label);
  const save   = () => { data.onLabelChange?.(draft); setEditing(false); };
  const cancel = () => { setDraft(data.label); setEditing(false); };
  const c = COLORS[data.type] || COLORS.process;

  return (
    <div style={{
      background: selected ? '#eff6ff' : c.bg,
      border: `2px solid ${selected ? '#3b82f6' : c.border}`,
      borderRadius: 14, minWidth: 150, maxWidth: 230,
      boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.15), 0 4px 16px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.07)',
      fontFamily: 'monospace', transition: 'box-shadow 0.15s, border-color 0.15s',
    }}>
      <Handle type="target" position={Position.Left}
        style={{ width:11, height:11, background:c.handle, border:'2px solid white', boxShadow:'0 1px 5px rgba(0,0,0,0.2)', left:-6 }} />

      <div style={{ padding:'10px 14px 11px' }}>
        {/* badge row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <span style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:c.text, background:c.badge, borderRadius:5, padding:'2px 7px' }}>
            {data.type || 'node'}
          </span>
          {!editing && (
            <button onClick={()=>{ setDraft(data.label); setEditing(true); }} title="Rename"
              style={{ background:'none', border:'none', cursor:'pointer', padding:2, color:c.text, opacity:0.4, lineHeight:0 }}>
              <Edit3 size={10} />
            </button>
          )}
        </div>

        {/* label */}
        {editing ? (
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <textarea autoFocus value={draft} rows={2}
              onChange={e=>setDraft(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();save();} if(e.key==='Escape')cancel(); }}
              style={{ fontSize:11, fontFamily:'monospace', fontWeight:600, color:c.text, background:'white', border:`1.5px solid ${c.border}`, borderRadius:6, padding:'4px 7px', resize:'none', outline:'none', width:'100%' }}
            />
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={save}   style={{ flex:1, background:c.border, color:'white', border:'none', borderRadius:6, padding:'4px', cursor:'pointer', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}><Check size={9}/> Save</button>
              <button onClick={cancel} style={{ flex:1, background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:6, padding:'4px', cursor:'pointer', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}><X size={9}/> Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize:11, fontWeight:700, color:c.text, lineHeight:1.5, wordBreak:'break-word' }}>{data.label}</div>
        )}

        {data.vars && !editing && (
          <div style={{ marginTop:6, fontSize:9, color:'#ea580c', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:5, padding:'2px 7px' }}>{data.vars}</div>
        )}
      </div>

      <Handle type="source" position={Position.Right}
        style={{ width:11, height:11, background:c.handle, border:'2px solid white', boxShadow:'0 1px 5px rgba(0,0,0,0.2)', right:-6 }} />
      {data.type === 'decision' && (
        <Handle type="source" id="bottom" position={Position.Bottom}
          style={{ width:11, height:11, background:c.handle, border:'2px solid white', boxShadow:'0 1px 5px rgba(0,0,0,0.2)' }} />
      )}
    </div>
  );
}

const nodeTypes = { editable: EditableNode };

// ── Horizontal BFS layout ─────────────────────────────────────────────────────
function computeHorizontalLayout(gnodes, gedges) {
  if (!gnodes?.length) return new Map();

  const adj     = new Map(gnodes.map(n => [n.id, []]));
  const inDeg   = new Map(gnodes.map(n => [n.id, 0]));

  for (const e of (gedges || [])) {
    if (adj.has(e.from)) adj.get(e.from).push(e.to);
    inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
  }

  // BFS to assign column (depth) per node
  const col  = new Map();
  const queue = gnodes.filter(n => !inDeg.get(n.id)).map(n => n.id);
  if (!queue.length) queue.push(gnodes[0].id); // fallback: start from first node
  queue.forEach(id => col.set(id, 0));

  const bfsQ = [...queue];
  while (bfsQ.length) {
    const id = bfsQ.shift();
    const c  = col.get(id) ?? 0;
    for (const next of (adj.get(id) || [])) {
      if (!col.has(next)) { col.set(next, c + 1); bfsQ.push(next); }
    }
  }

  // assign any remaining nodes (cycles etc)
  gnodes.forEach(n => { if (!col.has(n.id)) col.set(n.id, 0); });

  // Group by column
  const byCol = new Map();
  for (const [id, c] of col) {
    if (!byCol.has(c)) byCol.set(c, []);
    byCol.get(c).push(id);
  }

  const H_GAP = 240, V_GAP = 130;
  const positions = new Map();
  for (const [c, ids] of byCol) {
    const total = (ids.length - 1) * V_GAP;
    ids.forEach((id, row) => {
      positions.set(id, { x: c * H_GAP + 40, y: row * V_GAP - total / 2 + 280 });
    });
  }
  return positions;
}

function buildFlow(graphData) {
  if (!graphData?.nodes?.length) return { nodes: [], edges: [] };

  const positions = computeHorizontalLayout(graphData.nodes, graphData.edges);

  const nodes = graphData.nodes.map(n => ({
    id: n.id, type: 'editable',
    position: (n.x != null) ? { x: n.x, y: n.y } : (positions.get(n.id) || { x: 0, y: 0 }),
    data: { label: n.label, type: n.type || 'process', vars: n.vars || null },
  }));

  const edges = (graphData.edges || []).map((e, i) => ({
    id: `e-${i}`, source: e.from, target: e.to,
    label: e.label || '', type: 'smoothstep', animated: false,
    style: { stroke: '#cbd5e1', strokeWidth: 2 },
    labelStyle: { fontSize: 10, fontFamily: 'monospace', fill: '#475569', fontWeight: 600 },
    labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.95 },
    labelBgPadding: [4, 7], labelBgBorderRadius: 5,
    markerEnd: { type: 'arrowclosed', color: '#cbd5e1', width: 16, height: 16 },
  }));

  return { nodes, edges };
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function InteractiveGraph({ graphData, activeNodeId, title = 'Flow Graph' }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!graphData) return;
    const { nodes: n, edges: e } = buildFlow(graphData);
    setNodes(n.map(node => ({
      ...node,
      data: {
        ...node.data,
        onLabelChange: newLabel => setNodes(prev =>
          prev.map(nd => nd.id === node.id ? { ...nd, data: { ...nd.data, label: newLabel } } : nd)
        ),
      },
    })));
    setEdges(e);
  }, [graphData]);

  useEffect(() => {
    if (!activeNodeId) return;
    setNodes(prev => prev.map(nd => ({
      ...nd,
      data: {
        ...nd.data,
        type: nd.id === activeNodeId ? 'active' : (nd.data._base ?? nd.data.type),
        _base: nd.data._base ?? nd.data.type,
      },
    })));
    setEdges(prev => prev.map(e => ({
      ...e,
      animated: e.source === activeNodeId || e.target === activeNodeId,
      style: { ...e.style, stroke: (e.source === activeNodeId || e.target === activeNodeId) ? '#ea580c' : '#cbd5e1', strokeWidth: (e.source === activeNodeId || e.target === activeNodeId) ? 2.5 : 2 },
      markerEnd: { type: 'arrowclosed', color: (e.source === activeNodeId || e.target === activeNodeId) ? '#ea580c' : '#cbd5e1', width: 16, height: 16 },
    })));
  }, [activeNodeId]);

  const onConnect = useCallback(
    params => setEdges(eds => addEdge({ ...params, type: 'smoothstep', style: { stroke: '#cbd5e1', strokeWidth: 2 } }, eds)), []
  );

  if (!graphData || !nodes.length) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, height:280, background:'#f8fafc', borderRadius:16, border:'1.5px dashed #e2e8f0' }}>
        <Zap size={20} color="#cbd5e1" />
        <p style={{ fontFamily:'monospace', fontSize:11, color:'#94a3b8', margin:0 }}>Run the visualizer to see the interactive flow graph</p>
      </div>
    );
  }

  return (
    <div style={{ width:'100%', height:'400px', borderRadius:16, overflow:'hidden', border:'1.5px solid #e2e8f0', background:'#fafafa', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding:0.25 }}
        minZoom={0.15} maxZoom={2.5}
        proOptions={{ hideAttribution:true }}
        defaultEdgeOptions={{ type:'smoothstep' }}
      >
        <Panel position="top-left" style={{ margin:10 }}>
          <div style={{ background:'white', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'5px 12px', fontFamily:'monospace', fontSize:10, fontWeight:700, color:'#475569', display:'flex', alignItems:'center', gap:6, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <Zap size={10} color="#ea580c" /> {title} <span style={{ color:'#cbd5e1', fontWeight:400 }}>· drag · ✏️ rename</span>
          </div>
        </Panel>

        {/* Legend */}
        <Panel position="top-right" style={{ margin:10 }}>
          <div style={{ background:'white', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'8px 12px', display:'flex', flexDirection:'column', gap:5, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            {[['start','#22c55e'],['end','#ef4444'],['decision','#f59e0b'],['process','#94a3b8'],['active','#ea580c']].map(([l,c])=>(
              <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:c }} />
                <span style={{ fontSize:9, fontFamily:'monospace', color:'#64748b', fontWeight:700, textTransform:'uppercase' }}>{l}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Controls showInteractive={false}
          style={{ bottom:12, right:12, left:'auto', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', borderRadius:10, border:'1.5px solid #e2e8f0', overflow:'hidden' }}
        />
        <MiniMap
          nodeColor={n => { const t=n.data?.type; if(t==='start')return'#22c55e'; if(t==='end')return'#ef4444'; if(t==='decision')return'#f59e0b'; if(t==='active')return'#ea580c'; return'#94a3b8'; }}
          nodeStrokeWidth={0} pannable zoomable
          style={{ bottom:12, left:12, width:130, height:80, borderRadius:8, border:'1.5px solid #e2e8f0', background:'#f8fafc' }}
          maskColor="rgba(148,163,184,0.06)"
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
