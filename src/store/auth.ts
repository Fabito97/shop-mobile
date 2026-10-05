import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken, getAuthToken } from '@/config/api';
import { AuthApi, type User } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
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
      isCheckingAuth: true,

      setSession: async (token, user) => {
        await setAuthToken(token);
        set({ token, user, isLoading: false, isCheckingAuth: false });
      },

      logout: async () => {
        await clearAuthToken();
        set({ token: null, user: null, isLoading: false, isCheckingAuth: false });
      },

      restoreSession: async () => {
        try {
          const storedToken = get().token || (await getAuthToken());
          if (storedToken) {
            set({ token: storedToken });
            try {
              const res = await AuthApi.verifyToken();
              if (res.data?.success && res.data.user) {
                set({ user: res.data.user, token: res.data.token || storedToken });
              } else if (res.status === 401) {
                await clearAuthToken();
                set({ token: null, user: null });
              }
            } catch {
              // Network error or offline - retain local cached session
            }
          }
        } catch {
          // ignore
        } finally {
          set({ isCheckingAuth: false });
        }
      },
    }),
    {
      name: 'dave_store_auth_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (!state?.token) {
          state?.restoreSession();
        }
      },
    }
  )
);
