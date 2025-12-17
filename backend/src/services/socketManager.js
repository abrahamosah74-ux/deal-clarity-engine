// backend/src/services/socketManager.js
const Notification = require('../models/Notification');

class SocketManager {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> socket.id
    this.teamRooms = new Map(); // teamId -> [users]
  }

  /**
   * Initialize Socket.io connection handlers
   */
  initializeHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // User joins team rooms
      socket.on('join_team', (userId, teamId) => {
        this.userSockets.set(userId, socket.id);
        socket.join(`team-${teamId}`);
        console.log(`User ${userId} joined team ${teamId}`);
      });

      // User leaves team
      socket.on('leave_team', (teamId) => {
        socket.leave(`team-${teamId}`);
        console.log(`User left team ${teamId}`);
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        // Find and remove user from map
        for (const [userId, socketId] of this.userSockets) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            console.log(`User ${userId} disconnected`);
            break;
          }
        }
      });

      // Acknowledge connection
      socket.emit('connected', { socketId: socket.id });
    });
  }

  /**
   * Send notification to a user
   */
  async notifyUser(userId, notification) {
    const socketId = this.userSockets.get(userId);

    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  /**
   * Send notification to entire team
   */
  async notifyTeam(teamId, notification, excludeUserId = null) {
    const event = {
      ...notification,
      timestamp: new Date()
    };

    if (excludeUserId) {
      const senderSocketId = this.userSockets.get(excludeUserId);
      if (senderSocketId) {
        this.io.to(`team-${teamId}`).except(senderSocketId).emit('team_notification', event);
      } else {
        this.io.to(`team-${teamId}`).emit('team_notification', event);
      }
    } else {
      this.io.to(`team-${teamId}`).emit('team_notification', event);
    }
  }

  /**
   * Send real-time update to team
   */
  async broadcastUpdate(teamId, updateType, data, excludeUserId = null) {
    const event = {
      type: updateType,
      data,
      timestamp: new Date()
    };

    if (excludeUserId) {
      const senderSocketId = this.userSockets.get(excludeUserId);
      if (senderSocketId) {
        this.io.to(`team-${teamId}`).except(senderSocketId).emit('update', event);
      } else {
        this.io.to(`team-${teamId}`).emit('update', event);
      }
    } else {
      this.io.to(`team-${teamId}`).emit('update', event);
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(teamId, userId, isTyping) {
    this.io.to(`team-${teamId}`).emit('user_typing', {
      userId,
      isTyping,
      timestamp: new Date()
    });
  }
}

module.exports = SocketManager;
