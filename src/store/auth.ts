import { create } from 'zustand';
import { setAuthToken, clearAuthToken, getAuthToken } from '@/config/api';
import type { User } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setSession: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setSession: async (token, user) => {
    await setAuthToken(token);
    set({ token, user, isLoading: false });
  },

  logout: async () => {
    await clearAuthToken();
    set({ token: null, user: null, isLoading: false });
  },

  restoreSession: async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        set({ token: null, user: null, isLoading: false });
        return;
      }
      set({ token, isLoading: false });
    } catch {
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
