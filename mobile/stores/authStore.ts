// mobile/stores/authStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  team: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isSignedIn: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.login(email, password);
      const profileResponse = await api.getProfile();
      
      set({
        user: profileResponse.data.user,
        isSignedIn: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isSignedIn: false,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.logout();
      set({
        user: null,
        isSignedIn: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  restoreToken: async () => {
    try {
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('authToken');
      
      if (token) {
        const response = await api.getProfile();
        set({
          user: response.data.user,
          isSignedIn: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isSignedIn: false,
          isLoading: false,
        });
      }
    } catch (_error: any) {
      set({
        user: null,
        isSignedIn: false,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
