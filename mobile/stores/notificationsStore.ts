// mobile/stores/notificationsStore.ts
import { create } from 'zustand';
import { api } from '../services/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  link?: {
    resource: string;
    resourceId: string;
  };
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (filters?: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
  addNotification: (notification: Notification) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.getNotifications(filters);
      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark as read',
      });
    }
  },

  markAllAsRead: async () => {
    try {
      await api.markAllNotificationsRead();
      set((state: any) => ({
        notifications: state.notifications.map((n: any) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark all as read',
      });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
