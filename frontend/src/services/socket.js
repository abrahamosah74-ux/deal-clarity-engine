// frontend/src/services/socket.js
import io from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://deal-clarity-engine.onrender.com';

let socket = null;

export const socketService = {
  connect: (userId, teamId) => {
    if (socket?.connected) {
      socket.emit('join_team', userId, teamId);
      return socket;
    }

    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join_team', userId, teamId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  },

  disconnect: (teamId) => {
    if (socket) {
      socket.emit('leave_team', teamId);
    }
  },

  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  },

  emit: (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  },

  getSocket: () => socket,

  isConnected: () => socket?.connected || false
};

export default socketService;
