import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../../../hooks/useStore';
import { socketService } from '../../../lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Code, 
  Plus, 
  Users, 
  Hash, 
  Search, 
  Info, 
  MoreVertical, 
  Smile, 
  Paperclip,
  Check,
  CheckCheck,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  Calendar,
  X
} from 'lucide-react';
import { api } from '../../../lib/api';
import { cn } from "../../../lib/utils";

// Mock categories for filters
const CATEGORIES = ["All", "DSA", "React", "Node", "DevOps", "AI", "Mobile"];

// Avatar gradient list
const AVATAR_GRADIENTS = [
  "from-pink-500 to-rose-500",
  "from-purple-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-teal-500 to-emerald-500",
  "from-yellow-500 to-orange-500",
  "from-indigo-500 to-violet-500"
];

// Mock Members List for Info Drawer
const MOCK_MEMBERS = [
  { name: "SarikaChaudhary", level: 8, status: "Online", avatar: "S", active: true },
  { name: "AnshulDev", level: 6, status: "Online", avatar: "A", active: true },
  { name: "OperatorStudy", level: 5, status: "Online", avatar: "O", active: true },
  { name: "StriverFan", level: 4, status: "Offline", avatar: "F", active: false },
  { name: "CodeWizard", level: 7, status: "Offline", avatar: "W", active: false }
];

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
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch all channels on mount
  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  // Connect WebSockets and register handler
  useEffect(() => {
    if (!token) return;
    
    // Connect socket
    socketService.connect(token);
    
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
        description: newChannelDesc.trim() || `Discussion for ${newChannelName}`,
      });
      if (response.status === 'success') {
        alert('Channel created successfully!');
        setNewChannelName('');
        setNewChannelDesc('');
        setShowAddChannel(false);
        fetchCommunities();
      }
    } catch (err) {
      alert(err.message || 'Failed to create channel.');
    }
  };

  // Compile unique tags or filter locally
  const filteredCommunities = communities.filter(chan => {
    const matchesSearch = chan.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || chan.name.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Avatar index helper based on channel name
  const getAvatarGradient = (name) => {
    const code = name.charCodeAt(0) || 0;
    return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
  };

  return (
    <div className="space-y-6">
      
      {/* Header HUD - WhatsApp-Style Clean Accent */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
          COMMUNITY SECTORS
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Join discussion chambers, share syntax snippets, and collaborate with your squad in real-time
        </p>
      </div>

      {/* Main WhatsApp-Style Split Layout Frame */}
      <div className="flex border border-slate-800 rounded-2xl overflow-hidden bg-[#090d16] h-[620px] shadow-2xl relative">
        
        {/* ==================== LEFT SIDEBAR ==================== */}
        <div className="w-80 border-r border-slate-800 flex flex-col bg-[#0b0f19] shrink-0 h-full">
          
          {/* Sidebar Top Search & Actions */}
          <div className="p-4 space-y-4 border-b border-slate-900 bg-[#0c1220]/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono tracking-wider text-slate-200">CHATS</span>
              <button
                onClick={() => setShowAddChannel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg border border-indigo-500/20 text-[10px] font-bold font-mono cursor-pointer transition-all active:scale-[0.98]"
              >
                <Plus size={12} />
                <span>Create Group</span>
              </button>
            </div>

            {/* Local Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="w-full bg-[#030712] border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-sans"
              />
            </div>
          </div>

          {/* Category Quick Chips */}
          <div className="px-4 py-3 border-b border-slate-900/60 bg-[#0c1220]/30 flex gap-1.5 overflow-x-auto scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase shrink-0 transition-all cursor-pointer border",
                  selectedCategory === cat
                    ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30"
                    : "bg-slate-900/30 border-slate-800/40 text-slate-500 hover:text-slate-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Communities Channels List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900/40 pr-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            {communitiesLoading ? (
              <div className="text-center py-8 text-[10px] font-mono text-slate-500 uppercase animate-pulse">Loading discussion sectors...</div>
            ) : filteredCommunities.length === 0 ? (
              <div className="text-center py-8 text-[10px] font-mono text-slate-500 uppercase">No active groups found.</div>
            ) : (
              filteredCommunities.map((chan) => {
                const isActive = activeCommunity?._id === chan._id;
                const gradient = getAvatarGradient(chan.name);
                return (
                  <button
                    key={chan._id}
                    onClick={() => {
                      setActiveCommunity(chan);
                      setShowInfoDrawer(false); // Reset right drawer on switch
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors relative cursor-pointer border-l-2",
                      isActive
                        ? "bg-[#151b2a] border-indigo-500"
                        : "border-transparent hover:bg-slate-900/30"
                    )}
                  >
                    {/* Circle Avatar (First Letter) */}
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-sm uppercase shadow-inner shrink-0 bg-gradient-to-br text-white", gradient)}>
                      {chan.name.charAt(0)}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-slate-100 truncate">{chan.name}</span>
                        <span className="text-[8px] font-mono text-slate-500">12:35 PM</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate leading-snug">
                        {chan.description || `Discussing ${chan.name}`}
                      </p>
                    </div>

                    {/* Online status indicator */}
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 border border-slate-950 shadow shadow-emerald-500/50" />
                  </button>
                );
              })
            )}
          </div>

          {/* Connected Roster Status */}
          <div className="p-3 bg-[#070b13] border-t border-slate-900 flex items-center justify-center gap-1.5 text-[8px] font-mono text-slate-500 uppercase tracking-widest cursor-default">
            <Users size={11} className="text-indigo-400" />
            <span>Active WebSockets Session</span>
          </div>

        </div>

        {/* ==================== CENTER CHAT WINDOW ==================== */}
        <div className="flex-1 flex flex-col bg-[#070b13] h-full overflow-hidden">
          
          {activeCommunity ? (
            <>
              {/* Chat Window Header */}
              <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-[#0b0f19]/70 backdrop-blur-md">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                >
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-black text-xs uppercase bg-gradient-to-br text-white shrink-0", getAvatarGradient(activeCommunity.name))}>
                    {activeCommunity.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{activeCommunity.name}</span>
                    <span className="block text-[8px] text-slate-500 font-mono">128 members &bull; 35 active</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                    className={cn(
                      "p-2 rounded-lg border transition-all cursor-pointer",
                      showInfoDrawer
                        ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    )}
                    title="Toggle Group Information"
                  >
                    <Info size={14} />
                  </button>
                  <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>

              {/* Chat Stream Log */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[linear-gradient(to_bottom,rgba(9,13,22,0.6)_0%,rgba(9,13,22,0.9)_100%)] scrollbar-thin scrollbar-thumb-slate-850">
                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono uppercase tracking-widest animate-pulse">Syncing timeline logs...</div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono uppercase tracking-widest gap-2">
                    <MessageSquare size={16} className="text-slate-600" />
                    <span>Timeline is empty. Broadcast the first message!</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId?._id === user?.id || msg.senderId === user?.id;
                    const senderName = msg.senderId?.username || (isOwn ? user?.username : 'System User');
                    const senderLevel = msg.senderId?.level || (isOwn ? user?.level : 1);
                    
                    return (
                      <div
                        key={msg._id}
                        className={cn(
                          "flex flex-col group",
                          isOwn ? "items-end" : "items-start"
                        )}
                      >
                        {/* Meta title */}
                        <div className="flex items-center gap-1.5 mb-1.5 text-[8px] font-mono text-slate-500">
                          {!isOwn && <span className="font-bold text-slate-400">{senderName}</span>}
                          <span className="px-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[7px] font-bold">LVL {senderLevel}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* WhatsApp-Style Bubble */}
                        <div className={cn(
                          "p-3 rounded-2xl max-w-md text-xs leading-relaxed border relative",
                          isOwn
                            ? "bg-[#1e1b4b]/60 border-indigo-500/20 text-indigo-200 rounded-tr-none"
                            : "bg-slate-900/60 border-slate-800/80 text-slate-200 rounded-tl-none"
                        )}>
                          <p className="font-sans whitespace-pre-wrap select-text">{msg.content}</p>
                          
                          {/* Code Block rendering */}
                          {msg.codeSnippet && (
                            <div className="mt-3 bg-[#03060c] border border-slate-850 rounded-xl overflow-hidden font-mono text-[9px] text-cyan-300">
                              <div className="bg-slate-950 px-3 py-1 text-slate-500 text-[8px] font-bold flex justify-between border-b border-slate-900">
                                <span>CODE EXECUTABLE</span>
                                <span>Copy Link</span>
                              </div>
                              <pre className="p-3 overflow-x-auto select-text leading-relaxed"><code className="block select-text">{msg.codeSnippet}</code></pre>
                            </div>
                          )}

                          {/* Message statuses */}
                          <div className="flex items-center justify-end gap-1.5 mt-2.5 -mb-1 text-[8px] font-mono text-slate-500 select-none">
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOwn && <CheckCheck size={10} className="text-emerald-500" />}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input broadcast form */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-800 bg-[#0b0f19]/80 p-4 space-y-3">
                
                {/* Code Snippet input popup */}
                <AnimatePresence>
                  {showCodeInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-3 border-b border-slate-900">
                        <label className="block text-[8px] text-slate-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Paste Code Segment</label>
                        <textarea
                          rows={4}
                          value={codeSnippet}
                          onChange={(e) => setCodeSnippet(e.target.value)}
                          placeholder="// Paste source code files here..."
                          className="w-full bg-[#030712] border border-slate-800 rounded-xl p-3 text-[9px] text-cyan-400 focus:outline-none focus:border-indigo-500/40 font-mono resize-none leading-relaxed"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  {/* Accessories */}
                  <button
                    type="button"
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                  >
                    <Smile size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    className={cn(
                      "p-2.5 border rounded-xl transition-all cursor-pointer",
                      showCodeInput
                        ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                        : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                    )}
                    title="Embed Code Snippet"
                  >
                    <Code size={15} />
                  </button>

                  <input
                    type="text"
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message to squad..."
                    className="flex-1 bg-[#030712] border border-slate-800 focus:border-indigo-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder-slate-500 font-sans"
                  />

                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-lg active:scale-[0.98]"
                  >
                    <Send size={14} />
                  </button>
                </div>

              </form>
            </>
          ) : (
            /* Empty Chat State */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[linear-gradient(to_bottom,rgba(9,13,22,0.6)_0%,rgba(9,13,22,0.9)_100%)]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <MessageSquare size={28} className="text-indigo-400 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Select discussion lobby</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                Choose a communication sector from the sidebar Chats list to initialize the WebSocket timeline or create a new group.
              </p>
            </div>
          )}

        </div>

        {/* ==================== RIGHT INFO DRAWER ==================== */}
        <AnimatePresence>
          {showInfoDrawer && activeCommunity && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-72 border-l border-slate-800 bg-[#0b0f19] h-full flex flex-col overflow-y-auto shrink-0 z-10"
            >
              {/* Drawer Header */}
              <div className="h-16 px-6 border-b border-slate-900 flex items-center justify-between bg-[#0c1220]/60 shrink-0">
                <span className="text-xs font-bold font-mono tracking-wider text-slate-200">GROUP INFO</span>
                <button 
                  onClick={() => setShowInfoDrawer(false)}
                  className="p-1 rounded-md hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Roster Contents */}
              <div className="p-6 space-y-6 text-left">
                
                {/* Visual Avatar detail */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl uppercase bg-gradient-to-br text-white shadow-lg", getAvatarGradient(activeCommunity.name))}>
                    {activeCommunity.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-tight">{activeCommunity.name}</h4>
                    <span className="text-[8px] font-mono text-slate-500">{activeCommunity.description || 'Global Discussion Group'}</span>
                  </div>
                </div>

                {/* Info parameters */}
                <div className="space-y-4 border-t border-slate-900 pt-4">
                  <div>
                    <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Description</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{activeCommunity.description || 'Learn and share code snippets collectively.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-900/60 pt-4">
                    <div>
                      <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">Created By</span>
                      <span className="text-slate-300 font-medium">System Admin</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">Type</span>
                      <span className="text-slate-300 font-medium">Public</span>
                    </div>
                  </div>
                </div>

                {/* Rules Section */}
                <div className="space-y-3 border-t border-slate-900 pt-4">
                  <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-widest font-bold">Discussions Guidelines</span>
                  <ul className="space-y-1.5 text-[10px] text-slate-400 font-sans leading-relaxed">
                    <li className="flex items-start gap-1.5"><Check size={11} className="text-indigo-400 shrink-0 mt-0.5" /> <span>Be supportive and respectful.</span></li>
                    <li className="flex items-start gap-1.5"><Check size={11} className="text-indigo-400 shrink-0 mt-0.5" /> <span>Share valid executable source segments.</span></li>
                    <li className="flex items-start gap-1.5"><Check size={11} className="text-indigo-400 shrink-0 mt-0.5" /> <span>No redundant links or spam messages.</span></li>
                  </ul>
                </div>

                {/* Active Member Roster */}
                <div className="space-y-3 border-t border-slate-900 pt-4">
                  <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-widest font-bold">Channel Roster ({MOCK_MEMBERS.length})</span>
                  
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {MOCK_MEMBERS.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Circle Mini Avatar */}
                          <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[9px] text-slate-400 uppercase">
                            {member.avatar}
                          </div>
                          <span className="text-slate-300 font-medium truncate min-w-0">{member.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[7px] font-bold bg-slate-900 border border-slate-850 px-1 py-0.5 text-slate-500 rounded">LVL {member.level}</span>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full border border-slate-950",
                            member.active ? "bg-emerald-500 shadow shadow-emerald-500/50" : "bg-slate-700"
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ==================== CREATE COMMUNITY OVERLAY MODAL ==================== */}
      <AnimatePresence>
        {showAddChannel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddChannel(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 text-left"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-4">
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">Create Discussion Group</h3>
                <button 
                  onClick={() => setShowAddChannel(false)}
                  className="p-1 rounded-md hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <label className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Group Name</label>
                  <input
                    type="text"
                    required
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. react-champions"
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Description</label>
                  <textarea
                    rows={3}
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    placeholder="e.g. Discussion workspace for advanced React patterns."
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-indigo-500/40 font-sans resize-none leading-relaxed"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddChannel(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-lg active:scale-[0.98]"
                  >
                    Create Channel
                  </button>
                </div>
              </form>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
