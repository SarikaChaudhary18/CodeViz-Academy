import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../../../hooks/useStore';
import { socketService } from '../../../lib/socket';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Code, Terminal, Plus, Users, Hash, AlertTriangle } from 'lucide-react';
import { api } from '../../../lib/api';

export default function CommunitiesChat() {
  const {
    token,
    user,
    communities,
    activeCommunity,
    messages,
    communitiesLoading,
    messagesLoading,
    fetchCommunities,
    setActiveCommunity,
    addMessage
  } = useStore();

  const [messageText, setMessageText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [showAddChannel, setShowAddChannel] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch all channels on mount
  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  // Connect WebSockets and register handler
  useEffect(() => {
    if (!token) return;
    
    // Connect socket
    const socket = socketService.connect(token);
    
    // Listen for incoming messages
    const cleanup = socketService.onMessageReceived((msg) => {
      addMessage(msg);
    });

    return () => {
      cleanup();
    };
  }, [token, addMessage]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() && !codeSnippet.trim()) return;
    if (!activeCommunity) return;

    socketService.sendMessage(activeCommunity._id, messageText, codeSnippet);
    
    setMessageText('');
    setCodeSnippet('');
    setShowCodeInput(false);
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const response = await api.post('/communities', {
        name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
        description: `Discussion for ${newChannelName}`,
      });
      if (response.status === 'success') {
        alert('Channel created successfully!');
        setNewChannelName('');
        setShowAddChannel(false);
        fetchCommunities();
      }
    } catch (err) {
      alert(err.message || 'Failed to create channel.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header HUD */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
          COMMUNITY SECTORS
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          WEBSOCKET CHAT ENGINE CHANNELS FOR SNIPPET SHARING & SQUAD ALIGNMENT
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: Channels List */}
        <div>
          <div className="glassmorphism rounded-3xl p-6 border-white/10 box-glow-violet flex flex-col h-[520px] overflow-hidden justify-between">
            <div className="overflow-y-auto space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Hash size={14} className="text-violet-400" /> Sectors List
                </h3>
                <button
                  onClick={() => setShowAddChannel(!showAddChannel)}
                  className="p-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-lg text-cyan-400 transition-all cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>

              {showAddChannel && (
                <form onSubmit={handleCreateChannel} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                  <input
                    type="text"
                    required
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="new-channel"
                    className="w-full bg-[#07080a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50 font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] font-mono rounded-lg transition-all"
                  >
                    Add Channel
                  </button>
                </form>
              )}

              {communitiesLoading ? (
                <div className="text-center py-6 text-[10px] font-mono text-gray-500 uppercase animate-pulse">Loading sectors...</div>
              ) : (
                <div className="space-y-1">
                  {communities.map((chan) => {
                    const isActive = activeCommunity?._id === chan._id;
                    return (
                      <button
                        key={chan._id}
                        onClick={() => setActiveCommunity(chan)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/5 text-white border-l-2 border-violet-500'
                            : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        <Hash size={14} className={isActive ? 'text-violet-400' : 'text-gray-500'} />
                        <span className="text-xs font-semibold truncate font-mono">{chan.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="border-t border-white/5 pt-4 flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase">
              <Users size={12} className="text-cyan-400" />
              <span>Websocket Online Lobbies</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Area */}
        <div className="lg:col-span-3">
          <div className="glassmorphism rounded-3xl border-white/10 box-glow-cyan flex flex-col h-[520px] overflow-hidden relative">
            
            {/* Chat header status */}
            <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-cyan-400" />
                <span className="text-xs text-white font-bold tracking-wider font-mono">
                  {activeCommunity ? activeCommunity.name : 'no-active-channel'}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                {activeCommunity ? activeCommunity.description : ''}
              </span>
            </div>

            {/* Chat messages stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messagesLoading ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono uppercase tracking-widest animate-pulse">
                  Syncing channel log...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-xs font-mono uppercase tracking-widest gap-2">
                  <MessageSquare size={16} />
                  <span>Channel timeline is empty. Seed the first message!</span>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.senderId?._id === user?.id || msg.senderId === user?.id;
                  const senderName = msg.senderId?.username || (isOwnMessage ? user?.username : 'System User');
                  const senderLevel = msg.senderId?.level || (isOwnMessage ? user?.level : 1);
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                    >
                      {/* Message meta */}
                      <div className="flex items-center gap-1.5 mb-1 text-[9px] font-mono text-gray-500">
                        <span className="font-semibold text-gray-400">{senderName}</span>
                        <span className="px-1.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded">LVL {senderLevel}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Message bubble */}
                      <div className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 border border-violet-500/25 text-white rounded-tr-none'
                          : 'bg-white/[0.02] border border-white/5 text-gray-200 rounded-tl-none'
                      }`}>
                        <p className="font-sans whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Render code snippet */}
                        {msg.codeSnippet && (
                          <div className="mt-3 bg-[#0b0c10] border border-white/10 rounded-xl p-3 overflow-x-auto font-mono text-[10px] text-cyan-300 whitespace-pre">
                            <code className="block select-text">{msg.codeSnippet}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input prompt & code snippets panel */}
            <form onSubmit={handleSendMessage} className="border-t border-white/5 bg-white/[0.005] flex flex-col p-4 gap-3">
              {showCodeInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <label className="block text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Code Snippet Share</label>
                  <textarea
                    rows={4}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="// Paste code snippet here..."
                    className="w-full bg-[#07080a] border border-white/10 rounded-xl p-3 text-[10px] text-cyan-300 focus:outline-none focus:border-violet-500/50 font-mono resize-none leading-relaxed"
                  />
                </motion.div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                    showCodeInput 
                      ? 'bg-violet-600/20 text-violet-300 border-violet-500/30' 
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-gray-400'
                  }`}
                  title="Share Code Snippet"
                >
                  <Code size={14} />
                </button>

                <input
                  type="text"
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Broadcast message in channel..."
                  className="flex-1 bg-white/[0.02] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
                />

                <button
                  type="submit"
                  className="p-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all cursor-pointer flex items-center justify-center active:scale-[0.98]"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
