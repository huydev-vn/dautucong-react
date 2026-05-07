import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginPayload, MenuItem, TacVuItem } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { STORAGE_KEYS } from '@/utils/constants';
import { tokenStore } from '@/lib/token-store';

// Normalize URL từ DB: cắt khoảng trắng, thêm dấu '/' đầu nếu thiếu
function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('/') ? trimmed : '/' + trimmed;
}

function normalizeMenu(items: MenuItem[]): MenuItem[] {
  return items.map((item) => ({
    ...item,
    Url: normalizeUrl(item.Url),
    Children: Array.isArray(item.Children) ? normalizeMenu(item.Children) : [],
  }));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      menu: [],
      dsTacVu: {},
      tacVuVersion: null,
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
        // accessToken lưu sessionStorage (xóa khi tab đóng, không persistent)
        tokenStore.set(res.accessToken);
        set({
          user: res.user,
          accessToken: res.accessToken,
          isAuthenticated: true,
          menu: normalizeMenu(res.Menu ?? []),
          dsTacVu: res.DSTacVu ?? {},
          tacVuVersion: res.version ?? null,
        });
      },

      logout: () => {
        const user = get().user;
        // Fire-and-forget: thu hồi refresh token phía server
        if (user?.Id) {
          authApi.logout(user.Id);
        }
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN); // dọn token cũ nếu còn sót
        tokenStore.clear();
        set({ user: null, accessToken: null, isAuthenticated: false, menu: [], dsTacVu: {}, tacVuVersion: null });
      },

      setUser: (user) => set({ user }),

      setQuyenTacVu: (version: string, dsTacVu: Record<string, TacVuItem[]>) =>
        set({ tacVuVersion: version, dsTacVu }),
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        // accessToken KHÔNG persist – lưu trong sessionStorage qua tokenStore
        isAuthenticated: state.isAuthenticated,
        menu: state.menu,
        dsTacVu: state.dsTacVu,
        tacVuVersion: state.tacVuVersion,
      }),
      // onRehydrateStorage KHÔNG được mutate state object trực tiếp sau khi
      // useSyncExternalStore đã dispatch snapshot – sẽ gây tearing + infinite loop.
      // Initialization được xử lý bởi AuthInitializer trong AppProvider.
    },
  ),
);
