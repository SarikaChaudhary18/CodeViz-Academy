const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const logger = require('../config/logger');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // Scale readiness hook: Redis adapter registration placeholder
  // if (process.env.REDIS_URL) {
  //   const { createClient } = require('redis');
  //   const { createAdapter } = require('@socket.io/redis-adapter');
  //   const pubClient = createClient({ url: process.env.REDIS_URL });
  //   const subClient = pubClient.duplicate();
  //   io.adapter(createAdapter(pubClient, subClient));
  // }

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

    // Join Room (e.g. Community channel)
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
        // Save to Database asynchronously
        const newMessage = await Message.create({
          senderId: socket.user.id,
          communityId,
          content,
          codeSnippet: codeSnippet || '',
        });

        // Populate sender details for rendering
        const populatedMessage = await newMessage.populate('senderId', 'username level');

        // Broadcast to all clients in the room
        io.to(communityId).emit('receive_message', populatedMessage);
        
        logger.debug(`Message sent in room ${communityId} by ${socket.user.username}`);
      } catch (err) {
        logger.error(`Error broadcasting Socket message: ${err.message}`);
        socket.emit('error', 'Failed to deliver message.');
      }
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket Client disconnected: ${socket.user.username}`);
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
