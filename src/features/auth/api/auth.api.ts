import axiosInstance from '@/lib/axios';
import type { LoginPayload, LoginResponse } from '../types/auth.types';

export const authApi = {
  /**
   * POST /api/Auth/Login?user={username}&pass={password}
   * Backend nhận query params, refreshToken trả về qua HttpOnly cookie.
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>(
      '/Auth/Login',
      null,
      { params: { user: payload.username, pass: payload.password } },
    );
    return data;
  },

  /**
   * POST /api/Auth/HeThong_RefreshToken
   * Authorization header (expired token OK) + refreshToken cookie → new access token (string).
   * _retry: true ở config ngăn interceptor 401 gọi lại endpoint này đệ quy.
   */
  refreshToken: async (): Promise<string> => {
    const { data } = await axiosInstance.post<string>(
      '/Auth/HeThong_RefreshToken',
      null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _retry: true } as any,
    );
    return data;
  },

  /**
   * POST /api/Auth/HeThong_RefreshToken_Revoke
   * Thu hồi refresh token khi logout.
   */
  logout: async (userId: string): Promise<void> => {
    await axiosInstance
      .post('/Auth/HeThong_RefreshToken_Revoke', { UserId: userId })
      .catch(() => {}); // ignore lỗi network khi logout
  },
};
