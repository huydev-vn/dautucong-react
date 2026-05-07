import axios, { type AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/utils/constants';
import { tokenStore } from './token-store';

const HE_THONG_BASE_URL = import.meta.env.VITE_HE_THONG_API_URL ?? 'http://localhost:5281/api';
const NGHIEP_VU_BASE_URL = import.meta.env.VITE_NGHIEP_VU_API_URL ?? 'http://localhost:5282/api';

function createAxiosInstance(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 30_000,
    withCredentials: true, // cần thiết để browser gửi HttpOnly cookie (refreshToken)
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
}

export const heThongAxios = createAxiosInstance(HE_THONG_BASE_URL);
export const nghiepVuAxios = createAxiosInstance(NGHIEP_VU_BASE_URL);

// ── Shared state cho token refresh (dùng chung giữa 2 instances) ─────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

function handleSessionExpired() {
  tokenStore.clear();
  localStorage.removeItem(STORAGE_KEYS.USER);
  toast.error('Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.');
  window.location.replace('/login');
}

// ── Request interceptor: đính kèm access token ─────────────
function attachRequestInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use(
    (config) => {
      const token = tokenStore.get();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error),
  );
}

// ── Response interceptor: silent refresh on 401 ─────────────
function attachResponseInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
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
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token luôn gọi về HeThong (endpoint xác thực)
        // Backend LibNetCore bọc response: { status: 200, data: "eyJ...", message: "Success" }
        const { data: refreshResp } = await heThongAxios.post<{ status: number; data: string; message: string | null }>(
          '/Auth/HeThong_RefreshToken',
          null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { _retry: true } as any,
        );
        const newToken = refreshResp.data;

        tokenStore.set(newToken);
        // Cập nhật Authorization cho cả 2 instances
        heThongAxios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        nghiepVuAxios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return instance(originalRequest);
      } catch {
        processQueue(new Error('Session expired'), null);

        handleSessionExpired();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    },
  );
}

attachRequestInterceptor(heThongAxios);
attachRequestInterceptor(nghiepVuAxios);
attachResponseInterceptor(heThongAxios);
attachResponseInterceptor(nghiepVuAxios);

// Backward compat — các file dùng default import vẫn trỏ về heThongAxios
export const axiosInstance = heThongAxios;
export default heThongAxios;
