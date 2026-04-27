import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginPayload } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { STORAGE_KEYS } from '@/utils/constants';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,

      initialize: () => {
        set({ isInitialized: true });
      },

      login: async (payload: LoginPayload) => {
        const res = await authApi.login(payload);
        // refreshToken không lưu localStorage – backend set qua HttpOnly cookie
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.accessToken);
        set({
          user: res.user,
          accessToken: res.accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        const user = get().user;
        // Fire-and-forget: thu hồi refresh token phía server
        if (user?.Id) {
          authApi.logout(user.Id);
        }
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // onRehydrateStorage KHÔNG được mutate state object trực tiếp sau khi
      // useSyncExternalStore đã dispatch snapshot – sẽ gây tearing + infinite loop.
      // Initialization được xử lý bởi AuthInitializer trong AppProvider.
    },
  ),
);
