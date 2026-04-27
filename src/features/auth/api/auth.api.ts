import axiosInstance from '@/lib/axios';
import type { LoginPayload, LoginResponse } from '../types/auth.types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await axiosInstance.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },

  getProfile: async () => {
    const { data } = await axiosInstance.get('/auth/profile');
    return data;
  },
};
