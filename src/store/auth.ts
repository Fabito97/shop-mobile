import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

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
          const storedToken = get().token || (await getAuthToken());
          if (storedToken) {
            set({ token: storedToken });
          }
        } catch {
          // ignore
        }
      },
    }),
    {
      name: 'dave_store_auth_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
