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
