import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Users, Play, Code } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { socketService } from '../../../lib/socket';

export default function CollabRoom() {
  const user = useStore(state => state.user);
  const [code, setCode] = useState(`// Collaborative Workspace Session
function syncDataStructures() {
  console.log("Syncing arrays nodes across sockets...");
}`);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { user: "System", text: "Joined collaborative coding workspace." }
  ]);
  const [peers, setPeers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const roomId = 'default_collab_room_lobby';

  useEffect(() => {
    // Connect socket if not connected
    const socket = socketService.getSocket();
    if (socket) {
      socketService.joinRoom(roomId);

      // Listen for code sync
      const unsubscribeCode = socketService.onCollabCodeReceived((data) => {
        if (data.sender !== user?.username) {
          setCode(data.code);
          // Add peer to list if not present
          setPeers(prev => {
            if (!prev.some(p => p.name === data.sender)) {
              return [...prev, { name: data.sender, status: "Editing" }];
            }
            return prev.map(p => p.name === data.sender ? { ...p, status: "Editing" } : p);
          });
        }
      });

      // Listen for chat sync
      const unsubscribeChat = socketService.onCollabChatReceived((data) => {
        setChatMessages(prev => [...prev, { user: data.user, text: data.text }]);
      });

      return () => {
        unsubscribeCode();
        unsubscribeChat();
        socketService.leaveRoom(roomId);
      };
    }
  }, [user]);

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);

    // Emit changes to peers (debounced by 300ms)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitCollabCodeChange(roomId, val);
    }, 300);
  };

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    socketService.emitCollabChatSend(roomId, chatInput);
    setChatInput('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Code className="text-orange-600 w-8 h-8 animate-pulse" />
          COLLABORATIVE CODING ROOM
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Synchronize code changes and chat in real-time over WebSocket lanes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Editor panel (Left) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="text-xs font-mono font-bold text-zinc-950 flex items-center gap-1.5">
              <Terminal size={14} className="text-orange-600" /> LIVE COLLAB CODE
            </span>
            <span className="text-[10px] font-mono text-zinc-400">WebSocket connection active</span>
          </div>

          <textarea
            value={code}
            onChange={handleCodeChange}
            className="w-full h-72 p-4 font-mono text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-900 leading-relaxed"
          />

          <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-[10px] text-zinc-650 font-mono leading-normal">
            💡 <strong>Collab Active:</strong> Any edits made in this workspace immediately broadcast to peers connected to this session.
          </div>
        </div>

        {/* Sidebar chat & users list (Right) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Peer Checklist */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-3 mb-3">
              <Users size={14} className="text-orange-600" /> Active Room Peers
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-550 animate-ping" />
                  <span className="font-semibold text-zinc-800">{user?.username || 'You'} (Host)</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Online</span>
              </div>
              {peers.map((peer, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-semibold text-zinc-800">{peer.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">{peer.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Chat */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-[220px]">
            <h3 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-3 mb-3">
              Room Chat Feed
            </h3>

            <div className="flex-1 overflow-y-auto max-h-36 space-y-2 mb-4 pr-1">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="text-[11px] leading-relaxed">
                  <strong className="text-orange-600 font-mono">{msg.user}:</strong> <span className="text-zinc-700">{msg.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleChatSend} className="flex gap-2 border-t border-zinc-100 pt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send message to room..."
                className="flex-1 h-8 px-3 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-950"
              />
              <button 
                type="submit"
                className="h-8 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
