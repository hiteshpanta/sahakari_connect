const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

let io = null;

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx > -1) cookies[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  });
  return cookies;
}

function initSocket(httpServer) {
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true
    }
  });

  // Authenticate every socket with the same JWT used by the REST API. The
  // token can arrive via `socket.handshake.auth.token` or the accessToken
  // httpOnly cookie used by the main app.
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers?.cookie);
      const token = socket.handshake.auth?.token || cookies.accessToken;
      if (!token) return next(new Error('Not authorized'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Not authorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    // Personal room for targeted pushes.
    socket.join(`user:${user._id.toString()}`);
    // Cooperative room so staff/members of a coop see live activity.
    if (user.cooperativeId) {
      socket.join(`coop:${user.cooperativeId.toString()}`);
    }
    // Platform admins get a global room.
    if (user.role === 'admin') {
      socket.join('admins');
    }

    logger.info(`Socket connected: ${user.email} (${user.role})`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${user.email}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(event, payload);
}

function emitToCooperative(cooperativeId, event, payload) {
  if (!io || !cooperativeId) return;
  io.to(`coop:${cooperativeId.toString()}`).emit(event, payload);
}

function emitToAdmins(event, payload) {
  if (!io) return;
  io.to('admins').emit(event, payload);
}

function emitAll(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

// Emit to the platform user who owns a given Customer record.
async function emitToCustomerUser(customerId, event, payload) {
  if (!io || !customerId) return;
  try {
    const user = await User.findOne({ customerId }).select('_id');
    if (user) emitToUser(user._id, event, payload);
  } catch (err) {
    logger.error('emitToCustomerUser failed:', err);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToCooperative,
  emitToAdmins,
  emitAll,
  emitToCustomerUser
};
