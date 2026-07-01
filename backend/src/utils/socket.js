const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const logger = require('../config/logger');

let io = null;
const matchmakingQueue = []; // Queue storing { userId, username, level, socket }

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // Handshake Authorization Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication failed. No token provided.'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'studyquest_access_jwt_secret_key');
      socket.user = decoded;
      next();
    } catch (err) {
      logger.warn(`Unauthorized WebSocket connection attempt: ${err.message}`);
      next(new Error('Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket Client connected: ${socket.user.username} (ID: ${socket.user.id})`);

    // Auto-join personal user room for targeted notifications & call signaling
    const personalRoom = `user:${socket.user.id}`;
    socket.join(personalRoom);
    logger.debug(`User ${socket.user.username} auto-joined personal room: ${personalRoom}`);

    // Join Room (e.g. Community channel or collab room)
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      logger.debug(`User ${socket.user.username} joined WebSocket room: ${roomId}`);
    });

    // Leave Room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      logger.debug(`User ${socket.user.username} left WebSocket room: ${roomId}`);
    });

    // Incoming Message Broadcast
    socket.on('send_message', async (data) => {
      const { communityId, content, codeSnippet } = data;

      if (!communityId || !content) {
        return socket.emit('error', 'Message payload incomplete.');
      }

      try {
        const newMessage = await Message.create({
          senderId: socket.user.id,
          communityId,
          content,
          codeSnippet: codeSnippet || '',
        });

        const populatedMessage = await newMessage.populate('senderId', 'username level avatarColor');
        io.to(communityId).emit('receive_message', populatedMessage);
        logger.debug(`Message sent in room ${communityId} by ${socket.user.username}`);
      } catch (err) {
        logger.error(`Error broadcasting Socket message: ${err.message}`);
        socket.emit('error', 'Failed to deliver message.');
      }
    });

    // --- COLLABORATIVE CODING SYNC EVENTS ---
    socket.on('collab_code_change', (data) => {
      const { roomId, code } = data;
      socket.to(roomId).emit('receive_collab_code', { code, sender: socket.user.username });
    });

    socket.on('collab_chat_send', (data) => {
      const { roomId, text } = data;
      io.to(roomId).emit('receive_collab_chat', { text, user: socket.user.username });
    });

    // --- WebRTC VIDEO CALL SIGNALING ---
    // Caller sends a call request to a specific user
    socket.on('call_request', (data) => {
      const { targetUserId, callerName, callerId } = data;
      const targetRoom = `user:${targetUserId}`;
      socket.to(targetRoom).emit('incoming_call', {
        callerId: callerId || socket.user.id,
        callerName: callerName || socket.user.username,
        socketId: socket.id,
      });
      logger.debug(`Call request from ${socket.user.username} to user:${targetUserId}`);
    });

    // Callee accepts and sends back their socket id so ICE/offer can flow
    socket.on('call_accept', (data) => {
      const { callerSocketId } = data;
      socket.to(callerSocketId).emit('call_accepted', {
        answererSocketId: socket.id,
        answererName: socket.user.username,
        answererId: socket.user.id,
      });
    });

    // Callee rejects
    socket.on('call_reject', (data) => {
      const { callerSocketId } = data;
      socket.to(callerSocketId).emit('call_rejected', {
        reason: 'User declined the call.',
      });
    });

    // End the ongoing call (notify both peers)
    socket.on('call_end', (data) => {
      const { peerSocketId } = data;
      if (peerSocketId) {
        socket.to(peerSocketId).emit('call_ended');
      }
    });

    // WebRTC Offer (from caller to callee after call_accept)
    socket.on('webrtc_offer', (data) => {
      const { targetSocketId, offer } = data;
      socket.to(targetSocketId).emit('webrtc_offer', {
        offer,
        senderSocketId: socket.id,
      });
    });

    // WebRTC Answer (from callee back to caller)
    socket.on('webrtc_answer', (data) => {
      const { targetSocketId, answer } = data;
      socket.to(targetSocketId).emit('webrtc_answer', {
        answer,
        senderSocketId: socket.id,
      });
    });

    // ICE Candidate exchange
    socket.on('webrtc_ice_candidate', (data) => {
      const { targetSocketId, candidate } = data;
      socket.to(targetSocketId).emit('webrtc_ice_candidate', {
        candidate,
        senderSocketId: socket.id,
      });
    });

    // --- RANDOM MATCHMAKING LOBBY ---
    socket.on('join_matchmaking', (data) => {
      const { level } = data;
      
      // Prevent duplicates in queue
      const exists = matchmakingQueue.some(item => item.userId === socket.user.id);
      if (exists) return;

      matchmakingQueue.push({
        userId: socket.user.id,
        username: socket.user.username,
        level: level || 1,
        socket: socket
      });

      logger.info(`User ${socket.user.username} joined matchmaking. Queue size: ${matchmakingQueue.length}`);

      if (matchmakingQueue.length >= 2) {
        const player1 = matchmakingQueue.shift();
        const player2 = matchmakingQueue.shift();

        const matchRoomId = `game_room_${player1.userId}_${player2.userId}_${Date.now()}`;
        
        player1.socket.join(matchRoomId);
        player2.socket.join(matchRoomId);

        // Notify both players of matchmaking success
        player1.socket.emit('match_found', {
          matchRoomId,
          opponent: { name: player2.username, level: player2.level }
        });

        player2.socket.emit('match_found', {
          matchRoomId,
          opponent: { name: player1.username, level: player1.level }
        });

        logger.info(`Match found! Created room ${matchRoomId} between ${player1.username} and ${player2.username}`);
      }
    });

    socket.on('leave_matchmaking', () => {
      const idx = matchmakingQueue.findIndex(item => item.userId === socket.user.id);
      if (idx !== -1) {
        matchmakingQueue.splice(idx, 1);
        logger.info(`User ${socket.user.username} left matchmaking queue.`);
      }
    });

    // --- MULTIPLAYER GAME EVENTS ---
    socket.on('game_event_send', (data) => {
      const { roomId, eventType, payload } = data;
      socket.to(roomId).emit('receive_game_event', { eventType, payload, sender: socket.user.username });
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket Client disconnected: ${socket.user.username}`);
      // Remove from matchmaking queue on disconnect
      const idx = matchmakingQueue.findIndex(item => item.userId === socket.user.id);
      if (idx !== -1) {
        matchmakingQueue.splice(idx, 1);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
