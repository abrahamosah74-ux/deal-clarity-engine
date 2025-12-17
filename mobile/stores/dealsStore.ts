// mobile/stores/dealsStore.ts
import { create } from 'zustand';
import { api } from '../services/api';

interface Deal {
  _id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  contact: any;
  expectedCloseDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface DealsState {
  deals: Deal[];
  selectedDeal: Deal | null;
  isLoading: boolean;
  error: string | null;
  filters: any;

  fetchDeals: (filters?: any) => Promise<void>;
  fetchDealById: (id: string) => Promise<void>;
  createDeal: (dealData: any) => Promise<void>;
  updateDeal: (id: string, dealData: any) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  setFilters: (filters: any) => void;
  clearError: () => void;
}

export const useDealsStore = create<DealsState>((set) => ({
  deals: [],
  selectedDeal: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchDeals: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.getDeals(filters);
      set({
        deals: response.data.deals,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch deals',
        isLoading: false,
      });
    }
  },

  fetchDealById: async (id: string) => {
    try {
      set({ isLoading: true });
      const response = await api.getDealById(id);
      set({
        selectedDeal: response.data.deal,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch deal',
        isLoading: false,
      });
    }
  },

  createDeal: async (dealData: any) => {
    try {
      set({ isLoading: true });
      const response = await api.createDeal(dealData);
      set((state) => ({
        deals: [response.data.deal, ...state.deals],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create deal',
        isLoading: false,
      });
      throw error;
    }
  },

  updateDeal: async (id: string, dealData: any) => {
    try {
      const response = await api.updateDeal(id, dealData);
      set((state) => ({
        deals: state.deals.map((d) =>
          d._id === id ? response.data.deal : d
        ),
        selectedDeal:
          state.selectedDeal?._id === id
            ? response.data.deal
            : state.selectedDeal,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update deal',
      });
      throw error;
    }
  },

  deleteDeal: async (id: string) => {
    try {
      await api.deleteDeal(id);
      set((state) => ({
        deals: state.deals.filter((d) => d._id !== id),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete deal',
      });
      throw error;
    }
  },

  setFilters: (filters: any) => {
    set({ filters });
  },

  clearError: () => {
    set({ error: null });
  },
}));
