import axios from 'axios';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/utils/constants';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  withCredentials: true, // cần thiết để browser gửi HttpOnly cookie (refreshToken)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor: đính kèm access token ─────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: silent refresh on 401 ─────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý 401 chưa từng retry (config._retry ngăn đệ quy vô hạn)
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Nếu đang refresh, xếp hàng đợi
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // _retry: true trên config của refresh call → nếu nó cũng 401, sẽ không retry tiếp
      // Backend LibNetCore bọc response: { status: 200, data: "eyJ...", message: "Success" }
      const { data: refreshResp } = await axiosInstance.post<{ status: number; data: string; message: string | null }>(
        '/Auth/HeThong_RefreshToken',
        null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { _retry: true } as any,
      );
      const newToken = refreshResp.data;

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      return axiosInstance(originalRequest);
    } catch (refreshError: unknown) {
      processQueue(new Error('Session expired'), null);

      // ── DEBUG: lưu lỗi vào sessionStorage để đọc lại sau khi page reload ──
      const axiosErr = refreshError as import('axios').AxiosError;
      const tokenSnapshot = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      sessionStorage.setItem('__auth_debug__', JSON.stringify({
        url: originalRequest.url,
        status: axiosErr?.response?.status ?? null,
        body: axiosErr?.response?.data ?? null,
        message: axiosErr?.message ?? null,
        token_in_storage: tokenSnapshot,                           // ← giá trị thực trong localStorage
        token_looks_like_jwt: typeof tokenSnapshot === 'string' && tokenSnapshot.split('.').length === 3,
        time: new Date().toISOString(),
      }));

      // Xóa cả access_token lẫn Zustand persisted state để tránh isAuthenticated: true stale
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      toast.error('Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.');
      window.location.replace('/login');
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
