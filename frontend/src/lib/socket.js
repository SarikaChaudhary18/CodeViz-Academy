import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

let socket = null;

export const socketService = {
  connect: (token) => {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Successfully connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  joinRoom: (roomId) => {
    if (socket?.connected) {
      socket.emit('join_room', roomId);
    }
  },

  leaveRoom: (roomId) => {
    if (socket?.connected) {
      socket.emit('leave_room', roomId);
    }
  },

  sendMessage: (roomId, content, codeSnippet = '') => {
    if (socket?.connected) {
      socket.emit('send_message', {
        communityId: roomId,
        content,
        codeSnippet,
      });
    }
  },

  onMessageReceived: (callback) => {
    if (socket) {
      socket.on('receive_message', callback);
    }
    return () => socket?.off('receive_message', callback);
  },

  onError: (callback) => {
    if (socket) {
      socket.on('error', callback);
    }
    return () => socket?.off('error', callback);
  },

  // --- NOTIFICATION LISTENERS ---
  onNotification: (callback) => {
    if (socket) {
      socket.on('notification', callback);
    }
    return () => socket?.off('notification', callback);
  },

  // --- WebRTC VIDEO CALL SIGNALING ---
  requestCall: (targetUserId, callerName, callerId) => {
    if (socket?.connected) {
      socket.emit('call_request', { targetUserId, callerName, callerId });
    }
  },

  acceptCall: (callerSocketId) => {
    if (socket?.connected) {
      socket.emit('call_accept', { callerSocketId });
    }
  },

  rejectCall: (callerSocketId) => {
    if (socket?.connected) {
      socket.emit('call_reject', { callerSocketId });
    }
  },

  endCall: (peerSocketId) => {
    if (socket?.connected) {
      socket.emit('call_end', { peerSocketId });
    }
  },

  sendOffer: (targetSocketId, offer) => {
    if (socket?.connected) {
      socket.emit('webrtc_offer', { targetSocketId, offer });
    }
  },

  sendAnswer: (targetSocketId, answer) => {
    if (socket?.connected) {
      socket.emit('webrtc_answer', { targetSocketId, answer });
    }
  },

  sendIceCandidate: (targetSocketId, candidate) => {
    if (socket?.connected) {
      socket.emit('webrtc_ice_candidate', { targetSocketId, candidate });
    }
  },

  onIncomingCall: (callback) => {
    if (socket) {
      socket.on('incoming_call', callback);
    }
    return () => socket?.off('incoming_call', callback);
  },

  onCallAccepted: (callback) => {
    if (socket) {
      socket.on('call_accepted', callback);
    }
    return () => socket?.off('call_accepted', callback);
  },

  onCallRejected: (callback) => {
    if (socket) {
      socket.on('call_rejected', callback);
    }
    return () => socket?.off('call_rejected', callback);
  },

  onCallEnded: (callback) => {
    if (socket) {
      socket.on('call_ended', callback);
    }
    return () => socket?.off('call_ended', callback);
  },

  onWebRTCOffer: (callback) => {
    if (socket) {
      socket.on('webrtc_offer', callback);
    }
    return () => socket?.off('webrtc_offer', callback);
  },

  onWebRTCAnswer: (callback) => {
    if (socket) {
      socket.on('webrtc_answer', callback);
    }
    return () => socket?.off('webrtc_answer', callback);
  },

  onIceCandidate: (callback) => {
    if (socket) {
      socket.on('webrtc_ice_candidate', callback);
    }
    return () => socket?.off('webrtc_ice_candidate', callback);
  },

  getSocketId: () => socket?.id || null,

  // --- COLLABORATIVE WORKSPACE ACTIONS ---
  emitCollabCodeChange: (roomId, code) => {
    if (socket?.connected) {
      socket.emit('collab_code_change', { roomId, code });
    }
  },

  emitCollabChatSend: (roomId, text) => {
    if (socket?.connected) {
      socket.emit('collab_chat_send', { roomId, text });
    }
  },

  onCollabCodeReceived: (callback) => {
    if (socket) {
      socket.on('receive_collab_code', callback);
    }
    return () => socket?.off('receive_collab_code', callback);
  },

  onCollabChatReceived: (callback) => {
    if (socket) {
      socket.on('receive_collab_chat', callback);
    }
    return () => socket?.off('receive_collab_chat', callback);
  },

  // --- MATCHMAKING & MULTIPLAYER GAME ACTIONS ---
  joinMatchmaking: (level) => {
    if (socket?.connected) {
      socket.emit('join_matchmaking', { level });
    }
  },

  leaveMatchmaking: () => {
    if (socket?.connected) {
      socket.emit('leave_matchmaking');
    }
  },

  onMatchFound: (callback) => {
    if (socket) {
      socket.on('match_found', callback);
    }
    return () => socket?.off('match_found', callback);
  },

  emitGameEvent: (roomId, eventType, payload) => {
    if (socket?.connected) {
      socket.emit('game_event_send', { roomId, eventType, payload });
    }
  },

  onGameEventReceived: (callback) => {
    if (socket) {
      socket.on('receive_game_event', callback);
    }
    return () => socket?.off('receive_game_event', callback);
  }
};
