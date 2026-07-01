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

// Avatar gradient list - matching orange-white theme
const AVATAR_GRADIENTS = [
  "from-orange-500 to-amber-500",
  "from-red-500 to-orange-500",
  "from-yellow-500 to-amber-500",
  "from-rose-500 to-orange-500",
  "from-orange-600 to-red-600",
  "from-amber-600 to-yellow-600"
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
      
      {/* Header HUD - Orange Accent */}
      <div className="border-b border-zinc-200 pb-4 text-left">
        <h2 className="text-3xl font-black tracking-tight text-zinc-950 flex items-center gap-2">
          <MessageSquare className="text-orange-600 w-8 h-8" />
          COMMUNITY SECTORS
        </h2>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Join discussion chambers, share syntax snippets, and collaborate with your squad in real-time
        </p>
      </div>

      {/* Main WhatsApp-Style Split Layout Frame */}
      <div className="flex border border-zinc-200 rounded-2xl overflow-hidden bg-white h-[620px] shadow-sm relative">
        
        {/* ==================== LEFT SIDEBAR ==================== */}
        <div className="w-80 border-r border-zinc-200 flex flex-col bg-zinc-50/50 shrink-0 h-full">
          
          {/* Sidebar Top Search & Actions */}
          <div className="p-4 space-y-4 border-b border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono tracking-wider text-zinc-700">CHATS</span>
              <button
                onClick={() => setShowAddChannel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg border border-orange-500/20 text-[10px] font-bold font-mono cursor-pointer transition-all active:scale-[0.98]"
              >
                <Plus size={12} />
                <span>Create Group</span>
              </button>
            </div>

            {/* Local Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="w-full bg-white border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all font-sans"
              />
            </div>
          </div>

          {/* Category Quick Chips */}
          <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50/30 flex gap-1.5 overflow-x-auto scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase shrink-0 transition-all cursor-pointer border",
                  selectedCategory === cat
                    ? "bg-orange-50 border-orange-200 text-orange-700"
                    : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Communities Channels List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 pr-1.5 scrollbar-thin scrollbar-thumb-zinc-200">
            {communitiesLoading ? (
              <div className="text-center py-8 text-[10px] font-mono text-zinc-400 uppercase animate-pulse">Loading discussion sectors...</div>
            ) : filteredCommunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <MessageSquare size={18} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold font-mono text-zinc-600 uppercase tracking-wider">
                    {searchQuery ? 'No groups found' : 'No groups yet'}
                  </p>
                  <p className="text-[9px] text-zinc-400 font-mono mt-1">
                    {searchQuery ? 'Try a different search' : 'Create the first discussion group!'}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    onClick={() => setShowAddChannel(true)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[9px] font-bold font-mono transition-all cursor-pointer"
                  >
                    + Create Group
                  </button>
                )}
              </div>
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
                        ? "bg-orange-50/40 border-orange-500"
                        : "border-transparent hover:bg-zinc-100/40"
                    )}
                  >
                    {/* Circle Avatar (First Letter) */}
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-sm uppercase shrink-0 bg-gradient-to-br text-white", gradient)}>
                      {chan.name.charAt(0)}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-zinc-900 truncate">{chan.name}</span>
                        <span className="text-[8px] font-mono text-zinc-400">Live</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate leading-snug">
                        {chan.description || `Discussing ${chan.name}`}
                      </p>
                    </div>

                    {/* Online status indicator */}
                    <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 border border-white shadow shadow-green-500/50" />
                  </button>
                );
              })
            )}
          </div>

          {/* Connected Roster Status */}
          <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-center gap-1.5 text-[8px] font-mono text-zinc-400 uppercase tracking-widest cursor-default">
            <Users size={11} className="text-orange-500" />
            <span>Active WebSockets Session</span>
          </div>

        </div>

        {/* ==================== CENTER CHAT WINDOW ==================== */}
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
          
          {activeCommunity ? (
            <>
              {/* Chat Window Header */}
              <div className="h-16 border-b border-zinc-200 px-6 flex items-center justify-between bg-zinc-50">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                >
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-black text-xs uppercase bg-gradient-to-br text-white shrink-0", getAvatarGradient(activeCommunity.name))}>
                    {activeCommunity.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">{activeCommunity.name}</span>
                    <span className="block text-[8px] text-zinc-500 font-mono">Real-time messaging active</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                    className={cn(
                      "p-2 rounded-lg border transition-all cursor-pointer",
                      showInfoDrawer
                        ? "bg-orange-50 border-orange-200 text-orange-650"
                        : "bg-white border-zinc-200 text-zinc-955 hover:text-zinc-955"
                    )}
                    title="Toggle Group Information"
                  >
                    <Info size={14} />
                  </button>
                  <button className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>

              {/* Chat Stream Log */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/20 scrollbar-thin scrollbar-thumb-zinc-200">
                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-400 font-mono uppercase tracking-widest animate-pulse">Syncing timeline logs...</div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-xs font-mono uppercase tracking-widest gap-2">
                    <MessageSquare size={16} className="text-zinc-300" />
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
                        <div className="flex items-center gap-1.5 mb-1.5 text-[8px] font-mono text-zinc-400">
                          {!isOwn && <span className="font-bold text-zinc-700">{senderName}</span>}
                          <span className="px-1.5 bg-orange-100 text-orange-700 rounded text-[7px] font-bold">LVL {senderLevel}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* WhatsApp-Style Bubble */}
                        <div className={cn(
                          "p-3 rounded-2xl max-w-md text-xs leading-relaxed border relative text-left",
                          isOwn
                            ? "bg-orange-50 border-orange-200/80 text-zinc-900 rounded-tr-none"
                            : "bg-white border-zinc-200 text-zinc-900 rounded-tl-none shadow-sm"
                        )}>
                          <p className="font-sans whitespace-pre-wrap select-text">{msg.content}</p>
                          
                          {/* Code Block rendering */}
                          {msg.codeSnippet && (
                            <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden font-mono text-[9px] text-orange-300">
                              <div className="bg-zinc-950 px-3 py-1 text-zinc-500 text-[8px] font-bold flex justify-between border-b border-zinc-850">
                                <span className="text-zinc-400">SOURCE CODE SNIPPET</span>
                              </div>
                              <pre className="p-3 overflow-x-auto select-text leading-relaxed text-zinc-100"><code className="block select-text">{msg.codeSnippet}</code></pre>
                            </div>
                          )}

                          {/* Message statuses */}
                          <div className="flex items-center justify-end gap-1 mt-2.5 -mb-1 text-[8px] font-mono text-zinc-400 select-none">
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOwn && <CheckCheck size={10} className="text-orange-500" />}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input broadcast form */}
              <form onSubmit={handleSendMessage} className="border-t border-zinc-200 bg-zinc-50 p-4 space-y-3">
                
                {/* Code Snippet input popup */}
                <AnimatePresence>
                  {showCodeInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-3 border-b border-zinc-200">
                        <label className="block text-[8px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Paste Code Segment</label>
                        <textarea
                          rows={4}
                          value={codeSnippet}
                          onChange={(e) => setCodeSnippet(e.target.value)}
                          placeholder="// Paste source code files here..."
                          className="w-full bg-white border border-zinc-250 rounded-xl p-3 text-[9px] text-zinc-700 focus:outline-none focus:border-orange-500 font-mono resize-none leading-relaxed"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  {/* Accessories */}
                  <button
                    type="button"
                    className="p-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-zinc-400 hover:text-zinc-600 transition-all cursor-pointer"
                  >
                    <Smile size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    className={cn(
                      "p-2.5 border rounded-xl transition-all cursor-pointer",
                      showCodeInput
                        ? "bg-orange-50 border-orange-200 text-orange-655"
                        : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-600"
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
                    className="flex-1 bg-white border border-zinc-250 focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none placeholder-zinc-400 font-sans"
                  />

                  <button
                    type="submit"
                    className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow active:scale-[0.98]"
                  >
                    <Send size={14} />
                  </button>
                </div>

              </form>
            </>
          ) : (
            /* Empty Chat State */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-zinc-50/10">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-6">
                <MessageSquare size={28} className="text-orange-600 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-zinc-950 uppercase tracking-wider font-mono">Select discussion lobby</h4>
              <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
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
              className="w-72 border-l border-zinc-200 bg-zinc-50 h-full flex flex-col overflow-y-auto shrink-0 z-10"
            >
              {/* Drawer Header */}
              <div className="h-16 px-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 shrink-0">
                <span className="text-xs font-bold font-mono tracking-wider text-zinc-700">GROUP INFO</span>
                <button 
                  onClick={() => setShowInfoDrawer(false)}
                  className="p-1 rounded-md hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Roster Contents */}
              <div className="p-6 space-y-6 text-left">
                
                {/* Visual Avatar detail */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl uppercase bg-gradient-to-br text-white shadow shrink-0", getAvatarGradient(activeCommunity.name))}>
                    {activeCommunity.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-tight">{activeCommunity.name}</h4>
                    <span className="text-[8px] font-mono text-zinc-500">{activeCommunity.description || 'Global Discussion Group'}</span>
                  </div>
                </div>

                {/* Info parameters */}
                <div className="space-y-4 border-t border-zinc-200 pt-4">
                  <div>
                    <span className="block text-[8px] text-zinc-400 font-mono uppercase tracking-widest mb-1.5 font-bold">Description</span>
                    <p className="text-[11px] text-zinc-700 leading-relaxed font-sans">{activeCommunity.description || 'Learn and share code snippets collectively.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-zinc-200 pt-4">
                    <div>
                      <span className="block text-[8px] text-zinc-400 font-bold uppercase mb-0.5">Created By</span>
                      <span className="text-zinc-700 font-medium">System Admin</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-zinc-400 font-bold uppercase mb-0.5">Type</span>
                      <span className="text-zinc-700 font-medium">Public</span>
                    </div>
                  </div>
                </div>

                {/* Rules Section */}
                <div className="space-y-3 border-t border-zinc-200 pt-4">
                  <span className="block text-[8px] text-zinc-400 font-mono uppercase tracking-widest font-bold">Discussions Guidelines</span>
                  <ul className="space-y-1.5 text-[10px] text-zinc-500 font-sans leading-relaxed">
                    <li className="flex items-start gap-1.5"><Check size={11} className="text-orange-500 shrink-0 mt-0.5" /> <span>Be supportive and respectful.</span></li>
                    <li className="flex items-start gap-1.5"><Check size={11} className="text-orange-500 shrink-0 mt-0.5" /> <span>Share valid executable source segments.</span></li>
                    <li className="flex items-start gap-1.5"><Check size={11} className="text-orange-500 shrink-0 mt-0.5" /> <span>No redundant links or spam messages.</span></li>
                  </ul>
                </div>

                {/* Active Member Roster — Real DB Members */}
                <div className="space-y-3 border-t border-zinc-200 pt-4">
                  <span className="block text-[8px] text-zinc-400 font-mono uppercase tracking-widest font-bold">
                    Channel Roster ({activeCommunity.members?.length || 0})
                  </span>
                  
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {activeCommunity.members && activeCommunity.members.length > 0 ? (
                      activeCommunity.members.map((member, idx) => (
                        <div key={member._id || idx} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Circle Mini Avatar with avatarColor */}
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] text-white uppercase shrink-0"
                              style={{ backgroundColor: member.avatarColor || '#f97316' }}
                            >
                              {member.username ? member.username.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="text-zinc-700 font-medium truncate min-w-0">{member.username}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[7px] font-bold bg-zinc-100 border border-zinc-200 px-1 py-0.5 text-zinc-550 rounded">LVL {member.level || 1}</span>
                            {/* Online dot — green if they are the current user */}
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 border border-white" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[9px] text-zinc-400 font-mono uppercase">No members found.</div>
                    )}
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
              className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl p-6 overflow-hidden z-10 text-left"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-zinc-150 pb-4 mb-4">
                <h3 className="text-sm font-bold font-mono text-zinc-900 uppercase tracking-wider">Create Discussion Group</h3>
                <button 
                  onClick={() => setShowAddChannel(false)}
                  className="p-1 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <label className="block text-[9px] text-zinc-400 font-mono uppercase tracking-widest mb-1.5 font-bold">Group Name</label>
                  <input
                    type="text"
                    required
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. react-champions"
                    className="w-full bg-white border border-zinc-250 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-zinc-400 font-mono uppercase tracking-widest mb-1.5 font-bold">Description</label>
                  <textarea
                    rows={3}
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    placeholder="e.g. Discussion workspace for advanced React patterns."
                    className="w-full bg-white border border-zinc-250 rounded-xl p-3.5 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 font-sans resize-none leading-relaxed"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddChannel(false)}
                    className="px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-800 font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow active:scale-[0.98]"
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
