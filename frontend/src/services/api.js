import axios from 'axios';
import { toast } from 'react-hot-toast';

// Use REACT_APP_API_URL for Create React App (not Vite)
// For production on Vercel, this MUST be hardcoded because env vars are only available at runtime, not build time
const getApiUrl = () => {
  // If localhost is in the window href, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Development check (npm start)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }
  // Production - must hardcode the Render API URL
  return 'https://deal-clarity-engine.onrender.com/api';
};

const API_URL = getApiUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp
    config.headers['X-Request-Timestamp'] = Date.now();
    
    console.log('📤 API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      data: config.data,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    // You can add response processing here
    return response.data;
  },
  (error) => {
    const { response, config, message } = error;
    
    console.error('❌ API Error:', {
      status: response?.status,
      statusText: response?.statusText,
      url: config?.url || response?.config?.url,
      baseURL: config?.baseURL,
      data: response?.data,
      message: message,
      fullError: error
    });
    
    console.warn('🔍 API Configuration:', {
      API_URL: API_URL,
      environment: process.env.NODE_ENV
    });
    
    if (!response) {
      toast.error('Network error. Please check your connection and that the API is running at: ' + API_URL);
      return Promise.reject(new Error('Network error'));
    }
    
    const { status, data } = response;
    
    switch (status) {
      case 401:
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        break;
        
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
        
      case 404:
        toast.error('Resource not found.');
        break;
        
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
        
      case 500:
        toast.error('Server error. Please try again later.');
        break;
        
      default:
        if (data?.error) {
          toast.error(data.error);
        } else {
          toast.error('An unexpected error occurred.');
        }
    }
    
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Calendar API methods
export const calendarAPI = {
  getEvents: (params) => api.get('/calendar/events', { params }),
  getEvent: (eventId) => api.get(`/calendar/events/${eventId}`),
  connect: (data) => api.post('/calendar/connect', data),
  disconnect: () => api.post('/calendar/disconnect')
};

// Commitments API methods
export const commitmentsAPI = {
  create: (data) => api.post('/commitments', data),
  getStats: () => api.get('/commitments/stats'),
  getRecent: (limit) => api.get('/commitments/recent', { params: { limit } }),
  getById: (id) => api.get(`/commitments/${id}`),
  update: (id, data) => api.put(`/commitments/${id}`, data),
  sendEmail: (id, emailData) => api.post(`/commitments/${id}/send-email`, emailData),
  undo: (id, data) => api.post(`/commitments/${id}/undo`, data),
  list: (params) => api.get('/commitments', { params })
};

// CRM API methods
export const crmAPI = {
  connect: (data) => api.post('/crm/connect', data),
  disconnect: () => api.post('/crm/disconnect'),
  getDeals: () => api.get('/crm/deals'),
  searchDeals: (email) => api.get('/crm/deals/search', { params: { email } }),
  syncDeal: (dealId) => api.post(`/crm/deals/${dealId}/sync`)
};

// Email API methods
export const emailAPI = {
  sendTest: (data) => api.post('/email/test', data),
  getTemplates: () => api.get('/email/templates'),
  updateSettings: (data) => api.post('/email/settings', data)
};

// Subscription API methods
export const subscriptionAPI = {
  initializePayment: (data) => api.post('/subscriptions/initialize', data),
  verifyPayment: (reference, plan) => api.get(`/subscriptions/verify/${reference}?plan=${plan}`),
  getStatus: () => api.get('/subscriptions/status'),
  cancel: () => api.post('/subscriptions/cancel'),
  updatePlan: (plan) => api.post('/subscriptions/update-plan', { plan })
};

// Manager API methods
export const managerAPI = {
  getTeamStats: () => api.get('/manager/team-stats'),
  getLowClarityDeals: () => api.get('/manager/low-clarity-deals'),
  getRepPerformance: (repId) => api.get(`/manager/reps/${repId}/performance`),
  getPipelineHealth: () => api.get('/manager/pipeline-health')
};

// Upload API methods
export const uploadAPI = {
  uploadTranscript: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/transcript', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  uploadRecording: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/recording', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Health check
export const healthCheck = () => api.get('/health');

// Export api instance as named export for newer components
export { api };

export default {
  // Default instance for custom requests
  instance: api,
  
  // Named exports for easy imports
  auth: authAPI,
  calendar: calendarAPI,
  commitments: commitmentsAPI,
  crm: crmAPI,
  email: emailAPI,
  subscription: subscriptionAPI,
  manager: managerAPI,
  upload: uploadAPI,
  healthCheck
};