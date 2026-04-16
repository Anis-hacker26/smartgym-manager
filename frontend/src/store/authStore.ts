import { create } from 'zustand';
import axios from 'axios';

// Fix: Remove /api from baseURL since it's already in the endpoint
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

interface User {
  id: string;
  mobileNumber: string;
  role: 'ADMIN' | 'MEMBER';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOTP: (mobileNumber: string, role: string) => Promise<void>;
  verifyOTP: (mobileNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setAuth: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  sendOTP: async (mobileNumber, role) => {
    await axios.post('/api/auth/send-otp', { mobileNumber, role });
  },

  verifyOTP: async (mobileNumber, otp) => {
    const response = await axios.post('/api/auth/verify-otp', { mobileNumber, otp });
    if (response.data.user) {
      set({ user: response.data.user, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
  },

  logout: async () => {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      set({ user: JSON.parse(storedUser), isAuthenticated: true, isLoading: false });
      return;
    }
    
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.user) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setAuth: (user: User) => {
    set({ user, isAuthenticated: true });
    localStorage.setItem('user', JSON.stringify(user));
  }
}));