// frontend/src/hooks/useNotifications.js
import { useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socket';

export const useNotifications = (userId, teamId) => {
  const notificationHandlers = useRef({});

  useEffect(() => {
    if (!userId || !teamId) return;

    // Connect to socket
    const socket = socketService.connect(userId, teamId);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketService.disconnect(teamId);
    };
  }, [userId, teamId]);

  const onNotification = useCallback((event, callback) => {
    if (!notificationHandlers.current[event]) {
      notificationHandlers.current[event] = [];
    }
    notificationHandlers.current[event].push(callback);

    socketService.on(event, callback);

    return () => {
      socketService.off(event, callback);
      notificationHandlers.current[event] = notificationHandlers.current[event].filter(
        cb => cb !== callback
      );
    };
  }, []);

  const offNotification = useCallback((event) => {
    if (notificationHandlers.current[event]) {
      notificationHandlers.current[event].forEach(callback => {
        socketService.off(event, callback);
      });
      delete notificationHandlers.current[event];
    }
  }, []);

  return {
    onNotification,
    offNotification,
    socketService
  };
};
