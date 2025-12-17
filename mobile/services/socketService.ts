// mobile/services/socketService.ts
import io, { Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { useNotificationsStore } from '../stores/notificationsStore';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://deal-clarity-engine.onrender.com';

let socket: Socket | null = null;

export const socketService = {
  connect: async (userId: string, teamId: string) => {
    if (socket?.connected) {
      socket.emit('join_team', userId, teamId);
      return socket;
    }

    const token = await SecureStore.getItemAsync('authToken');

    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      socket?.emit('join_team', userId, teamId);
    });

    socket.on('notification', (notification) => {
      console.log('Notification received:', notification);
      useNotificationsStore.getState().addNotification(notification);
    });

    socket.on('team_notification', (notification) => {
      console.log('Team notification received:', notification);
      useNotificationsStore.getState().addNotification(notification);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  },

  disconnect: (teamId: string) => {
    if (socket) {
      socket.emit('leave_team', teamId);
      socket.disconnect();
      socket = null;
    }
  },

  on: (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event: string, callback?: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  },

  emit: (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  },

  getSocket: () => socket,

  isConnected: () => socket?.connected || false,
};

export default socketService;
