import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  BackgroundVariant,
  Panel,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Edit3, Check, X, Zap, Move } from 'lucide-react';

// ─── Color palette per node type ──────────────────────────────────────────────
const TYPE_COLORS = {
  start:    { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', handle: '#22c55e', badge: '#dcfce7' },
  end:      { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', handle: '#ef4444', badge: '#fee2e2' },
  decision: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', handle: '#f59e0b', badge: '#fef3c7' },
  process:  { bg: '#ffffff', border: '#cbd5e1', text: '#334155', handle: '#94a3b8', badge: '#f1f5f9' },
  active:   { bg: '#fff7ed', border: '#ea580c', text: '#9a3412', handle: '#ea580c', badge: '#ffedd5' },
};

// ─── Custom Node ──────────────────────────────────────────────────────────────
function EditableNode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]   = useState(data.label);

  const save   = () => { data.onLabelChange?.(draft); setEditing(false); };
  const cancel = () => { setDraft(data.label); setEditing(false); };

  const c = TYPE_COLORS[data.type] || TYPE_COLORS.process;

  return (
    <div style={{
      background: selected ? '#eff6ff' : c.bg,
      border: `2px solid ${selected ? '#3b82f6' : c.border}`,
      borderRadius: data.type === 'decision' ? 10 : 14,
      minWidth: 140, maxWidth: 200,
      boxShadow: selected
        ? '0 0 0 3px rgba(59,130,246,0.18), 0 4px 16px rgba(0,0,0,0.08)'
        : '0 2px 10px rgba(0,0,0,0.07)',
      fontFamily: "'Inter', 'SF Mono', monospace",
      transition: 'box-shadow 0.15s, border-color 0.15s',
    }}>
      {/* top handle */}
      <Handle type="target" position={Position.Top}
        style={{ width: 10, height: 10, background: c.handle, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />

      <div style={{ padding: '9px 12px 10px' }}>
        {/* badge row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: c.text, background: c.badge, borderRadius: 4, padding: '2px 6px',
          }}>
            {data.type || 'node'}
          </span>
          {!editing && (
            <button onClick={() => { setDraft(data.label); setEditing(true); }}
              title="Edit label"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: c.text, opacity: 0.45, lineHeight: 0 }}>
              <Edit3 size={11} />
            </button>
          )}
        </div>

        {/* label / editor */}
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <textarea autoFocus value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); } if (e.key === 'Escape') cancel(); }}
              rows={2}
              style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: c.text,
                background: 'white', border: `1.5px solid ${c.border}`, borderRadius: 6,
                padding: '4px 7px', resize: 'none', outline: 'none', width: '100%' }}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={save}   style={{ flex: 1, background: c.border, color: 'white', border: 'none', borderRadius: 6, padding: '4px', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}><Check size={10} /> Save</button>
              <button onClick={cancel} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 6, padding: '4px', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}><X size={10} /> Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11, fontWeight: 700, color: c.text, lineHeight: 1.45, wordBreak: 'break-word' }}>
            {data.label}
          </div>
        )}

        {/* vars pill */}
        {data.vars && !editing && (
          <div style={{ marginTop: 6, fontSize: 9, color: '#ea580c', background: '#fff7ed',
            border: '1px solid #fed7aa', borderRadius: 5, padding: '2px 7px', fontFamily: 'monospace' }}>
            {data.vars}
          </div>
        )}
      </div>

      {/* bottom handle */}
      <Handle type="source" position={Position.Bottom}
        style={{ width: 10, height: 10, background: c.handle, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />

      {/* right handle for decision nodes */}
      {data.type === 'decision' && (
        <Handle type="source" id="yes" position={Position.Right}
          style={{ width: 10, height: 10, background: c.handle, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
      )}
    </div>
  );
}

const nodeTypes = { editable: EditableNode };

// ─── Layout builder ───────────────────────────────────────────────────────────
function buildFlow(graphData) {
  if (!graphData?.nodes?.length) return { nodes: [], edges: [] };

  // Cascade layout: 1 column, spaced vertically
  const nodes = graphData.nodes.map((n, i) => ({
    id: n.id,
    type: 'editable',
    position: n.x != null ? { x: n.x, y: n.y } : { x: 200, y: i * 110 },
    data: { label: n.label, type: n.type || 'process', vars: n.vars || null },
  }));

  const edges = (graphData.edges || []).map((e, i) => ({
    id: `edge-${i}`,
    source: e.from, target: e.to,
    sourceHandle: e.sourceHandle || null,
    label: e.label || '',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    labelStyle: { fontSize: 10, fontFamily: 'monospace', fill: '#64748b', fontWeight: 600 },
    labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9 },
    labelBgPadding: [4, 6],
    labelBgBorderRadius: 4,
  }));

  return { nodes, edges };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function InteractiveGraph({ graphData, activeNodeId, title = 'Flow Graph' }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Rebuild when data arrives
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

  // Highlight active step node
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
      style: {
        ...e.style,
        stroke: (e.source === activeNodeId || e.target === activeNodeId) ? '#ea580c' : '#94a3b8',
        strokeWidth: (e.source === activeNodeId || e.target === activeNodeId) ? 2.5 : 2,
      },
    })));
  }, [activeNodeId]);

  const onConnect = useCallback(
    params => setEdges(eds => addEdge({ ...params, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
    []
  );

  // Empty state
  if (!graphData || !nodes.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 10, height: 260, background: '#f8fafc', borderRadius: 16, border: '1.5px dashed #e2e8f0' }}>
        <Zap size={20} color="#cbd5e1" />
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', margin: 0 }}>
          Run the visualizer to see the interactive flow graph
        </p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 480, borderRadius: 16, overflow: 'hidden',
      border: '1.5px solid #e2e8f0', background: '#fafafa',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2} maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        {/* Top-left label */}
        <Panel position="top-left" style={{ margin: 10 }}>
          <div style={{
            background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 8,
            padding: '5px 11px', fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
            color: '#475569', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <Zap size={10} color="#ea580c" />
            {title}
            <span style={{ color: '#94a3b8', fontWeight: 400 }}>· drag · ✏️ edit</span>
          </div>
        </Panel>

        {/* Legend */}
        <Panel position="top-right" style={{ margin: 10 }}>
          <div style={{
            background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 8,
            padding: '7px 11px', display: 'flex', flexDirection: 'column', gap: 4,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {[['start','#22c55e'],['end','#ef4444'],['decision','#f59e0b'],['process','#94a3b8'],['active','#ea580c']].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Zoom controls */}
        <Controls
          showInteractive={false}
          style={{
            bottom: 12, right: 12, left: 'auto',
            display: 'flex', flexDirection: 'column', gap: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderRadius: 10, border: '1.5px solid #e2e8f0', overflow: 'hidden',
          }}
        />

        {/* Tiny minimap — bottom-left, 120×80 */}
        <MiniMap
          nodeColor={n => {
            const t = n.data?.type;
            if (t === 'start')    return '#22c55e';
            if (t === 'end')      return '#ef4444';
            if (t === 'decision') return '#f59e0b';
            if (t === 'active')   return '#ea580c';
            return '#94a3b8';
          }}
          nodeStrokeWidth={0}
          pannable zoomable
          style={{
            bottom: 12, left: 12,
            width: 120, height: 75,
            borderRadius: 8,
            border: '1.5px solid #e2e8f0',
            background: '#f8fafc',
          }}
          maskColor="rgba(148,163,184,0.08)"
        />

        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
