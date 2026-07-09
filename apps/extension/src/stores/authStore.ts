import { create } from 'zustand';
import { getStorageValue, setStorageValue, removeStorageValue } from '../utils/storage.js';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (token, user) => {
    await setStorageValue('token', token);
    await setStorageValue('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await removeStorageValue('token');
    await removeStorageValue('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const token = await getStorageValue('token');
      const userStr = await getStorageValue('user');
      let user: User | null = null;
      
      if (userStr) {
        try {
          user = typeof userStr === 'string' ? JSON.parse(userStr) : userStr;
        } catch (e) {
          console.error('Failed to parse user string', e);
        }
      }

      if (token && user) {
        set({ token, user, isAuthenticated: true, isInitialized: true });
      } else {
        set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
      }
    } catch (error) {
      console.error('Error during auth initialization:', error);
      set({ isInitialized: true });
    }
  }
}));
