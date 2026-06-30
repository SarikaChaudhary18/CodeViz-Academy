import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Edit3, Check, X, Zap } from 'lucide-react';

// ── Custom Editable Node ────────────────────────────────────────
function EditableNode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.label);

  const confirm = () => { data.onLabelChange?.(draft); setEditing(false); };
  const cancel = () => { setDraft(data.label); setEditing(false); };

  const typeColors = {
    start:    { bg: '#f0fdf4', border: '#16a34a', text: '#15803d', dot: '#16a34a' },
    end:      { bg: '#fef2f2', border: '#dc2626', text: '#b91c1c', dot: '#dc2626' },
    decision: { bg: '#fffbeb', border: '#d97706', text: '#92400e', dot: '#d97706' },
    process:  { bg: '#f8fafc', border: '#64748b', text: '#334155', dot: '#64748b' },
    active:   { bg: '#fff7ed', border: '#ea580c', text: '#9a3412', dot: '#ea580c' },
  };
  const c = typeColors[data.type] || typeColors.process;

  return (
    <div style={{
      background: selected ? '#eff6ff' : c.bg,
      border: `2px solid ${selected ? '#3b82f6' : c.border}`,
      borderRadius: data.type === 'decision' ? '8px' : '12px',
      minWidth: 130, maxWidth: 220,
      boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.15s ease', fontFamily: 'monospace',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: c.dot, width: 8, height: 8 }} />
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.text, opacity: 0.7 }}>
            {data.type || 'node'}
          </span>
          {!editing && (
            <button onClick={() => { setDraft(data.label); setEditing(true); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: c.text, opacity: 0.5 }}>
              <Edit3 size={10} />
            </button>
          )}
        </div>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirm(); } if (e.key === 'Escape') cancel(); }}
              style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: c.text, background: 'white',
                border: `1px solid ${c.border}`, borderRadius: 6, padding: '4px 6px', resize: 'none', outline: 'none', width: '100%', minHeight: 44 }} />
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={confirm} style={{ flex: 1, background: c.border, color: 'white', border: 'none', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Check size={9} /> Save
              </button>
              <button onClick={cancel} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <X size={9} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11, fontWeight: 700, color: c.text, lineHeight: 1.4, wordBreak: 'break-word' }}>
            {data.label}
          </div>
        )}
        {data.vars && (
          <div style={{ marginTop: 6, fontSize: 9, color: '#ea580c', background: '#fff7ed', borderRadius: 4, padding: '2px 6px' }}>
            {data.vars}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: c.dot, width: 8, height: 8 }} />
      {data.type === 'decision' && (
        <Handle type="source" id="right" position={Position.Right} style={{ background: c.dot, width: 8, height: 8 }} />
      )}
    </div>
  );
}

const nodeTypes = { editable: EditableNode };

function buildFlowFromGraphData(graphData) {
  if (!graphData?.nodes?.length) return { nodes: [], edges: [] };
  const COLS = 3, H_GAP = 260, V_GAP = 130;
  const nodes = graphData.nodes.map((n, i) => ({
    id: n.id, type: 'editable',
    position: n.x != null ? { x: n.x, y: n.y } : { x: (i % COLS) * H_GAP + 60, y: Math.floor(i / COLS) * V_GAP + 40 },
    data: { label: n.label, type: n.type || 'process', vars: n.vars || null },
  }));
  const edges = (graphData.edges || []).map((e, i) => ({
    id: `e-${i}`, source: e.from, target: e.to, label: e.label || '',
    type: 'smoothstep', animated: e.animated ?? false,
    style: { stroke: e.animated ? '#ea580c' : '#94a3b8', strokeWidth: 1.8 },
    labelStyle: { fontSize: 10, fontFamily: 'monospace', fill: '#475569' },
    labelBgStyle: { fill: '#f8fafc', opacity: 0.85 },
  }));
  return { nodes, edges };
}

export default function InteractiveGraph({ graphData, activeNodeId, title = 'Flow Graph' }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!graphData) return;
    const { nodes: n, edges: e } = buildFlowFromGraphData(graphData);
    const withCallbacks = n.map(node => ({
      ...node,
      data: {
        ...node.data,
        onLabelChange: (newLabel) => {
          setNodes(prev => prev.map(nd => nd.id === node.id ? { ...nd, data: { ...nd.data, label: newLabel } } : nd));
        },
      },
    }));
    setNodes(withCallbacks);
    setEdges(e);
  }, [graphData]);

  useEffect(() => {
    if (!activeNodeId) return;
    setNodes(prev => prev.map(nd => ({
      ...nd,
      data: {
        ...nd.data,
        type: nd.id === activeNodeId ? 'active' : (nd.data._baseType || nd.data.type),
        _baseType: nd.data._baseType || nd.data.type,
      },
    })));
    setEdges(prev => prev.map(e => ({
      ...e,
      animated: e.source === activeNodeId || e.target === activeNodeId,
      style: { ...e.style, stroke: (e.source === activeNodeId || e.target === activeNodeId) ? '#ea580c' : '#94a3b8' },
    })));
  }, [activeNodeId]);

  const onConnect = useCallback(params => setEdges(eds => addEdge({ ...params, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 1.8 } }, eds)), []);

  if (!graphData || !nodes.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, background: '#f8fafc', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>No graph data yet. Run the visualizer to see the interactive flow.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 420, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fafafa' }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3} maxZoom={2} proOptions={{ hideAttribution: true }}>
        <Panel position="top-left">
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={10} color="#ea580c" /> {title} · Drag nodes · Click edit icon to rename
          </div>
        </Panel>
        <Controls style={{ bottom: 10, right: 10, left: 'auto' }} />
        <MiniMap nodeColor={n => { const t = n.data?.type; if (t === 'start') return '#16a34a'; if (t === 'end') return '#dc2626'; if (t === 'decision') return '#d97706'; if (t === 'active') return '#ea580c'; return '#94a3b8'; }}
          style={{ bottom: 10, left: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} maskColor="rgba(0,0,0,0.04)" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
