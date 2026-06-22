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
};
