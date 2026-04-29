import axiosInstance from '@/lib/axios';
import type { ApiWrapped, LoginPayload, LoginResponse, QuyenTacVuResponse } from '../types/auth.types';

export const authApi = {
  /**
   * POST /api/Auth/Login
   * Backend nhận JSON body { User, Pass }, refreshToken trả về qua HttpOnly cookie.
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    // Backend LibNetCore bọc response: { status: 200, data: LoginResponse, message: "Success" }
    const { data } = await axiosInstance.post<ApiWrapped<LoginResponse>>(
      '/Auth/Login',
      { User: payload.username, Pass: payload.password },
    );
    return data.data;
  },

  /**
   * POST /api/Auth/HeThong_RefreshToken
   * Authorization header (expired token OK) + refreshToken cookie → new access token (string).
   * _retry: true ở config ngăn interceptor 401 gọi lại endpoint này đệ quy.
   * Lưu ý: token refresh thực tế được xử lý bởi axios interceptor trong lib/axios.ts,
   * hàm này chỉ dùng nếu cần gọi thủ công.
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
   * Backend bọc trong ApiWrapped → cần unwrap data.data.
   */
  getQuyenTacVu: async (userId: number): Promise<QuyenTacVuResponse> => {
    const { data } = await axiosInstance.get<ApiWrapped<QuyenTacVuResponse>>(
      '/Auth/QuyenTacVu',
      { params: { id: userId } },
    );
    return data.data;
  },
};
