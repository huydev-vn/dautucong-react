import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginPayload } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { STORAGE_KEYS } from '@/utils/constants';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,

      initialize: () => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
          set({ isInitialized: true });
          return;
        }
        // Token already rehydrated by persist middleware above
        set({ isInitialized: true });
      },

      login: async (payload: LoginPayload) => {
        const res = await authApi.login(payload);
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.refreshToken);
        set({
          user: res.user,
          accessToken: res.accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: STORAGE_KEYS.USER,
      // Chỉ persist những trường cần thiết
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // localStorage rehydrate sync – đánh dấu đã khởi tạo
        if (state) state.isInitialized = true;
      },
    },
  ),
);
