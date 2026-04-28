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
      // localStorage là đồng bộ → persist hydrate xong trước khi bất kỳ component nào render.
      // Không cần delay flag này; khởi tạo true để ProtectedRoute không bao giờ bị kẹt spinner.
      isInitialized: true,

      initialize: () => {
        set({ isInitialized: true });
      },

      login: async (payload: LoginPayload) => {
        const res = await authApi.login(payload);
        // Defensive check: nếu token không đúng format JWT → login thực sự thất bại
        if (!res?.accessToken || res.accessToken.split('.').length !== 3) {
          throw new Error(`Login response không hợp lệ. accessToken nhận được: "${res?.accessToken}"`);
        }
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
