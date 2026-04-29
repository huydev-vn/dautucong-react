import axios from 'axios';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/utils/constants';
import { tokenStore } from './token-store';

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
    const token = tokenStore.get();
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
      // Backend LibNetCore bọc response: { status: 200, data: "eyJ...", message: "Success" }
      const { data: refreshResp } = await axiosInstance.post<{ status: number; data: string; message: string | null }>(
        '/Auth/HeThong_RefreshToken',
        null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { _retry: true } as any,
      );
      const newToken = refreshResp.data;

      tokenStore.set(newToken);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      return axiosInstance(originalRequest);
    } catch {
      processQueue(new Error('Session expired'), null);

      // Xóa token và Zustand persisted state
      tokenStore.clear();
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
