import axiosInstance from '@/lib/axios';
import type { ApiWrapped, LoginPayload, LoginResponse } from '../types/auth.types';

export const authApi = {
  /**
   * POST /api/Auth/Login?user={username}&pass={password}
   * Backend nhận query params, refreshToken trả về qua HttpOnly cookie.
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    // Backend LibNetCore bọc response: { status: 200, data: LoginResponse, message: "Success" }
    const { data } = await axiosInstance.post<ApiWrapped<LoginResponse>>(
      '/Auth/Login',
      null,
      { params: { user: payload.username, pass: payload.password } },
    );
    return data.data;
  },

  /**
   * POST /api/Auth/HeThong_RefreshToken
   * Authorization header (expired token OK) + refreshToken cookie → new access token (string).
   * _retry: true ở config ngăn interceptor 401 gọi lại endpoint này đệ quy.
   */
  refreshToken: async (): Promise<string> => {
    // Backend LibNetCore bọc response: { status: 200, data: "eyJ...", message: "Success" }
    const { data } = await axiosInstance.post<ApiWrapped<string>>(
      '/Auth/HeThong_RefreshToken',
      null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _retry: true } as any,
    );
    return data.data;
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

  /**
   * GET /api/Auth/QuyenTacVu?id={userId}
   * Lấy danh sách tác vụ được phân quyền cho người dùng (dùng để cập nhật sau khi phân quyền thay đổi).
   */
  getQuyenTacVu: async (userId: number): Promise<{ version: string; DSTacVu: string[] }> => {
    const { data } = await axiosInstance.get<{ version: string; DSTacVu: string[] }>(
      '/Auth/QuyenTacVu',
      { params: { id: userId } },
    );
    return data;
  },
};
