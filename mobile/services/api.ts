// mobile/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deal-clarity-engine.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await SecureStore.deleteItemAsync('authToken');
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token } = response.data;
    await SecureStore.setItemAsync('authToken', token);
    return response.data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
  },

  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    const { token } = response.data;
    if (token) {
      await SecureStore.setItemAsync('authToken', token);
    }
    return response.data;
  },

  // Deals
  getDeals: async (filters?: any) => {
    return apiClient.get('/deals', { params: filters });
  },

  getDealById: async (id: string) => {
    return apiClient.get(`/deals/${id}`);
  },

  createDeal: async (dealData: any) => {
    return apiClient.post('/deals', dealData);
  },

  updateDeal: async (id: string, dealData: any) => {
    return apiClient.patch(`/deals/${id}`, dealData);
  },

  deleteDeal: async (id: string) => {
    return apiClient.delete(`/deals/${id}`);
  },

  // Tasks
  getTasks: async (filters?: any) => {
    return apiClient.get('/tasks', { params: filters });
  },

  getTaskById: async (id: string) => {
    return apiClient.get(`/tasks/${id}`);
  },

  createTask: async (taskData: any) => {
    return apiClient.post('/tasks', taskData);
  },

  updateTask: async (id: string, taskData: any) => {
    return apiClient.patch(`/tasks/${id}`, taskData);
  },

  completeTask: async (id: string) => {
    return apiClient.patch(`/tasks/${id}`, { status: 'completed' });
  },

  // Contacts
  getContacts: async (filters?: any) => {
    return apiClient.get('/contacts', { params: filters });
  },

  getContactById: async (id: string) => {
    return apiClient.get(`/contacts/${id}`);
  },

  createContact: async (contactData: any) => {
    return apiClient.post('/contacts', contactData);
  },

  updateContact: async (id: string, contactData: any) => {
    return apiClient.patch(`/contacts/${id}`, contactData);
  },

  // Analytics
  getAnalytics: async (filters?: any) => {
    return apiClient.get('/analytics/summary', { params: filters });
  },

  getPipeline: async () => {
    return apiClient.get('/analytics/pipeline');
  },

  getVelocity: async () => {
    return apiClient.get('/analytics/velocity');
  },

  // Notifications
  getNotifications: async (filters?: any) => {
    return apiClient.get('/notifications', { params: filters });
  },

  markNotificationRead: async (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllNotificationsRead: async () => {
    return apiClient.patch('/notifications/mark-all/read');
  },

  // Teams
  getTeamMembers: async () => {
    return apiClient.get('/teams/members');
  },

  getTeamDetails: async () => {
    return apiClient.get('/teams/details');
  },

  // User
  getProfile: async () => {
    return apiClient.get('/auth/me');
  },

  updateProfile: async (userData: any) => {
    return apiClient.patch('/auth/me', userData);
  },
};

export default apiClient;
